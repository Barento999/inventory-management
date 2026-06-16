/**
 * API wrapper with permission checking
 * Combines API calls with permission validation
 */

import apiClient from './apiClient';
import { withPermissionCheck, handlePermissionError } from './permissionInterceptor';
import { logPermissionDenial } from '../utils/permissions';

/**
 * Create a permission-aware API service
 * @param {string} permission - Required permission for the API call
 * @param {Function} apiCall - The API call function
 * @param {string} resource - Resource name for logging
 * @returns {Function}
 */
export const createPermissionAwareAPI = (permission, apiCall, resource) => {
  return withPermissionCheck(apiCall, {
    action: `api_call_${resource}`,
    resource: resource,
  });
};

/**
 * Example permission-aware API services
 * These wrap standard API calls with permission checking
 */

export const permissionAwareProductsApi = {
  /**
   * List products - requires view permission
   */
  list: createPermissionAwareAPI(
    'products_view',
    async (options = {}) => {
      const params = new URLSearchParams({
        search: String(options.search || ''),
        page: String(options.page || 1),
        pageSize: String(options.pageSize || 10),
      });
      return apiClient.get(`/products?${params.toString()}`);
    },
    'list_products'
  ),

  /**
   * Get product details - requires view permission
   */
  get: createPermissionAwareAPI(
    'products_view',
    async (id) => {
      return apiClient.get(`/products/${id}`);
    },
    'get_product'
  ),

  /**
   * Create product - requires create permission
   */
  create: createPermissionAwareAPI(
    'products_create',
    async (data) => {
      return apiClient.post('/products', data);
    },
    'create_product'
  ),

  /**
   * Update product - requires update permission
   */
  update: createPermissionAwareAPI(
    'products_update',
    async (id, data) => {
      return apiClient.put(`/products/${id}`, data);
    },
    'update_product'
  ),

  /**
   * Delete product - requires delete permission
   */
  delete: createPermissionAwareAPI(
    'products_delete',
    async (id) => {
      return apiClient.delete(`/products/${id}`);
    },
    'delete_product'
  ),
};

/**
 * Permission-aware inventory API
 */
export const permissionAwareInventoryApi = {
  /**
   * View inventory - requires view permission
   */
  list: createPermissionAwareAPI(
    'inventory_view',
    async (options = {}) => {
      const params = new URLSearchParams({
        search: String(options.search || ''),
        page: String(options.page || 1),
        pageSize: String(options.pageSize || 10),
      });
      return apiClient.get(`/inventory/movements?${params.toString()}`);
    },
    'list_inventory'
  ),

  /**
   * Adjust inventory - requires adjust permission
   */
  adjust: createPermissionAwareAPI(
    'inventory_adjust',
    async ({ productId, type, quantity, reason, reference }) => {
      return apiClient.post('/inventory/adjust', {
        productId,
        type,
        quantity,
        reason,
        reference,
      });
    },
    'adjust_inventory'
  ),

  /**
   * View stock movements - requires movements permission
   */
  getMovements: createPermissionAwareAPI(
    'inventory_movements',
    async (options = {}) => {
      const params = new URLSearchParams({
        search: String(options.search || ''),
        type: options.type || '',
        page: String(options.page || 1),
        pageSize: String(options.pageSize || 10),
      });
      return apiClient.get(`/inventory/movements?${params.toString()}`);
    },
    'get_inventory_movements'
  ),
};

/**
 * Permission-aware users API
 */
export const permissionAwareUsersApi = {
  /**
   * List users - requires view permission
   */
  list: createPermissionAwareAPI(
    'users_view',
    async () => {
      return apiClient.get('/users');
    },
    'list_users'
  ),

  /**
   * Get user details - requires view permission
   */
  get: createPermissionAwareAPI(
    'users_view',
    async (id) => {
      return apiClient.get(`/users/${id}`);
    },
    'get_user'
  ),

  /**
   * Create user - requires create permission
   */
  create: createPermissionAwareAPI(
    'users_create',
    async (data) => {
      return apiClient.post('/users', data);
    },
    'create_user'
  ),

  /**
   * Update user - requires update permission
   */
  update: createPermissionAwareAPI(
    'users_update',
    async (id, data) => {
      return apiClient.put(`/users/${id}`, data);
    },
    'update_user'
  ),

  /**
   * Delete user - requires delete permission
   */
  delete: createPermissionAwareAPI(
    'users_delete',
    async (id) => {
      return apiClient.delete(`/users/${id}`);
    },
    'delete_user'
  ),
};

/**
 * Permission-aware sales API
 */
export const permissionAwareSalesApi = {
  /**
   * List sales - requires view permission
   */
  list: createPermissionAwareAPI(
    'sales_view',
    async (options = {}) => {
      const params = new URLSearchParams({
        search: String(options.search || ''),
        status: options.status || '',
        page: String(options.page || 1),
        pageSize: String(options.pageSize || 10),
      });
      return apiClient.get(`/sales?${params.toString()}`);
    },
    'list_sales'
  ),

  /**
   * Create sale - requires create permission
   */
  create: createPermissionAwareAPI(
    'sales_create',
    async (data) => {
      return apiClient.post('/sales', data);
    },
    'create_sale'
  ),

  /**
   * Update sale - requires update permission
   */
  update: createPermissionAwareAPI(
    'sales_update',
    async (id, data) => {
      return apiClient.put(`/sales/${id}`, data);
    },
    'update_sale'
  ),

  /**
   * Delete sale - requires delete permission
   */
  delete: createPermissionAwareAPI(
    'sales_delete',
    async (id) => {
      return apiClient.delete(`/sales/${id}`);
    },
    'delete_sale'
  ),
};

/**
 * Permission-aware purchases API
 */
export const permissionAwarePurchasesApi = {
  /**
   * List purchases - requires view permission
   */
  list: createPermissionAwareAPI(
    'purchases_view',
    async (options = {}) => {
      const params = new URLSearchParams({
        search: String(options.search || ''),
        status: options.status || '',
        page: String(options.page || 1),
        pageSize: String(options.pageSize || 10),
      });
      return apiClient.get(`/purchases?${params.toString()}`);
    },
    'list_purchases'
  ),

  /**
   * Create purchase - requires create permission
   */
  create: createPermissionAwareAPI(
    'purchases_create',
    async (data) => {
      return apiClient.post('/purchases', data);
    },
    'create_purchase'
  ),

  /**
   * Update purchase - requires update permission
   */
  update: createPermissionAwareAPI(
    'purchases_update',
    async (id, data) => {
      return apiClient.put(`/purchases/${id}`, data);
    },
    'update_purchase'
  ),

  /**
   * Delete purchase - requires delete permission
   */
  delete: createPermissionAwareAPI(
    'purchases_delete',
    async (id) => {
      return apiClient.delete(`/purchases/${id}`);
    },
    'delete_purchase'
  ),
};

/**
 * Usage example:
 * 
 * // In a component
 * import { permissionAwareProductsApi } from '@/services/apiWithPermissions';
 * 
 * function ProductList() {
 *   const [products, setProducts] = useState([]);
 *   const { addToast } = useToast();
 * 
 *   useEffect(() => {
 *     permissionAwareProductsApi.list({ page: 1 })
 *       .then(data => setProducts(data))
 *       .catch(error => {
 *         if (isPermissionError(error)) {
 *           addToast({
 *             title: 'Permission Denied',
 *             description: 'You do not have permission to view products',
 *             type: 'error'
 *           });
 *         }
 *       });
 *   }, []);
 * }
 */
