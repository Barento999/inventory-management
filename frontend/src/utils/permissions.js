/**
 * Permission utility functions for RBAC
 * Provides centralized permission checking, audit logging, and permission patterns
 */

// Permission groups for easier checking
export const PERMISSION_GROUPS = {
  USERS: {
    VIEW: 'users_view',
    CREATE: 'users_create',
    UPDATE: 'users_update',
    DELETE: 'users_delete',
  },
  PRODUCTS: {
    VIEW: 'products_view',
    CREATE: 'products_create',
    UPDATE: 'products_update',
    DELETE: 'products_delete',
  },
  CATEGORIES: {
    VIEW: 'categories_view',
    CREATE: 'categories_create',
    UPDATE: 'categories_update',
    DELETE: 'categories_delete',
  },
  WAREHOUSES: {
    VIEW: 'warehouses_view',
    CREATE: 'warehouses_create',
    UPDATE: 'warehouses_update',
    DELETE: 'warehouses_delete',
  },
  CUSTOMERS: {
    VIEW: 'customers_view',
    CREATE: 'customers_create',
    UPDATE: 'customers_update',
    DELETE: 'customers_delete',
  },
  SUPPLIERS: {
    VIEW: 'suppliers_view',
    CREATE: 'suppliers_create',
    UPDATE: 'suppliers_update',
    DELETE: 'suppliers_delete',
  },
  SALES: {
    VIEW: 'sales_view',
    CREATE: 'sales_create',
    UPDATE: 'sales_update',
    DELETE: 'sales_delete',
  },
  PURCHASES: {
    VIEW: 'purchases_view',
    CREATE: 'purchases_create',
    UPDATE: 'purchases_update',
    DELETE: 'purchases_delete',
  },
  INVENTORY: {
    VIEW: 'inventory_view',
    ADJUST: 'inventory_adjust',
    MOVEMENTS: 'inventory_movements',
  },
  SETTINGS: {
    VIEW: 'settings_view',
    UPDATE: 'settings_update',
    RESET: 'settings_reset',
  },
  REPORTS: {
    VIEW: 'reports_view',
    EXPORT: 'reports_export',
  },
  INVOICES: {
    VIEW: 'invoices_view',
    CREATE: 'invoices_create',
    UPDATE: 'invoices_update',
    DELETE: 'invoices_delete',
  },
  RETURNS: {
    VIEW: 'returns_view',
    CREATE: 'returns_create',
    UPDATE: 'returns_update',
    DELETE: 'returns_delete',
  },
  SERIAL_NUMBERS: {
    VIEW: 'serial_numbers_view',
    CREATE: 'serial_numbers_create',
    UPDATE: 'serial_numbers_update',
    DELETE: 'serial_numbers_delete',
  },
  BATCHES: {
    VIEW: 'batches_view',
    CREATE: 'batches_create',
    UPDATE: 'batches_update',
    DELETE: 'batches_delete',
  },
  AUDIT_LOGS: {
    VIEW: 'audit_logs_view',
  },
  ROLES: {
    VIEW: 'roles_view',
    CREATE: 'roles_create',
    UPDATE: 'roles_update',
    DELETE: 'roles_delete',
  },
};

// Role hierarchy levels (higher = more permissions)
export const ROLE_HIERARCHY = {
  viewer: 1,
  user: 2,
  staff: 3,
  manager: 4,
  admin: 5,
};

/**
 * Check if user has a specific permission
 * @param {Array<string>} userPermissions - List of user's permissions
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, permission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param {Array<string>} userPermissions - List of user's permissions
 * @param {Array<string>} permissions - Permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (userPermissions, permissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {Array<string>} userPermissions - List of user's permissions
 * @param {Array<string>} permissions - Permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (userPermissions, permissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * Check if user role is at least the specified role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
export const hasRoleOrHigher = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Get permission label/description
 * @param {string} permission - Permission key
 * @returns {string}
 */
export const getPermissionLabel = (permission) => {
  const permissionMap = {
    'users_view': 'View Users',
    'users_create': 'Create Users',
    'users_update': 'Update Users',
    'users_delete': 'Delete Users',
    'products_view': 'View Products',
    'products_create': 'Create Products',
    'products_update': 'Update Products',
    'products_delete': 'Delete Products',
    'categories_view': 'View Categories',
    'categories_create': 'Create Categories',
    'categories_update': 'Update Categories',
    'categories_delete': 'Delete Categories',
    'warehouses_view': 'View Warehouses',
    'warehouses_create': 'Create Warehouses',
    'warehouses_update': 'Update Warehouses',
    'warehouses_delete': 'Delete Warehouses',
    'customers_view': 'View Customers',
    'customers_create': 'Create Customers',
    'customers_update': 'Update Customers',
    'customers_delete': 'Delete Customers',
    'suppliers_view': 'View Suppliers',
    'suppliers_create': 'Create Suppliers',
    'suppliers_update': 'Update Suppliers',
    'suppliers_delete': 'Delete Suppliers',
    'sales_view': 'View Sales',
    'sales_create': 'Create Sales',
    'sales_update': 'Update Sales',
    'sales_delete': 'Delete Sales',
    'purchases_view': 'View Purchases',
    'purchases_create': 'Create Purchases',
    'purchases_update': 'Update Purchases',
    'purchases_delete': 'Delete Purchases',
    'inventory_view': 'View Inventory',
    'inventory_adjust': 'Adjust Inventory',
    'inventory_movements': 'View Stock Movements',
    'settings_view': 'View Settings',
    'settings_update': 'Update Settings',
    'settings_reset': 'Reset Settings',
    'reports_view': 'View Reports',
    'reports_export': 'Export Reports',
    'invoices_view': 'View Invoices',
    'invoices_create': 'Create Invoices',
    'invoices_update': 'Update Invoices',
    'invoices_delete': 'Delete Invoices',
    'returns_view': 'View Returns',
    'returns_create': 'Create Returns',
    'returns_update': 'Update Returns',
    'returns_delete': 'Delete Returns',
    'serial_numbers_view': 'View Serial Numbers',
    'serial_numbers_create': 'Create Serial Numbers',
    'serial_numbers_update': 'Update Serial Numbers',
    'serial_numbers_delete': 'Delete Serial Numbers',
    'batches_view': 'View Batches',
    'batches_create': 'Create Batches',
    'batches_update': 'Update Batches',
    'batches_delete': 'Delete Batches',
    'audit_logs_view': 'View Audit Logs',
    'roles_view': 'View Roles',
    'roles_create': 'Create Roles',
    'roles_update': 'Update Roles',
    'roles_delete': 'Delete Roles',
  };
  return permissionMap[permission] || permission;
};

/**
 * Log permission denial for audit trail
 * @param {Object} options - Options object
 * @param {string} options.userId - User ID
 * @param {string} options.action - Action attempted
 * @param {string} options.resource - Resource being accessed
 * @param {string} options.permission - Permission required
 * @param {string} options.reason - Reason for denial
 */
export const logPermissionDenial = ({
  userId,
  action,
  resource,
  permission,
  reason = 'Permission denied'
}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    permission,
    reason,
    type: 'permission_denial',
  };

  // Store in localStorage for audit trail
  try {
    const auditTrail = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    auditTrail.push(logEntry);
    // Keep only last 100 entries
    if (auditTrail.length > 100) {
      auditTrail.shift();
    }
    localStorage.setItem('auditTrail', JSON.stringify(auditTrail));
  } catch (error) {
    console.error('Failed to log permission denial:', error);
  }
  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn('[Permission Denied]', logEntry);
  }
};

/**
 * Get audit trail of permission denials
 * @returns {Array}
 */
export const getAuditTrail = () => {
  try {
    return JSON.parse(localStorage.getItem('auditTrail') || '[]');
  } catch (error) {
    console.error('Failed to retrieve audit trail:', error);
    return [];
  }
};

/**
 * Clear audit trail
 */
export const clearAuditTrail = () => {
  localStorage.removeItem('auditTrail');
};

/**
 * Get role display name
 * @param {string} role - Role key
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  const roleMap = {
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff',
    user: 'User',
    viewer: 'Viewer',
  };
  return roleMap[role] || role;
};

/**
 * Get role description
 * @param {string} role - Role key
 * @returns {string}
 */
export const getRoleDescription = (role) => {
  const descriptions = {
    admin: 'Full access to all features and settings',
    manager: 'Can manage users, products, sales, and reports',
    staff: 'Can view and create basic transactions',
    user: 'Can view products and create basic transactions',
    viewer: 'Read-only access to most features',
  };
  return descriptions[role] || '';
};

/**
 * Helper to group permissions by category
 * @param {Array<string>} permissions - List of permissions
 * @returns {Object}
 */
export const groupPermissionsByCategory = (permissions) => {
  const groups = {};
  
  Object.entries(PERMISSION_GROUPS).forEach(([category, categoryPerms]) => {
    const categoryPermissions = Object.values(categoryPerms).filter(p => 
      permissions.includes(p)
    );
    
    if (categoryPermissions.length > 0) {
      groups[category] = categoryPermissions;
    }
  });
  
  return groups;
};

/**
 * Check if user can perform CRUD operations on a resource
 * @param {Array<string>} userPermissions - User's permissions
 * @param {string} resource - Resource name (e.g., 'products')
 * @returns {Object}
 */
export const getCRUDPermissions = (userPermissions, resource) => {
  return {
    canView: hasPermission(userPermissions, `${resource}_view`),
    canCreate: hasPermission(userPermissions, `${resource}_create`),
    canUpdate: hasPermission(userPermissions, `${resource}_update`),
    canDelete: hasPermission(userPermissions, `${resource}_delete`),
  };
};

/**
 * Get permission constraints for API calls
 * @param {Array<string>} userPermissions - User's permissions
 * @returns {Object}
 */
export const getPermissionConstraints = (userPermissions) => {
  return {
    canViewUsers: hasPermission(userPermissions, PERMISSION_GROUPS.USERS.VIEW),
    canManageUsers: hasAllPermissions(userPermissions, [
      PERMISSION_GROUPS.USERS.VIEW,
      PERMISSION_GROUPS.USERS.CREATE,
    ]),
    canViewProducts: hasPermission(userPermissions, PERMISSION_GROUPS.PRODUCTS.VIEW),
    canManageProducts: hasAllPermissions(userPermissions, [
      PERMISSION_GROUPS.PRODUCTS.VIEW,
      PERMISSION_GROUPS.PRODUCTS.CREATE,
    ]),
    canManageInventory: hasPermission(userPermissions, PERMISSION_GROUPS.INVENTORY.ADJUST),
    canViewReports: hasPermission(userPermissions, PERMISSION_GROUPS.REPORTS.VIEW),
    canExportReports: hasPermission(userPermissions, PERMISSION_GROUPS.REPORTS.EXPORT),
    canViewSettings: hasPermission(userPermissions, PERMISSION_GROUPS.SETTINGS.VIEW),
    canUpdateSettings: hasPermission(userPermissions, PERMISSION_GROUPS.SETTINGS.UPDATE),
  };
};
