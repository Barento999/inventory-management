# RBAC Quick Reference

Quick lookup for common RBAC patterns and APIs.

## Import Statements

```javascript
// Core utilities
import { PERMISSION_GROUPS } from '@/utils/permissions';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  logPermissionDenial 
} from '@/utils/permissions';

// Hooks
import { usePermissions, useHasPermission, useHasRole, useUserRole } from '@/hooks/usePermissions';

// Components
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionButton } from '@/components/PermissionButton';
import { IfPermission, If, IfElse } from '@/components/IfPermission';

// API
import { withPermissionCheck } from '@/services/permissionInterceptor';
import { isPermissionError, getErrorMessage } from '@/services/permissionInterceptor';

// Context
import { useAuth } from '@/context/AuthContext';
```

## Permission Groups Reference

```javascript
PERMISSION_GROUPS.PRODUCTS.VIEW
PERMISSION_GROUPS.PRODUCTS.CREATE
PERMISSION_GROUPS.PRODUCTS.UPDATE
PERMISSION_GROUPS.PRODUCTS.DELETE

PERMISSION_GROUPS.USERS.VIEW
PERMISSION_GROUPS.USERS.CREATE
PERMISSION_GROUPS.USERS.UPDATE
PERMISSION_GROUPS.USERS.DELETE

PERMISSION_GROUPS.INVENTORY.VIEW
PERMISSION_GROUPS.INVENTORY.ADJUST
PERMISSION_GROUPS.INVENTORY.MOVEMENTS

PERMISSION_GROUPS.SALES.VIEW
PERMISSION_GROUPS.SALES.CREATE
PERMISSION_GROUPS.SALES.UPDATE
PERMISSION_GROUPS.SALES.DELETE

PERMISSION_GROUPS.PURCHASES.VIEW
PERMISSION_GROUPS.PURCHASES.CREATE
PERMISSION_GROUPS.PURCHASES.UPDATE
PERMISSION_GROUPS.PURCHASES.DELETE

PERMISSION_GROUPS.CUSTOMERS.VIEW
PERMISSION_GROUPS.CUSTOMERS.CREATE
PERMISSION_GROUPS.CUSTOMERS.UPDATE
PERMISSION_GROUPS.CUSTOMERS.DELETE

PERMISSION_GROUPS.SUPPLIERS.VIEW
PERMISSION_GROUPS.SUPPLIERS.CREATE
PERMISSION_GROUPS.SUPPLIERS.UPDATE
PERMISSION_GROUPS.SUPPLIERS.DELETE

PERMISSION_GROUPS.INVOICES.VIEW
PERMISSION_GROUPS.INVOICES.CREATE
PERMISSION_GROUPS.INVOICES.UPDATE
PERMISSION_GROUPS.INVOICES.DELETE

PERMISSION_GROUPS.RETURNS.VIEW
PERMISSION_GROUPS.RETURNS.CREATE
PERMISSION_GROUPS.RETURNS.UPDATE
PERMISSION_GROUPS.RETURNS.DELETE

PERMISSION_GROUPS.CATEGORIES.VIEW
PERMISSION_GROUPS.CATEGORIES.CREATE
PERMISSION_GROUPS.CATEGORIES.UPDATE
PERMISSION_GROUPS.CATEGORIES.DELETE

PERMISSION_GROUPS.WAREHOUSES.VIEW
PERMISSION_GROUPS.WAREHOUSES.CREATE
PERMISSION_GROUPS.WAREHOUSES.UPDATE
PERMISSION_GROUPS.WAREHOUSES.DELETE

PERMISSION_GROUPS.SERIAL_NUMBERS.VIEW
PERMISSION_GROUPS.SERIAL_NUMBERS.CREATE
PERMISSION_GROUPS.SERIAL_NUMBERS.UPDATE
PERMISSION_GROUPS.SERIAL_NUMBERS.DELETE

PERMISSION_GROUPS.BATCHES.VIEW
PERMISSION_GROUPS.BATCHES.CREATE
PERMISSION_GROUPS.BATCHES.UPDATE
PERMISSION_GROUPS.BATCHES.DELETE

PERMISSION_GROUPS.SETTINGS.VIEW
PERMISSION_GROUPS.SETTINGS.UPDATE
PERMISSION_GROUPS.SETTINGS.RESET

PERMISSION_GROUPS.REPORTS.VIEW
PERMISSION_GROUPS.REPORTS.EXPORT

PERMISSION_GROUPS.AUDIT_LOGS.VIEW

PERMISSION_GROUPS.ROLES.VIEW
PERMISSION_GROUPS.ROLES.CREATE
PERMISSION_GROUPS.ROLES.UPDATE
PERMISSION_GROUPS.ROLES.DELETE
```

## usePermissions Hook API

```javascript
const {
  permissions,           // array of permission strings
  role,                  // current user role
  has,                   // (perm: string) => boolean
  hasAny,                // (perms: string[]) => boolean
  hasAll,                // (perms: string[]) => boolean
  hasRole,               // (role: string) => boolean
  canView,               // (resource: string) => boolean
  canCreate,             // (resource: string) => boolean
  canUpdate,             // (resource: string) => boolean
  canDelete,             // (resource: string) => boolean
  canCRUD,               // (resource: string) => {canView, canCreate, canUpdate, canDelete}
  getDenialMessage,      // (permission: string) => string
  logDenial,             // (options: object) => void
  constraints            // {canViewUsers, canManageUsers, ...}
} = usePermissions();
```

## Common Patterns

### Check Single Permission
```javascript
const { has } = usePermissions();
if (has('products_create')) { /* render */ }
```

### Check Multiple Permissions (any)
```javascript
const { hasAny } = usePermissions();
if (hasAny(['products_create', 'products_update'])) { /* render */ }
```

### Check All Permissions
```javascript
const { hasAll } = usePermissions();
if (hasAll(['products_view', 'products_create'])) { /* render */ }
```

### CRUD Permissions for Resource
```javascript
const { canView, canCreate, canUpdate, canDelete } = usePermissions();
if (canView('products')) { /* render list */ }
if (canCreate('products')) { /* show create button */ }
```

### Role Check
```javascript
const { hasRole } = usePermissions();
if (hasRole('admin')) { /* admin only */ }
```

### Protected Route
```javascript
<ProtectedRoute permission={PERMISSION_GROUPS.PRODUCTS.VIEW}>
  <ProductList />
</ProtectedRoute>
```

### Permission Button
```javascript
<PermissionButton permission={PERMISSION_GROUPS.PRODUCTS.CREATE}>
  Create Product
</PermissionButton>
```

### Conditional Render
```javascript
<IfPermission permission={PERMISSION_GROUPS.PRODUCTS.DELETE}>
  <DeleteButton />
</IfPermission>
```

### Log Permission Denial
```javascript
const { logDenial } = usePermissions();
logDenial({
  action: 'delete_product',
  resource: 'products/123'
});
```

## Roles and Permissions

### Role Hierarchy
```
viewer < user < staff < manager < admin
```

### Default Role Permissions

**Admin**: All permissions (100+)

**Manager**: 
- All product/inventory management
- User management (view, create, update)
- Sales and purchase management
- Reports and audit logs

**Staff**:
- View most resources
- Create sales and purchases
- View inventory
- View reports (no export)

**User**:
- View all resources
- View sales/purchases
- View inventory

**Viewer**:
- Read-only access to most features

## Error Handling

### Check for Permission Error
```javascript
import { isPermissionError } from '@/services/permissionInterceptor';

try {
  await apiCall();
} catch (error) {
  if (isPermissionError(error)) {
    // Permission denied
  }
}
```

### Get Error Message
```javascript
import { getErrorMessage } from '@/services/permissionInterceptor';

try {
  await apiCall();
} catch (error) {
  const msg = getErrorMessage(error); // User-friendly message
}
```

### Wrap API Call with Permission Check
```javascript
import { withPermissionCheck } from '@/services/permissionInterceptor';

const checkoutAPI = withPermissionCheck(
  async () => apiClient.post('/checkout'),
  { action: 'checkout', resource: 'orders' }
);
```

## Audit Trail

### Get Permission Denial Logs
```javascript
import { getAuditTrail } from '@/utils/permissions';

const trail = getAuditTrail();
trail.forEach(entry => {
  console.log(`${entry.timestamp}: ${entry.action} denied for ${entry.userId}`);
});
```

### Clear Audit Trail
```javascript
import { clearAuditTrail } from '@/utils/permissions';

clearAuditTrail();
```

### Manual Logging
```javascript
import { logPermissionDenial } from '@/utils/permissions';

logPermissionDenial({
  userId: user.id,
  action: 'delete_product',
  resource: 'products/123',
  permission: 'products_delete',
  reason: 'Attempting to delete protected resource'
});
```

## AuthContext Integration

### User Object Structure
```javascript
{
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'manager',
  permissions: [
    'products_view',
    'products_create',
    'products_update',
    // ... more permissions
  ]
}
```

### Refresh Permissions
```javascript
const { refreshPermissions } = useAuth();

// After role change
refreshPermissions();
```

## Development Utilities

### Permission Info Component
```javascript
import { PermissionInfoButton } from '@/components/PermissionInfo';

// In development navbar
<PermissionInfoButton />
```

### Permission Debugger (Dev Only)
```javascript
import { PermissionDebugger } from '@/components/PermissionInfo';

// In root App component (only shows in development)
<PermissionDebugger />
```

### Permission Widget
```javascript
import { PermissionWidget } from '@/components/PermissionInfo';

// Floating widget with permission count
<PermissionWidget />
```

## Testing Permission Checks

### Test with Different Roles
```javascript
// Login as different users
// admin: Full access
// manager: Management features
// staff: Basic transaction creation
// user: View and basic operations
// viewer: Read-only access
```

### Check Sidebar Items
- Admin should see all menu items
- Manager should see all except system settings
- Staff should see fewer options
- Viewer should see read-only options only

### Test Permission Buttons
- Buttons should be hidden/disabled if no permission
- Buttons should show toast if no permission
- API errors should show permission denied message

### Check Audit Trail
```javascript
const trail = getAuditTrail();
console.log(trail); // Should show permission denial attempts
```

## Common Mistakes to Avoid

❌ **Hardcoding permission strings**
```javascript
if (user.permissions.includes('product_view')) { } // BAD
```

✅ **Use permission groups**
```javascript
const { has } = usePermissions();
if (has(PERMISSION_GROUPS.PRODUCTS.VIEW)) { } // GOOD
```

---

❌ **Only checking permissions in routes**
```javascript
<Route path="/products" element={<ProductList />} />
```

✅ **Check at multiple levels**
```javascript
<Route path="/products" element={
  <ProtectedRoute permission={PERMISSION_GROUPS.PRODUCTS.VIEW}>
    <ProductList />
  </ProtectedRoute>
} />
// AND in component
const { canView } = usePermissions();
```

---

❌ **Forgetting to handle API errors**
```javascript
const data = await apiCall();
```

✅ **Handle permission errors from API**
```javascript
try {
  const data = await apiCall();
} catch (error) {
  handlePermissionError(error);
}
```

---

❌ **Not logging permission denials**
```javascript
if (!has(permission)) return null;
```

✅ **Log for audit trail**
```javascript
const { has, logDenial } = usePermissions();
if (!has(permission)) {
  logDenial({ action, resource });
  return null;
}
```

---

❌ **Using confusing permission names**
```javascript
products_v // unclear
```

✅ **Use clear, consistent naming**
```javascript
PERMISSION_GROUPS.PRODUCTS.VIEW // Clear
```
