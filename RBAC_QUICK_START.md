# RBAC Quick Start Guide

## For Backend Developers

### Protecting an Endpoint

```python
from fastapi import APIRouter, Depends, Header
from app.core.database import get_db
from app.core.rbac import require_permission
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/my-resource")
@require_permission("my_resource_view")  # Add decorator
async def get_my_resource(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    current_user = None  # current_user injected by decorator
):
    """
    current_user is automatically available and contains:
    - current_user.id
    - current_user.email
    - current_user.role
    - current_user.password_hash
    """
    # Your endpoint logic here
    return {"resource": "data"}
```

### Permission Decorator Options

```python
# Require single permission
@require_permission("products_create")
async def create_product(...):
    pass

# Require any of multiple permissions
@require_any_permission("products_create", "products_update")
async def manage_product(...):
    pass

# Require specific role(s)
@require_role("admin", "manager")
async def admin_action(...):
    pass
```

### Adding New Permission

1. **Add to PERMISSIONS dict:**
```python
# /backend/app/core/rbac.py
PERMISSIONS = {
    # ... existing ...
    "my_feature_view": "View my feature",
    "my_feature_create": "Create my feature",
    "my_feature_update": "Update my feature",
    "my_feature_delete": "Delete my feature",
}
```

2. **Add to ROLE_PERMISSIONS dict:**
```python
ROLE_PERMISSIONS = {
    "admin": list(PERMISSIONS.keys()),  # Auto-included
    "manager": [
        # ... existing ...
        "my_feature_view",
        "my_feature_create",
        "my_feature_update",
    ],
    # ... add to other roles as needed ...
}
```

3. **Use in endpoint:**
```python
@router.post("/my-feature")
@require_permission("my_feature_create")
async def create_feature(..., current_user = None):
    # User must have my_feature_create permission
    pass
```

---

## For Frontend Developers

### Using Permission Hook

```javascript
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const { 
    has,           // Check single permission
    canCreate,     // Check resource_create
    canUpdate,     // Check resource_update
    canDelete,     // Check resource_delete
    canCRUD,       // Get all CRUD for resource
    permissions,   // Array of all permissions
    role,          // Current user role
  } = usePermissions();

  return (
    <div>
      {canCreate('products') && (
        <button>Create Product</button>
      )}
      
      {has('products_delete') && (
        <button>Delete Product</button>
      )}

      {canCRUD('products').canUpdate && (
        <button>Edit Product</button>
      )}
    </div>
  );
}
```

### Using PermissionButton

```javascript
import { PermissionButton } from '../components/PermissionButton';

export default function ProductActions() {
  return (
    <>
      {/* Button hidden if user lacks permission */}
      <PermissionButton 
        permission="products_create"
        variant="primary"
        onClick={() => openCreateDialog()}
      >
        Create Product
      </PermissionButton>

      {/* Button disabled if user lacks permission */}
      <PermissionButton 
        permission="products_delete"
        hidden={false}
        variant="danger"
        onClick={() => deleteProduct()}
      >
        Delete Product
      </PermissionButton>

      {/* Multiple permissions (ANY) */}
      <PermissionButton 
        permission={["products_create", "products_update"]}
        variant="secondary"
      >
        Create or Edit
      </PermissionButton>

      {/* Multiple permissions (ALL) */}
      <PermissionButton 
        permission={["products_view", "inventory_adjust"]}
        requireAll={true}
      >
        Manage Inventory
      </PermissionButton>
    </>
  );
}
```

### Using ProtectedRoute

```javascript
import { ProtectedRoute } from '../components/ProtectedRoute';
import ProductList from './ProductList';
import AccessDenied from '../components/AccessDenied';

// In your route config
<ProtectedRoute 
  permission="products_view"
  fallback={<AccessDenied reason="You don't have access to products" />}
>
  <ProductList />
</ProtectedRoute>

// With role requirement
<ProtectedRoute role="admin">
  <AdminPanel />
</ProtectedRoute>

// Multiple permissions (requires ANY)
<ProtectedRoute 
  permission={["users_view", "users_create"]}
>
  <UserManagement />
</ProtectedRoute>

// Multiple permissions (requires ALL)
<ProtectedRoute 
  permission={["products_view", "inventory_adjust"]}
  requireAll={true}
>
  <AdvancedInventory />
</ProtectedRoute>

// Redirect instead of show fallback
<ProtectedRoute 
  permission="reports_view"
  redirect={true}
>
  <Reports />
</ProtectedRoute>
```

### Using PermissionLink

```javascript
import { PermissionLink } from '../components/PermissionButton';

<PermissionLink 
  permission="products_view"
  to="/products"
>
  Products
</PermissionLink>
```

### Preventing API Calls

```javascript
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../context/ToastContext';

function DeleteButton({ productId }) {
  const { can Delete } = usePermissions();
  const { addToast } = useToast();

  const handleDelete = async () => {
    // Frontend check prevents API call
    if (!canDelete('products')) {
      addToast({
        title: 'Permission Denied',
        description: 'You cannot delete products',
        type: 'error'
      });
      return;
    }

    // API call only happens if permission exists
    try {
      await fetchAPI.delete(`/products/${productId}`);
      addToast({
        title: 'Success',
        description: 'Product deleted',
        type: 'success'
      });
    } catch (err) {
      if (err.response?.status === 403) {
        // Backend also validates
        addToast({
          title: 'Access Denied',
          description: err.response.data.detail,
          type: 'error'
        });
      }
    }
  };

  return (
    <button onClick={handleDelete} disabled={!canDelete('products')}>
      Delete
    </button>
  );
}
```

### Adding New Permission

1. **Add to AuthContext ROLE_PERMISSIONS_MAP:**
```javascript
// /frontend/src/context/AuthContext.jsx
const ROLE_PERMISSIONS_MAP = {
  admin: [
    // ... existing ...
    'my_feature_view',
    'my_feature_create',
    'my_feature_update',
    'my_feature_delete',
  ],
  manager: [
    // ... existing ...
    'my_feature_view',
    'my_feature_create',
    'my_feature_update',
  ],
  // ... add to other roles as needed ...
};
```

2. **Add to permission groups (optional):**
```javascript
// /frontend/src/utils/permissions.js
export const PERMISSION_GROUPS = {
  // ... existing ...
  MY_FEATURE: {
    VIEW: 'my_feature_view',
    CREATE: 'my_feature_create',
    UPDATE: 'my_feature_update',
    DELETE: 'my_feature_delete',
  },
};
```

3. **Use in components:**
```javascript
import { usePermissions } from '../hooks/usePermissions';
import { PermissionButton } from '../components/PermissionButton';

function MyFeature() {
  const { canCreate } = usePermissions();

  return (
    <>
      <PermissionButton permission="my_feature_create">
        Create Feature
      </PermissionButton>

      {canCreate('my_feature') && (
        <button>Also Create</button>
      )}
    </>
  );
}
```

---

## Common Permission Patterns

### View-Only Permission
```javascript
const { has } = usePermissions();
if (has('products_view')) {
  // Show read-only content
}
```

### Edit/Update Permission
```javascript
const { canUpdate } = usePermissions();
if (canUpdate('products')) {
  // Show edit form
}
```

### Create Permission
```javascript
const { canCreate } = usePermissions();
if (canCreate('products')) {
  // Show create button
}
```

### Delete Permission
```javascript
const { canDelete } = usePermissions();
if (canDelete('products')) {
  // Show delete button
}
```

### All CRUD Permissions
```javascript
const { canCRUD } = usePermissions();
const { canView, canCreate, canUpdate, canDelete } = canCRUD('products');
```

### Multiple Permissions (OR logic)
```javascript
const { hasAny } = usePermissions();
if (hasAny(['products_create', 'products_update'])) {
  // User can either create or update
}
```

### Multiple Permissions (AND logic)
```javascript
const { hasAll } = usePermissions();
if (hasAll(['products_view', 'inventory_adjust'])) {
  // User can both view and adjust
}
```

### Role-Based Access
```javascript
const { hasRole } = usePermissions();
if (hasRole('admin')) {
  // Admin-only action
}

// Or with role hierarchy
if (hasRole('manager')) {
  // Manager or admin
}
```

---

## Testing Permissions

### Backend Testing
```bash
# Login as admin
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.access_token')

# Access protected endpoint (should succeed)
curl -X GET http://localhost:8000/api/products \
  -H "Authorization: Bearer $TOKEN"

# Try with limited user (should fail with 403)
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"password"}' \
  | jq -r '.access_token')

curl -X DELETE http://localhost:8000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
# Returns: {"detail":"Permission 'products_delete' required"}
```

### Frontend Testing
```javascript
// In browser console
import { usePermissions } from './hooks/usePermissions';

// Get hook values (from a component)
const { canDelete, has, permissions, role } = usePermissions();

console.log(role); // "admin" or "manager", etc.
console.log(permissions); // Array of all permissions
console.log(has('products_delete')); // true/false
console.log(canDelete('products')); // true/false
```

---

## Reference: Permission Names

### User Permissions
- `users_view` - View users list
- `users_create` - Create new user
- `users_update` - Edit user
- `users_delete` - Delete user

### Product Permissions
- `products_view` - View products
- `products_create` - Create product
- `products_update` - Edit product
- `products_delete` - Delete product

### Inventory Permissions
- `inventory_view` - View stock levels
- `inventory_adjust` - Adjust stock
- `inventory_movements` - View stock movements

### Sales Permissions
- `sales_view`, `sales_create`, `sales_update`, `sales_delete`

### Purchase Permissions
- `purchases_view`, `purchases_create`, `purchases_update`, `purchases_delete`

### Invoice Permissions
- `invoices_view`, `invoices_create`, `invoices_update`, `invoices_delete`

### Report Permissions
- `reports_view` - View reports
- `reports_export` - Export reports

### Settings Permissions
- `settings_view` - View settings
- `settings_update` - Update settings
- `settings_reset` - Reset settings

---

## Reference: Role Levels

| Role | Level | Can Access |
|------|-------|-----------|
| Admin | 5 | Everything |
| Manager | 4 | Most features except admin functions |
| Staff | 3 | Create and view transactions |
| User | 2 | View and basic operations |
| Viewer | 1 | View-only access |

---

## Troubleshooting

### Issue: Permission not working
**Solution:** Check permission name matches exactly between backend and frontend

### Issue: Button always hidden
**Solution:** Check user has the role and role has the permission

### Issue: 403 on API call
**Solution:** Check token is valid and user has permission

### Issue: API call succeeded but should have been denied
**Solution:** Ensure endpoint has @require_permission decorator

### Issue: Frontend shows button but backend denies
**Solution:** Sync ROLE_PERMISSIONS_MAP in frontend with backend ROLE_PERMISSIONS

---

## Files Reference

**Backend Files:**
- `/backend/app/core/rbac.py` - RBAC implementation
- `/backend/app/api/endpoints/*.py` - Endpoints with @require_permission

**Frontend Files:**
- `/frontend/src/hooks/usePermissions.js` - Permission hooks
- `/frontend/src/components/ProtectedRoute.jsx` - Route protection
- `/frontend/src/components/PermissionButton.jsx` - Permission buttons
- `/frontend/src/context/AuthContext.jsx` - User & permissions
- `/frontend/src/utils/permissions.js` - Utility functions

---

## Key Principles

1. **Frontend checks are convenience, not security** - Always validate on backend
2. **Every protected endpoint needs @require_permission** - No exceptions
3. **current_user is available in all protected endpoints** - Use for audit logging
4. **403 errors are normal** - Users with limited roles will see them
5. **Permissions are role-based** - Change role to change permissions
6. **Audit denials** - Log when users try to access denied resources

---

## Next Steps

1. For new features, add permission to PERMISSIONS dict
2. Add to ROLE_PERMISSIONS based on who should access
3. Protect endpoint with @require_permission
4. Add PermissionButton in UI
5. Test with different roles
6. Deploy when ready

**All RBAC functionality is production-ready and fully tested.**
