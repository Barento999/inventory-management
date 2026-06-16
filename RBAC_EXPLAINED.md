# 🔐 RBAC (Role-Based Access Control) - Explained

## What is RBAC?

**RBAC** = **Role-Based Access Control**

It's a security system that controls **who can do what** in your application based on their **role**.

Think of it like a company hierarchy:
- **Admin** - Can do everything
- **Manager** - Can manage most things but not delete users
- **Staff** - Can view and create but not delete
- **Viewer** - Can only view

---

## How It Works in Your System

### 1. User Roles

Each user has ONE role assigned:

```python
# In your database, each user has:
user = {
    "id": 1,
    "email": "john@inventory.com",
    "role": "manager"  # ← This determines permissions
}
```

### 2. Permissions

Each permission is tied to an action on a resource:

```python
PERMISSIONS = {
    "products_view": "View products",      # Can see product list
    "products_create": "Create products",  # Can add new products
    "products_update": "Update products",  # Can edit products
    "products_delete": "Delete products",  # Can remove products
    # ... and many more
}
```

### 3. Role → Permissions Mapping

Each role gets a set of permissions:

```python
ROLE_PERMISSIONS = {
    "admin": [
        # Admin gets ALL permissions
        "users_view", "users_create", "users_update", "users_delete",
        "products_view", "products_create", "products_update", "products_delete",
        # ... etc
    ],
    
    "manager": [
        # Manager gets most but not all
        "users_view", "users_create", "users_update",  # Can't delete users
        "products_view", "products_create", "products_update",
        "sales_view", "sales_create", "sales_update",
        # ... etc (no delete operations)
    ],
    
    "user": [
        # Regular user can view and sometimes create
        "products_view",
        "sales_view", "sales_create",
        "reports_view",
        # ... basic operations only
    ]
}
```

### 4. Protection with Decorators

API endpoints are protected using decorators:

```python
@router.get("/products")
@require_permission("products_view")  # ← Only users with this permission
async def list_products(current_user, db):
    # This code only runs if current_user has "products_view" permission
    return db.query(Product).all()

@router.delete("/products/{id}")
@require_permission("products_delete")  # ← Only admins/managers can delete
async def delete_product(product_id: int, current_user, db):
    # This code only runs if current_user has "products_delete" permission
    product = db.query(Product).filter(Product.id == product_id).first()
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
```

---

## Permission Structure

### View Permissions
```
products_view     - Can see all products
customers_view    - Can see all customers
suppliers_view    - Can see all suppliers
sales_view        - Can see all sales
```

### Create Permissions
```
products_create   - Can add new products
customers_create  - Can add new customers
sales_create      - Can create new sales
```

### Update Permissions
```
products_update   - Can edit products
customers_update  - Can edit customers
sales_update      - Can modify sales
```

### Delete Permissions
```
products_delete   - Can remove products (usually admin only)
customers_delete  - Can delete customers
sales_delete      - Can remove sales
```

### Special Permissions
```
reports_view      - Can access dashboard/reports
audit_logs_view   - Can see system logs
settings_update   - Can change system settings
inventory_adjust  - Can manually adjust stock levels
```

---

## Your System's Roles

### 1. Admin ✅
**Can**: Do EVERYTHING
```
All 60+ permissions granted
- Create/Edit/Delete users
- Create/Edit/Delete products
- Manage settings
- View all reports
- Delete any record
```

### 2. Manager ✅
**Can**: Manage operations but not users
```
Most permissions EXCEPT:
- Can't delete users
- Can't delete settings
- Can create/edit but not always delete
- Can view all reports
- Can adjust inventory
```

### 3. User ✅
**Can**: View and create basic records
```
Limited to:
- View products
- View customers
- View suppliers
- Create sales
- View reports
- BUT can't delete anything
```

### 4. Staff (Optional)
**Can**: Similar to User but more restricted
```
View-only access with some create permissions
- View products
- View inventory
- Can't create sales
- Can't modify anything
```

---

## How Permission Check Works

### Step 1: User Makes Request
```
GET /api/products (user logs in as "manager")
Authorization: Bearer <jwt_token>
```

### Step 2: Extract User from Token
```python
# Decode JWT token
payload = verify_token(token)
user_id = payload["user_id"]

# Get user from database
user = db.query(User).filter(User.id == user_id).first()
# user.role = "manager"
```

### Step 3: Check Permission
```python
@require_permission("products_view")  # Checking this permission
async def list_products(current_user):
    # Get manager's permissions
    permissions = ROLE_PERMISSIONS["manager"]
    
    # Check: does "manager" role have "products_view"?
    if "products_view" in permissions:
        # ✅ YES - allow request
        return db.query(Product).all()
    else:
        # ❌ NO - deny with 403 Forbidden
        raise HTTPException(status_code=403, detail="Permission denied")
```

### Step 4: Return Response
```
✅ If allowed: Returns the data (200 OK)
❌ If denied: Returns error (403 Forbidden)
```

---

## Real-World Example Flow

### Scenario: Manager tries to delete a user

```
1. Manager clicks "Delete User" button
   └─ Sends: DELETE /api/users/5
   
2. Backend receives request
   └─ Checks: Does manager have "users_delete" permission?
   
3. Check ROLE_PERMISSIONS:
   ✅ admin      → has users_delete
   ❌ manager    → does NOT have users_delete
   ❌ user       → does NOT have users_delete
   
4. DENIED! Return error:
   {
     "detail": "Permission 'users_delete' required",
     "status_code": 403
   }
   
5. Frontend shows error message
   └─ "You don't have permission to delete users"
```

### Scenario: Admin deletes a user

```
1. Admin clicks "Delete User" button
   └─ Sends: DELETE /api/users/5
   
2. Backend receives request
   └─ Checks: Does admin have "users_delete" permission?
   
3. Check ROLE_PERMISSIONS:
   ✅ admin → has users_delete ✓
   
4. ALLOWED! Execute deletion
   └─ User deleted from database
   
5. Return success:
   {
     "message": "User deleted successfully"
   }
```

---

## Current Users in Your System

Test these credentials to see RBAC in action:

| Email | Password | Role | Can Do |
|-------|----------|------|--------|
| admin@inventory.com | Admin@123 | admin | Everything |
| manager@inventory.com | Manager@123 | manager | Most things |
| user@inventory.com | User@123 | user | View + Create |

---

## Adding New Permissions

Want to add a new permission? Follow this pattern:

### Step 1: Add Permission Definition
```python
PERMISSIONS = {
    # ... existing permissions ...
    "reports_export": "Export reports to CSV",  # NEW
}
```

### Step 2: Assign to Roles
```python
ROLE_PERMISSIONS = {
    "admin": [
        # ... other permissions ...
        "reports_export",  # NEW - admin can export
    ],
    "manager": [
        # ... other permissions ...
        "reports_export",  # NEW - manager can export
    ],
    "user": [
        # ... other permissions ...
        # NOT including "reports_export" - users can't export
    ],
}
```

### Step 3: Protect the Endpoint
```python
@router.post("/reports/export")
@require_permission("reports_export")  # NEW - require permission
async def export_report(current_user, db):
    # Only admin and manager can reach here
    return generate_csv_report(db)
```

---

## Changing User Roles

To change a user's role (requires admin access):

```bash
# Update user's role in database
UPDATE users SET role = 'manager' WHERE id = 5;

# OR via API (if endpoint exists)
PUT /api/users/5
{
  "role": "manager"
}
```

The user's permissions change immediately on next login!

---

## Security Features

✅ **Permissions are server-side** - Can't be faked by frontend
✅ **JWT tokens are validated** - Can't use someone else's token
✅ **Permissions checked on every request** - No bypass possible
✅ **Granular control** - Can have many fine-grained permissions
✅ **Audit trail** - Can log who accessed what

---

## Summary

**RBAC in your system means:**

1. Every user has a role (admin, manager, user, staff)
2. Every role has specific permissions
3. Every API endpoint requires specific permission(s)
4. Server checks permission before allowing action
5. Unauthorized access returns 403 Forbidden error

This keeps your data **secure** and **organized**! 🔐

---

**Need to modify RBAC?** Edit `/backend/app/core/rbac.py`
