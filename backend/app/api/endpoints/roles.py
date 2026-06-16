from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_permission, require_role, check_permission, check_role
from app.models import Role, User

router = APIRouter()


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[str] = None


class RoleSchema(RoleBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/")
@require_permission("roles_view")
@require_role("admin")
async def list_roles(
    current_user: User = Depends(check_role("admin")),
    db: Session = Depends(get_db)
):
    """Get all roles"""
    roles = db.query(Role).all()
    
    # Convert to dict manually
    roles_data = [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "permissions": r.permissions
        }
        for r in roles
    ]
    
    return roles_data


@router.get("/{role_id}")
@require_permission("roles_view")
@require_role("admin")
async def get_role(
    role_id: int,
    current_user: User = Depends(check_role("admin")),
    db: Session = Depends(get_db)
):
    """Get a specific role"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return {
        "id": role.id,
        "name": role.name,
        "description": role.description,
        "permissions": role.permissions
    }


@router.post("")
@require_permission("roles_create")
@require_role("admin")
async def create_role(
    role: RoleCreate,
    current_user: User = Depends(check_role("admin")),
    db: Session = Depends(get_db)
):
    """Create a new role"""
    db_role = Role(**role.dict())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    
    return {
        "id": db_role.id,
        "name": db_role.name,
        "description": db_role.description,
        "permissions": db_role.permissions
    }


@router.put("/{role_id}")
@require_permission("roles_update")
@require_role("admin")
async def update_role(
    role_id: int,
    role: RoleUpdate,
    current_user: User = Depends(check_role("admin")),
    db: Session = Depends(get_db)
):
    """Update a role"""
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    update_data = role.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_role, key, value)
    
    db.commit()
    db.refresh(db_role)
    
    return {
        "id": db_role.id,
        "name": db_role.name,
        "description": db_role.description,
        "permissions": db_role.permissions
    }


@router.delete("/{role_id}")
@require_permission("roles_delete")
@require_role("admin")
async def delete_role(
    role_id: int,
    current_user: User = Depends(check_role("admin")),
    db: Session = Depends(get_db)
):
    """Delete a role"""
    db_role = db.query(Role).filter(Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    db.delete(db_role)
    db.commit()
    
    return {"message": "Role deleted successfully"}
