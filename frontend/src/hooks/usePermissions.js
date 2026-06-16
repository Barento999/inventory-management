/**
 * usePermissions hook
 * Provides permission checking functionality integrated with AuthContext
 */

import { useAuth } from '../context/AuthContext';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRoleOrHigher,
  logPermissionDenial,
  getCRUDPermissions,
  getPermissionConstraints,
} from '../utils/permissions';

/**
 * Hook to check user permissions
 * @returns {Object}
 */
export const usePermissions = () => {
  const { user } = useAuth();

  if (!user) {
    return {
      permissions: [],
      role: null,
      has: () => false,
      hasAny: () => false,
      hasAll: () => false,
      hasRole: () => false,
      canView: () => false,
      canCreate: () => false,
      canUpdate: () => false,
      canDelete: () => false,
      canCRUD: () => ({ canView: false, canCreate: false, canUpdate: false, canDelete: false }),
      getDenialMessage: () => 'Unauthorized',
      logDenial: () => {},
      constraints: {},
    };
  }

  const permissions = user.permissions || [];
  const role = user.role;

  /**
   * Check single permission
   * @param {string} permission
   * @returns {boolean}
   */
  const has = (permission) => {
    const allowed = hasPermission(permissions, permission);
    if (!allowed) {
      logPermissionDenial({
        userId: user.id,
        action: 'check_permission',
        resource: permission,
        permission,
        reason: 'User does not have permission',
      });
    }
    return allowed;
  };

  /**
   * Check any permission
   * @param {Array<string>} permissionList
   * @returns {boolean}
   */
  const hasAny = (permissionList) => {
    const allowed = hasAnyPermission(permissions, permissionList);
    if (!allowed) {
      logPermissionDenial({
        userId: user.id,
        action: 'check_any_permission',
        resource: permissionList.join(','),
        permission: permissionList.join(' OR '),
        reason: 'User does not have any required permission',
      });
    }
    return allowed;
  };

  /**
   * Check all permissions
   * @param {Array<string>} permissionList
   * @returns {boolean}
   */
  const hasAll = (permissionList) => {
    const allowed = hasAllPermissions(permissions, permissionList);
    if (!allowed) {
      logPermissionDenial({
        userId: user.id,
        action: 'check_all_permissions',
        resource: permissionList.join(','),
        permission: permissionList.join(' AND '),
        reason: 'User does not have all required permissions',
      });
    }
    return allowed;
  };

  /**
   * Check role hierarchy
   * @param {string} requiredRole
   * @returns {boolean}
   */
  const hasRole = (requiredRole) => {
    const allowed = hasRoleOrHigher(role, requiredRole);
    if (!allowed) {
      logPermissionDenial({
        userId: user.id,
        action: 'check_role',
        resource: requiredRole,
        permission: `role:${requiredRole}`,
        reason: `User role "${role}" is lower than required "${requiredRole}"`,
      });
    }
    return allowed;
  };

  /**
   * Check view permission for resource
   * @param {string} resource
   * @returns {boolean}
   */
  const canView = (resource) => {
    return has(`${resource}_view`);
  };

  /**
   * Check create permission for resource
   * @param {string} resource
   * @returns {boolean}
   */
  const canCreate = (resource) => {
    return has(`${resource}_create`);
  };

  /**
   * Check update permission for resource
   * @param {string} resource
   * @returns {boolean}
   */
  const canUpdate = (resource) => {
    return has(`${resource}_update`);
  };

  /**
   * Check delete permission for resource
   * @param {string} resource
   * @returns {boolean}
   */
  const canDelete = (resource) => {
    return has(`${resource}_delete`);
  };

  /**
   * Get all CRUD permissions for a resource
   * @param {string} resource
   * @returns {Object}
   */
  const canCRUD = (resource) => {
    return getCRUDPermissions(permissions, resource);
  };

  /**
   * Get a user-friendly denial message
   * @param {string} permission
   * @returns {string}
   */
  const getDenialMessage = (permission) => {
    return `You don't have permission to perform this action: ${permission}`;
  };

  /**
   * Log a permission denial with context
   * @param {Object} options
   */
  const logDenial = (options) => {
    logPermissionDenial({
      userId: user.id,
      ...options,
    });
  };

  return {
    permissions,
    role,
    has,
    hasAny,
    hasAll,
    hasRole,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canCRUD,
    getDenialMessage,
    logDenial,
    constraints: getPermissionConstraints(permissions),
  };
};

/**
 * Hook to conditionally render based on permissions
 * @param {string|Array<string>} permission - Permission(s) to check
 * @param {boolean} requireAll - If true, requires all permissions. If false, requires any
 * @returns {boolean}
 */
export const useHasPermission = (permission, requireAll = false) => {
  const { has, hasAny, hasAll } = usePermissions();
  
  if (typeof permission === 'string') {
    return has(permission);
  }
  
  if (Array.isArray(permission)) {
    return requireAll ? hasAll(permission) : hasAny(permission);
  }
  
  return false;
};

/**
 * Hook to check if user has a specific role
 * @param {string|Array<string>} role - Role(s) to check
 * @returns {boolean}
 */
export const useHasRole = (role) => {
  const { hasRole } = usePermissions();
  
  if (typeof role === 'string') {
    return hasRole(role);
  }
  
  if (Array.isArray(role)) {
    return role.some(r => hasRole(r));
  }
  
  return false;
};

/**
 * Hook to get current user role
 * @returns {string|null}
 */
export const useUserRole = () => {
  const { user } = useAuth();
  return user?.role || null;
};
