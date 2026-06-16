# RBAC Integration Example

This document shows how to integrate RBAC into existing components and services.

## Example 1: Update an Existing Page Component

### Before: ProductList.jsx
```javascript
import React, { useEffect, useState } from 'react';
import { productsApi } from '@/services/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Products</h1>
        <button className="btn btn-primary">Create Product</button>
      </div>
      
      <table>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;
```

### After: ProductList.jsx with RBAC
```javascript
import React, { useEffect, useState } from 'react';
import { productsApi } from '@/services/api';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionButton } from '@/components/PermissionButton';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PERMISSION_GROUPS } from '@/utils/permissions';
import { useToast } from '@/context/ToastContext';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { has, logDenial } = usePermissions();
  const { addToast } = useToast();

  // Check view permission
  const canView = has(PERMISSION_GROUPS.PRODUCTS.VIEW);
  const canCreate = has(PERMISSION_GROUPS.PRODUCTS.CREATE);
  const canUpdate = has(PERMISSION_GROUPS.PRODUCTS.UPDATE);
  const canDelete = has(PERMISSION_GROUPS.PRODUCTS.DELETE);

  useEffect(() => {
    if (canView) {
      loadProducts();
    } else {
      setLoading(false);
      logDenial({
        action: 'view_products',
        resource: 'products_list'
      });
    }
  }, [canView]);

  const loadProducts = async () => {
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load products',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You do not have permission to view products</p>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Products</h1>
        <PermissionButton
          permission={PERMISSION_GROUPS.PRODUCTS.CREATE}
          onClick={() => navigate('/products/create')}
          variant="primary"
        >
          Create Product
        </PermissionButton>
      </div>
      
      <table>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td className="flex gap-2">
                <PermissionButton
                  permission={PERMISSION_GROUPS.PRODUCTS.UPDATE}
                  onClick={() => navigate(`/products/${product.id}`)}
                  variant="secondary"
                  className="text-sm px-2 py-1"
                >
                  Edit
                </PermissionButton>
                <PermissionButton
                  permission={PERMISSION_GROUPS.PRODUCTS.DELETE}
                  onClick={() => handleDelete(product.id)}
                  variant="danger"
                  className="text-sm px-2 py-1"
                  denialToastMessage="You cannot delete products"
                >
                  Delete
                </PermissionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Wrap with ProtectedRoute in router
export default ProductList;
```

### Usage in Router
```javascript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PERMISSION_GROUPS } from '@/utils/permissions';

<Route
  path="/products"
  element={
    <ProtectedRoute permission={PERMISSION_GROUPS.PRODUCTS.VIEW}>
      <ProductList />
    </ProtectedRoute>
  }
/>
```

## Example 2: Update an API Service

### Before: inventoryService.js
```javascript
export const inventoryService = {
  adjustStock: async (productId, quantity, reason) => {
    return apiClient.post('/inventory/adjust', {
      productId,
      quantity,
      reason
    });
  },

  getMovements: async (filters) => {
    return apiClient.get('/inventory/movements', { params: filters });
  }
};
```

### After: inventoryService.js with RBAC
```javascript
import { withPermissionCheck } from '@/services/permissionInterceptor';
import { logPermissionDenial } from '@/utils/permissions';

export const inventoryService = {
  /**
   * Adjust inventory - requires inventory_adjust permission
   */
  adjustStock: withPermissionCheck(
    async (productId, quantity, reason) => {
      return apiClient.post('/inventory/adjust', {
        productId,
        quantity,
        reason
      });
    },
    {
      action: 'adjust_stock',
      resource: 'inventory'
    }
  ),

  /**
   * Get movements - requires inventory_movements permission
   */
  getMovements: withPermissionCheck(
    async (filters) => {
      return apiClient.get('/inventory/movements', { params: filters });
    },
    {
      action: 'view_movements',
      resource: 'inventory_movements'
    }
  )
};
```

## Example 3: Conditional Form Fields

### Before: ProductForm.jsx
```javascript
function ProductForm() {
  return (
    <form>
      <input type="text" placeholder="Name" />
      <input type="text" placeholder="SKU" />
      <input type="number" placeholder="Price" />
      <input type="number" placeholder="Cost" /> {/* May be sensitive */}
      <button type="submit">Save</button>
    </form>
  );
}
```

### After: ProductForm.jsx with RBAC
```javascript
import { IfPermission } from '@/components/IfPermission';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSION_GROUPS } from '@/utils/permissions';

function ProductForm() {
  const { canView } = usePermissions();

  return (
    <form>
      <input type="text" placeholder="Name" />
      <input type="text" placeholder="SKU" />
      <input type="number" placeholder="Price" />
      
      {/* Only show cost field if user can view financial details */}
      <IfPermission
        permission={PERMISSION_GROUPS.SETTINGS.VIEW}
        fallback={<input type="number" placeholder="Cost" disabled />}
      >
        <input type="number" placeholder="Cost" />
      </IfPermission>
      
      <button type="submit">Save</button>
    </form>
  );
}
```

## Example 4: Update Navbar for Admin Links

### Before: Navigation.jsx
```javascript
function Navigation() {
  return (
    <nav>
      <a href="/products">Products</a>
      <a href="/sales">Sales</a>
      <a href="/users">Users</a>
      <a href="/settings">Settings</a>
    </nav>
  );
}
```

### After: Navigation.jsx with RBAC
```javascript
import { If } from '@/components/IfPermission';
import { PERMISSION_GROUPS } from '@/utils/permissions';

function Navigation() {
  return (
    <nav>
      <a href="/products">Products</a>
      <a href="/sales">Sales</a>
      
      {/* Only show admin links if user has permissions */}
      <If permission={PERMISSION_GROUPS.USERS.VIEW}>
        <a href="/users">Users</a>
      </If>
      
      <If permission={PERMISSION_GROUPS.SETTINGS.VIEW}>
        <a href="/settings">Settings</a>
      </If>
    </nav>
  );
}
```

## Example 5: Protected API Calls with Error Handling

### Before: DataFetcher.jsx
```javascript
function DataFetcher() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const result = await apiClient.get('/protected-resource');
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={fetchData}>Fetch</button>;
}
```

### After: DataFetcher.jsx with RBAC
```javascript
import { usePermissions } from '@/hooks/usePermissions';
import { isPermissionError, getErrorMessage } from '@/services/permissionInterceptor';
import { useToast } from '@/context/ToastContext';

function DataFetcher() {
  const [data, setData] = useState(null);
  const { has, logDenial, getDenialMessage } = usePermissions();
  const { addToast } = useToast();

  const fetchData = async () => {
    // Check permission first
    if (!has('protected_resource_view')) {
      addToast({
        title: 'Permission Denied',
        description: getDenialMessage('protected_resource_view'),
        type: 'error'
      });
      logDenial({
        action: 'fetch_protected_resource',
        resource: 'protected_resource'
      });
      return;
    }

    try {
      const result = await apiClient.get('/protected-resource');
      setData(result);
    } catch (error) {
      if (isPermissionError(error)) {
        addToast({
          title: 'Permission Denied',
          description: getErrorMessage(error),
          type: 'error'
        });
      } else {
        addToast({
          title: 'Error',
          description: getErrorMessage(error),
          type: 'error'
        });
      }
    }
  };

  return <button onClick={fetchData}>Fetch</button>;
}
```

## Example 6: Role-Based Content Display

### Before: Dashboard.jsx
```javascript
function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      {(user?.role === 'admin' || user?.role === 'manager') && (
        <AdminPanel />
      )}
      {user?.role === 'admin' && (
        <SystemSettings />
      )}
    </div>
  );
}
```

### After: Dashboard.jsx with RBAC
```javascript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useHasRole } from '@/hooks/usePermissions';

function Dashboard() {
  // Use hook approach for simpler checks
  const isManager = useHasRole(['admin', 'manager']);
  const isAdmin = useHasRole('admin');

  return (
    <div>
      <h1>Dashboard</h1>
      {isManager && <AdminPanel />}
      {isAdmin && <SystemSettings />}
    </div>
  );
}
```

## Example 7: Table with Action Buttons

### Before: UserTable.jsx
```javascript
function UserTable({ users }) {
  return (
    <table>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <button onClick={() => handleEdit(user.id)}>Edit</button>
              <button onClick={() => handleDelete(user.id)}>Delete</button>
              <button onClick={() => handleResetPassword(user.id)}>Reset Password</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### After: UserTable.jsx with RBAC
```javascript
import { PermissionButton } from '@/components/PermissionButton';
import { IfPermission } from '@/components/IfPermission';
import { PERMISSION_GROUPS } from '@/utils/permissions';

function UserTable({ users }) {
  return (
    <table>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <PermissionButton
                permission={PERMISSION_GROUPS.USERS.UPDATE}
                onClick={() => handleEdit(user.id)}
                variant="secondary"
                className="mr-2"
              >
                Edit
              </PermissionButton>
              
              <PermissionButton
                permission={PERMISSION_GROUPS.USERS.DELETE}
                onClick={() => handleDelete(user.id)}
                variant="danger"
                className="mr-2"
              >
                Delete
              </PermissionButton>
              
              {/* Reset password may have different permission */}
              <IfPermission permission={PERMISSION_GROUPS.USERS.UPDATE}>
                <PermissionButton
                  permission={PERMISSION_GROUPS.USERS.UPDATE}
                  onClick={() => handleResetPassword(user.id)}
                  variant="secondary"
                >
                  Reset Password
                </PermissionButton>
              </IfPermission>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Step-by-Step Integration Checklist

When integrating RBAC into a new component:

1. ✅ **Identify required permissions**
   - What actions can this component perform?
   - What data does it display?
   - Who should be able to access it?

2. ✅ **Import necessary utilities**
   ```javascript
   import { usePermissions } from '@/hooks/usePermissions';
   import { PERMISSION_GROUPS } from '@/utils/permissions';
   import { PermissionButton } from '@/components/PermissionButton';
   import { ProtectedRoute } from '@/components/ProtectedRoute';
   ```

3. ✅ **Add permission checks to component**
   ```javascript
   const { has, hasAny } = usePermissions();
   const canCreate = has(PERMISSION_GROUPS.PRODUCTS.CREATE);
   ```

4. ✅ **Conditionally render UI**
   ```javascript
   {canCreate && <CreateButton />}
   <IfPermission permission={PERMISSION_GROUPS.PRODUCTS.VIEW}>
     <ProductList />
   </IfPermission>
   ```

5. ✅ **Use PermissionButton for actions**
   ```javascript
   <PermissionButton permission={PERMISSION_GROUPS.PRODUCTS.DELETE}>
     Delete
   </PermissionButton>
   ```

6. ✅ **Wrap routes with ProtectedRoute**
   ```javascript
   <Route
     path="/products"
     element={
       <ProtectedRoute permission={PERMISSION_GROUPS.PRODUCTS.VIEW}>
         <ProductList />
       </ProtectedRoute>
     }
   />
   ```

7. ✅ **Handle API errors gracefully**
   ```javascript
   try {
     await apiCall();
   } catch (error) {
     if (isPermissionError(error)) {
       // Handle permission error
     }
   }
   ```

8. ✅ **Log permission denials**
   ```javascript
   if (!has(permission)) {
     logDenial({
       action: 'action_name',
       resource: 'resource_name'
     });
   }
   ```

9. ✅ **Test with different roles**
   - Test as admin (all permissions)
   - Test as manager (limited permissions)
   - Test as user (basic permissions)
   - Test as viewer (read-only)

10. ✅ **Review audit trail**
    ```javascript
    const trail = getAuditTrail();
    console.log(trail); // See permission denial logs
    ```
