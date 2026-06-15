from functools import wraps
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import verify_token
from app.models import User, Role


# Permission constants
PERMISSIONS = {
    # User management
    "users_view": "View users",
    "users_create": "Create users",
    "users_update": "Update users",
    "users_delete": "Delete users",
    
    # Product management
    "products_view": "View products",
    "products_create": "Create products",
    "products_update": "Update products",
    "products_delete": "Delete products",
    
    # Category management
    "categories_view": "View categories",
    "categories_create": "Create categories",
    "categories_update": "Update categories",
    "categories_delete": "Delete categories",
    
    # Warehouse management
    "warehouses_view": "View warehouses",
    "warehouses_create": "Create warehouses",
    "warehouses_update": "Update warehouses",
    "warehouses_delete": "Delete warehouses",
    
    # Customer management
    "customers_view": "View customers",
    "customers_create": "Create customers",
    "customers_update": "Update customers",
    "customers_delete": "Delete customers",
    
    # Supplier management
    "suppliers_view": "View suppliers",
    "suppliers_create": "Create suppliers",
    "suppliers_update": "Update suppliers",
    "suppliers_delete": "Delete suppliers",
    
    # Sales management
    "sales_view": "View sales",
    "sales_create": "Create sales",
    "sales_update": "Update sales",
    "sales_delete": "Delete sales",
    
    # Purchase management
    "purchases_view": "View purchases",
    "purchases_create": "Create purchases",
    "purchases_update": "Update purchases",
    "purchases_delete": "Delete purchases",
    
    # Inventory management
    "inventory_view": "View inventory",
    "inventory_adjust": "Adjust inventory",
    "inventory_movements": "View stock movements",
    
    # Settings management
    "settings_view": "View settings",
    "settings_update": "Update settings",
    "settings_reset": "Reset settings",
    
    # Reports
    "reports_view": "View reports",
    "reports_export": "Export reports",
    
    # Financial
    "invoices_view": "View invoices",
    "invoices_create": "Create invoices",
    "invoices_update": "Update invoices",
    "invoices_delete": "Delete invoices",
    "returns_view": "View returns",
    "returns_create": "Create returns",
    "returns_update": "Update returns",
    "returns_delete": "Delete returns",
    
    # Advanced features
    "serial_numbers_view": "View serial numbers",
    "serial_numbers_create": "Create serial numbers",
    "serial_numbers_update": "Update serial numbers",
    "serial_numbers_delete": "Delete serial numbers",
    "batches_view": "View batches",
    "batches_create": "Create batches",
    "batches_update": "Update batches",
    "batches_delete": "Delete batches",
    "audit_logs_view": "View audit logs",
    "roles_view": "View roles",
    "roles_create": "Create roles",
    "roles_update": "Update roles",
    "roles_delete": "Delete roles",
}

# Role permission mappings
ROLE_PERMISSIONS = {
    "admin": list(PERMISSIONS.keys()),  # Admin has all permissions
    "manager": [
        "users_view", "users_create", "users_update",
        "products_view", "products_create", "products_update",
        "categories_view", "categories_create", "categories_update",
        "warehouses_view", "warehouses_create", "warehouses_update",
        "customers_view", "customers_create", "customers_update",
        "suppliers_view", "suppliers_create", "suppliers_update",
        "sales_view", "sales_create", "sales_update",
        "purchases_view", "purchases_create", "purchases_update",
        "inventory_view", "inventory_adjust", "inventory_movements",
        "settings_view", "settings_update",
        "reports_view", "reports_export",
        "invoices_view", "invoices_create", "invoices_update",
        "returns_view", "returns_create", "returns_update",
        "serial_numbers_view", "serial_numbers_create", "serial_numbers_update",
        "batches_view", "batches_create", "batches_update",
        "audit_logs_view",
    ],
    "staff": [
        "products_view",
        "categories_view",
        "warehouses_view",
        "customers_view",
        "suppliers_view",
        "sales_view", "sales_create",
        "purchases_view",
        "inventory_view",
        "reports_view",
        "invoices_view",
        "serial_numbers_view",
        "batches_view",
    ],
    "user": [
        "products_view",
        "categories_view",
        "warehouses_view",
        "customers_view",
        "suppliers_view",
        "sales_view",
        "purchases_view",
        "inventory_view",
        "reports_view",
        "invoices_view",
    ],
    "viewer": [
        "products_view",
        "categories_view",
        "warehouses_view",
        "customers_view",
        "suppliers_view",
        "sales_view",
        "purchases_view",
        "inventory_view",
        "reports_view",
        "invoices_view",
    ],
}


def get_user_permissions(user_role: str, db: Session) -> List[str]:
    """Get permissions for a user based on their role"""
    # First check if role has predefined permissions
    if user_role in ROLE_PERMISSIONS:
        return ROLE_PERMISSIONS[user_role]
    
    # If not in predefined roles, check database for custom role
    role = db.query(Role).filter(Role.name == user_role).first()
    if role and role.permissions:
        import json
        try:
            return json.loads(role.permissions)
        except:
            return []
    
    # Default to empty permissions if role not found
    return []


def has_permission(user_permissions: List[str], required_permission: str) -> bool:
    """Check if user has the required permission"""
    return required_permission in user_permissions


def has_any_permission(user_permissions: List[str], required_permissions: List[str]) -> bool:
    """Check if user has any of the required permissions"""
    return any(perm in user_permissions for perm in required_permissions)


def require_permission(permission: str):
    """Decorator to require a specific permission for an endpoint"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, authorization: str = None, db: Session = Depends(get_db), **kwargs):
            # Get user from token
            if not authorization:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authorization header missing"
                )
            
            token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
            payload = verify_token(token)
            if not payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Get user permissions
            user_permissions = get_user_permissions(user.role, db)
            
            # Check if user has required permission
            if not has_permission(user_permissions, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission '{permission}' required"
                )
            
            # Add user to kwargs for use in the endpoint
            kwargs['current_user'] = user
            return await func(*args, db=db, **kwargs)
        
        return wrapper
    return decorator


def require_any_permission(*permissions: str):
    """Decorator to require any of the specified permissions for an endpoint"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, authorization: str = None, db: Session = Depends(get_db), **kwargs):
            # Get user from token
            if not authorization:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authorization header missing"
                )
            
            token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
            payload = verify_token(token)
            if not payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Get user permissions
            user_permissions = get_user_permissions(user.role, db)
            
            # Check if user has any of the required permissions
            if not has_any_permission(user_permissions, list(permissions)):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"One of permissions {permissions} required"
                )
            
            # Add user to kwargs for use in the endpoint
            kwargs['current_user'] = user
            return await func(*args, db=db, **kwargs)
        
        return wrapper
    return decorator


def require_role(*roles: str):
    """Decorator to require specific role(s) for an endpoint"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, authorization: str = None, db: Session = Depends(get_db), **kwargs):
            # Get user from token
            if not authorization:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authorization header missing"
                )
            
            token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
            payload = verify_token(token)
            if not payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Check if user has required role
            if user.role not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"One of roles {roles} required"
                )
            
            # Add user to kwargs for use in the endpoint
            kwargs['current_user'] = user
            return await func(*args, db=db, **kwargs)
        
        return wrapper
    return decorator
