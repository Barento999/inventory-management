# RBAC Frontend System Usage Guide

This document explains how to use the Role-Based Access Control (RBAC) system in the frontend.

## Overview

The RBAC system provides a comprehensive permission checking system with the following components:

1. **Permission Utilities** (`utils/permissions.js`) - Core permission checking functions
2. **usePermissions Hook** (`hooks/usePermissions.js`) - React hook for permission checking
3. **ProtectedRoute Component** (`components/ProtectedRoute.jsx`) - Route-level protection
4. **Permission Button** (`components/PermissionButton.jsx`) - Button-level access control
5. **Conditional Rendering** (`components/IfPermission.jsx`) - Conditional UI rendering

## Permission Groups

All permissions are organized into groups for easier management:

```javascript
import { PERMISSION_GROUPS } from '@/utils/permissions';

PERMISSION_GROUPS.PRODUCTS.VIEW      // 'products_view'
PERMISSION_GROUPS.PRODUCTS.CREATE    // 'products_create'
PERMISSION_GROUPS.PRODUCTS.UPDATE    // 'products_update'
PERMISSION_GROUPS.PRODUCTS.DELETE    // 'products_delete'

PERMISSION_GROUPS.USERS.VIEW         // 'users_view'
PERMISSION_GROUPS.INVENTORY.ADJUST   // 'inventory_adjust'
// ... and many more
```

## Usage Examples

### 1. Check Single Permission

```javascript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { has } = usePermissions();
  
  if (!has('products_create')) {
    return <div>You cannot create products</div>;
  }
  
  return <div>Create product form</div>;
}
```

### 2. Check Any Permission

```javascript
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSION_GROUPS } from '@/utils/permissions';

function MyComponent() {
  const { hasAny } = usePermissions();
  
  // Check if user can either create or update products
  if (!hasAny([
    PERMISSION_GROUPS.PRODUCTS.CREATE,
    PERMISSION_GROUPS.PRODUCTS.UPDATE
  ])) {
    return <div>You cannot modify products</div>;
  }
  
  return <div>Modify product form</div>;
}
```

### 3. Check All Permissions

```javascript
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSION_GROUPS } from '@/utils/permissions';

function MyComponent() {
  const { hasAll } = usePermissions();
  
  // Check if user can both create and delete products
  if (!hasAll([
    PERMISSION_GROUPS.PRODUCTS.CREATE,
    PERMISSION_GROUPS.PRODUCTS.DELETE
  ])) {
    return <div>You need both create and delete permissions</div>;
  }
  
  return <div>Admin features</div>;
}
```

### 4. Resource-Based CRUD Checks

```javascript
import { usePermissions } from '@/hooks/usePermissions';

function ProductManagement() {
  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  
  if (!canView('products')) return null;
  
  return (
    <div>
      {canCreate('products') && <button>Create Product</button>}
      {canUpdate('products') && <button>Edit Product</button>}
      {canDelete('products') && <button>Delete Product</button>}
    </div>
  );
}
```

### 5. Role-Based Access

```javascript
import { usePermissions } from '@/hooks/usePermissions';

function AdminPanel() {
  const { hasRole } = usePermissions();
  
  if (!hasRole('admin')) {
    return <div>Only admins can access this</div>;
  }
  
  return <div>Admin dashboard</div>;
}
```

### 6. Protected Routes

```javascript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PERMISSION_GROUPS } from '@/utils/permissions';

<Routes>
  {/* Single permission check */}
  <Route
    path="/products"
    element={
      <ProtectedRoute permission={PERMISSION_GROUPS.PRODUCTS.VIEW}>
        <ProductList />
      </ProtectedRoute>
    }
  />
  
  {/* Multiple permissions (requires any) */}
  <Route
    path="/reports"
    element={
      <ProtectedRoute permission={[PERMISSION_GROUPS.REPORTS.VIEW, PERMISSION_GROUPS.SALES.VIEW]}>
        <Reports />
      </ProtectedRoute>
    }
  />
  
  {/* Multiple permissions (requires all) */}
  <Route
    path="/advanced"
    element={
      <ProtectedRoute 
        permission={[PERMISSION_GROUPS.PRODUCTS.VIEW, PERMISSION_GROUPS.INVENTORY.ADJUST]}
        requireAll={true}
      >
        <AdvancedFeatures />
      </ProtectedRoute>
    }
  />
  
  {/* Role-based routing */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute role="admin">
        <AdminPanel />
      </ProtectedRoute>
    }
  />
</Routes>
```

### 7. Permission Buttons

```javascript
import { PermissionButton } from '@/components/PermissionButton';
import { PERMISSION_GROUPS } from '@/utils/permissions';

function ProductForm() {
  return (
    <div>
      {/* Will be hidden if user doesn't have permission */}
      <PermissionButton
        permission={PERMISSION_GROUPS.PRODUCTS.CREATE}
        onClick={() => handleCreate()}
        variant="primary"
      >
        Create Product
      </PermissionButton>
      
      {/* Will be disabled instead of hidden */}
      <PermissionButton
        permission={PERMISSION_GROUPS.PRODUCTS.DELETE}
        onClick={() => handleDelete()}
        hidden={false}
        variant="danger"
      >
        Delete Product
      </PermissionButton>
      
      {/* Custom denial message */}
      <PermissionButton
        permission={PERMISSION_GROUPS.INVENTORY.ADJUST}
        denialToastMessage="Only managers can adjust inventory"
        onClick={() => handleAdjust()}
      >
        Adjust Inventory
      </PermissionButton>
    </div>
  );
}
```

### 8. Conditional Rendering

```javascript
import { IfPermission, If, IfElse } from '@/components/IfPermission';
import { PERMISSION_GROUPS } from '@/utils/permissions';

function Dashboard() {
  return (
    <div>
      {/* Simple conditional render */}
      <IfPermission permission={PERMISSION_GROUPS.REPORTS.VIEW}>
        <ReportsWidget />
      </IfPermission>
      
      {/* Simple conditional without fallback */}
      <If permission={PERMISSION_GROUPS.USERS.VIEW}>
        <UsersList />
      </If>
      
      {/* Conditional with fallback */}
      <IfPermission
        permission={PERMISSION_GROUPS.PRODUCTS.UPDATE}
        fallback={<div>Contact admin to edit products</div>}
      >
        <ProductEditor />
      </IfPermission>
      
      {/* If/else pattern */}
      <IfElse
        permission={PERMISSION_GROUPS.SETTINGS.UPDATE}
        children={<SettingsEditor />}
        fallback={<SettingsViewer />}
      />
    </div>
  );
}
```

### 9. Permission Utility Functions

```javascript
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  hasRoleOrHigher,
  getCRUDPermissions,
  getPermissionLabel,
  getRoleLabel,
  groupPermissionsByCategory,
  logPermissionDenial
} from '@/utils/permissions';

// Direct utility usage
const userPermissions = user.permissions;
const canEdit = hasPermission(userPermissions, 'products_update');

// Get CRUD permissions for a resource
const productCRUD = getCRUDPermissions(userPermissions, 'products');
// Returns: { canView: true, canCreate: true, canUpdate: false, canDelete: false }

// Get permission labels
const label = getPermissionLabel('products_create'); // 'Create Products'
const roleLabel = getRoleLabel('manager'); // 'Manager'

// Group permissions by category
const grouped = groupPermissionsByCategory(userPermissions);
// Returns: { PRODUCTS: [...], USERS: [...], etc }

// Manual logging for audit trail
logPermissionDenial({
  userId: user.id,
  action: 'delete_product',
  resource: 'products/123',
  permission: 'products_delete',
  reason: 'User attempted to delete protected product',
});
```

### 10. API Integration with Permission Checks

```javascript
import { usePermissions } from '@/hooks/usePermissions';
import { productsApi } from '@/services/api';
import { handlePermissionError } from '@/services/permissionInterceptor';

function ProductCreation() {
  const { has, getDenialMessage, logDenial } = usePermissions();
  const { addToast } = useToast();
  
  const handleCreate = async (productData) => {
    // Check permission before API call
    if (!has('products_create')) {
      addToast({
        title: 'Permission Denied',
        description: getDenialMessage('products_create'),
        type: 'error'
      });
      logDenial({
        action: 'create_product',
        resource: 'products'
      });
      return;
    }
    
    try {
      await productsApi.create(productData);
      addToast({ title: 'Product created', type: 'success' });
    } catch (error) {
      // Handle permission errors from API
      handlePermissionError(error, {
        action: 'create_product',
        resource: 'products'
      });
      addToast({
        title: 'Error',
        description: error.message,
        type: 'error'
      });
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreate(formData);
    }}>
      {/* form fields */}
    </form>
  );
}
```

## Role Hierarchy

The system supports role hierarchy:

```
viewer (1) < user (2) < staff (3) < manager (4) < admin (5)
```

Use `hasRoleOrHigher` to check if a user has at least a certain role:

```javascript
import { hasRoleOrHigher } from '@/utils/permissions';

// User with 'manager' role can access 'staff' features
hasRoleOrHigher('manager', 'staff'); // true

// User with 'user' role cannot access 'manager' features
hasRoleOrHigher('user', 'manager'); // false
```

## Audit Trail

Permission denials are automatically logged to local storage for auditing:

```javascript
import { getAuditTrail, clearAuditTrail } from '@/utils/permissions';

// Get all permission denial logs
const trail = getAuditTrail();
trail.forEach(entry => {
  console.log(`${entry.timestamp}: User ${entry.userId} denied ${entry.permission}`);
});

// Clear audit trail
clearAuditTrail();
```

## Best Practices

1. **Use Permission Groups**: Always use `PERMISSION_GROUPS` constants instead of hardcoding permission strings
2. **Check Early**: Check permissions as early as possible (in routes, before rendering)
3. **Log Denials**: Use `logDenial()` for important permission checks
4. **User-Friendly Messages**: Provide clear messages when actions are denied
5. **Consistent Patterns**: Use the same permission checking patterns throughout your app
6. **Hide vs Disable**: Use `hidden={true}` to hide features from users, `hidden={false}` to disable them
7. **Graceful Degradation**: Always provide fallback UI for users without permissions
8. **Test Permissions**: Test the app with different user roles regularly

## Common Permission Patterns

### Admin-Only Feature
```javascript
<ProtectedRoute permission={PERMISSION_GROUPS.USERS.CREATE}>
  <AdminFeature />
</ProtectedRoute>
```

### Manager and Above
```javascript
<IfPermission 
  role="manager"
  fallback={<div>Requires manager role or higher</div>}
>
  <ManagerFeature />
</IfPermission>
```

### Full Resource Management
```javascript
<IfPermission
  permission={[
    PERMISSION_GROUPS.PRODUCTS.CREATE,
    PERMISSION_GROUPS.PRODUCTS.UPDATE,
    PERMISSION_GROUPS.PRODUCTS.DELETE
  ]}
  fallback={<ViewOnlyProducts />}
>
  <FullProductManagement />
</IfPermission>
```

### Conditional Buttons in Form
```javascript
<form>
  <input type="text" {...} />
  
  <PermissionButton
    permission={PERMISSION_GROUPS.PRODUCTS.CREATE}
    type="submit"
    variant="primary"
  >
    Create
  </PermissionButton>
  
  <PermissionButton
    permission={PERMISSION_GROUPS.PRODUCTS.DELETE}
    type="button"
    variant="danger"
    onClick={handleDelete}
  >
    Delete
  </PermissionButton>
</form>
```

## Testing Permission Checks

To test the permission system:

1. **Log in as different users** with different roles
2. **Check the sidebar** - items should be hidden/shown based on permissions
3. **Try accessing protected routes** - should redirect if unauthorized
4. **Try clicking permission-controlled buttons** - should show toast if denied
5. **Check audit trail** - `getAuditTrail()` should show permission denial logs
6. **Use browser dev tools** - check localStorage for user permissions

## Troubleshooting

### Permissions Not Working
1. Ensure user data includes `permissions` array from AuthContext
2. Check that `getPermissionsForRole()` in AuthContext maps roles to correct permissions
3. Verify permission strings match exactly

### Sidebar Items Not Showing
1. Check that permission groups are correctly imported
2. Ensure navigation items have `permission` property set
3. Verify user role and permissions are loaded correctly

### Routes Not Protected
1. Ensure routes are wrapped with `<ProtectedRoute>`
2. Check that `redirect={true}` is set if you want automatic redirection
3. Verify fallback component is properly configured

## Advanced: Custom Permission Checks

You can create custom permission checking functions:

```javascript
// Custom hook for specific feature
export const useCanManageProducts = () => {
  const { hasAll } = usePermissions();
  return hasAll([
    PERMISSION_GROUPS.PRODUCTS.VIEW,
    PERMISSION_GROUPS.PRODUCTS.CREATE,
    PERMISSION_GROUPS.PRODUCTS.UPDATE,
  ]);
};

// Usage
function ProductManager() {
  const canManage = useCanManageProducts();
  if (!canManage) return null;
  return <ProductForm />;
}
```
