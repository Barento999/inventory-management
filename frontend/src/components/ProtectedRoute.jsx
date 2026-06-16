/**
 * ProtectedRoute component
 * Restricts access to routes based on user permissions or role
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../context/ToastContext';

/**
 * ProtectedRoute component
 * 
 * Usage:
 * <ProtectedRoute permission="products_view">
 *   <ProductList />
 * </ProtectedRoute>
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string|Array<string>} props.permission - Permission(s) required
 * @param {string|Array<string>} props.role - Role(s) required
 * @param {boolean} props.requireAll - If true with permission array, requires all permissions
 * @param {React.ReactNode} props.fallback - Component to render if unauthorized
 * @param {boolean} props.redirect - If true, redirect to login instead of showing fallback
 * @returns {React.ReactNode}
 */
export const ProtectedRoute = ({
  children,
  permission,
  role,
  requireAll = false,
  fallback = null,
  redirect = false,
}) => {
  const { user, loading } = useAuth();
  const { has, hasAny, hasAll, hasRole } = usePermissions();
  const { addToast } = useToast();

  // Still loading auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (redirect) {
      return <Navigate to="/login" replace />;
    }
    return fallback || <AccessDenied reason="Please log in to continue" />;
  }

  // Check role requirement
  if (role) {
    let hasRequiredRole = false;

    if (typeof role === 'string') {
      hasRequiredRole = hasRole(role);
    } else if (Array.isArray(role)) {
      hasRequiredRole = role.some(r => hasRole(r));
    }

    if (!hasRequiredRole) {
      addToast({
        title: 'Access Denied',
        description: `Your role (${user.role}) does not have access to this resource.`,
        type: 'error',
      });

      if (redirect) {
        return <Navigate to="/" replace />;
      }

      return fallback || (
        <AccessDenied reason={`Required role: ${Array.isArray(role) ? role.join(', ') : role}`} />
      );
    }
  }

  // Check permission requirement
  if (permission) {
    let hasRequiredPermission = false;

    if (typeof permission === 'string') {
      hasRequiredPermission = has(permission);
    } else if (Array.isArray(permission)) {
      hasRequiredPermission = requireAll 
        ? hasAll(permission) 
        : hasAny(permission);
    }

    if (!hasRequiredPermission) {
      addToast({
        title: 'Access Denied',
        description: `You don't have the required permission to access this resource.`,
        type: 'error',
      });

      if (redirect) {
        return <Navigate to="/" replace />;
      }

      return fallback || (
        <AccessDenied 
          reason={`Required permission: ${
            Array.isArray(permission) 
              ? permission.join(requireAll ? ' and ' : ' or ')
              : permission
          }`} 
        />
      );
    }
  }

  // Authorized
  return children;
};

/**
 * AccessDenied component
 * Displays when user lacks required permissions
 */
export const AccessDenied = ({ reason = 'Access Denied' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl">🔒</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {reason}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default ProtectedRoute;
