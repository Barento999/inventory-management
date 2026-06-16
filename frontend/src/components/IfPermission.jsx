/**
 * IfPermission component
 * Conditionally renders content based on user permissions
 */

import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Conditional render component for permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {string|Array<string>} props.permission - Permission(s) required
 * @param {string|Array<string>} props.role - Role(s) required
 * @param {boolean} props.requireAll - If true, requires all permissions
 * @param {React.ReactNode} props.fallback - Content to render if not authorized
 * @returns {React.ReactNode}
 */
export const IfPermission = ({
  children,
  permission,
  role,
  requireAll = false,
  fallback = null,
}) => {
  const { has, hasAny, hasAll, hasRole } = usePermissions();

  // Check role requirement
  let hasRequiredRole = true;
  if (role) {
    if (typeof role === 'string') {
      hasRequiredRole = hasRole(role);
    } else if (Array.isArray(role)) {
      hasRequiredRole = role.some(r => hasRole(r));
    }
  }

  // Check permission requirement
  let hasRequiredPermission = true;
  if (permission) {
    if (typeof permission === 'string') {
      hasRequiredPermission = has(permission);
    } else if (Array.isArray(permission)) {
      hasRequiredPermission = requireAll ? hasAll(permission) : hasAny(permission);
    }
  }

  const isAllowed = hasRequiredRole && hasRequiredPermission;

  return isAllowed ? children : fallback;
};

/**
 * Render nothing if user lacks permissions
 * Cleaner syntax for simple cases
 */
export const If = ({
  permission,
  role,
  requireAll = false,
  children,
}) => {
  return (
    <IfPermission 
      permission={permission} 
      role={role} 
      requireAll={requireAll}
      fallback={null}
    >
      {children}
    </IfPermission>
  );
};

/**
 * Render one of two components based on permissions
 */
export const IfElse = ({
  permission,
  role,
  requireAll = false,
  children,
  fallback,
}) => {
  const { has, hasAny, hasAll, hasRole } = usePermissions();

  // Check role requirement
  let hasRequiredRole = true;
  if (role) {
    if (typeof role === 'string') {
      hasRequiredRole = hasRole(role);
    } else if (Array.isArray(role)) {
      hasRequiredRole = role.some(r => hasRole(r));
    }
  }

  // Check permission requirement
  let hasRequiredPermission = true;
  if (permission) {
    if (typeof permission === 'string') {
      hasRequiredPermission = has(permission);
    } else if (Array.isArray(permission)) {
      hasRequiredPermission = requireAll ? hasAll(permission) : hasAny(permission);
    }
  }

  const isAllowed = hasRequiredRole && hasRequiredPermission;

  return isAllowed ? children : fallback;
};

export default IfPermission;
