/**
 * PermissionButton component
 * Button that checks permissions before rendering or allowing clicks
 */

import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../context/ToastContext';

/**
 * Button component with built-in permission checks
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button text/content
 * @param {string|Array<string>} props.permission - Permission(s) required
 * @param {string|Array<string>} props.role - Role(s) required
 * @param {boolean} props.requireAll - If true, requires all permissions
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.hidden - If true, hide button instead of disabling
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Button variant (primary, secondary, danger, etc.)
 * @param {boolean} props.disabled - Additional disabled state
 * @param {string} props.denialToastMessage - Toast message on permission denial
 * @returns {React.ReactNode}
 */
export const PermissionButton = ({
  children,
  permission,
  role,
  requireAll = false,
  onClick,
  hidden = true,
  className = '',
  variant = 'primary',
  disabled = false,
  denialToastMessage = 'You do not have permission to perform this action.',
  ...props
}) => {
  const { has, hasAny, hasAll, hasRole } = usePermissions();
  const { addToast } = useToast();

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

  const isAllowed = hasRequiredRole && hasRequiredPermission && !disabled;

  // Hide button if not allowed
  if (!isAllowed && hidden) {
    return null;
  }

  const handleClick = (e) => {
    if (!isAllowed) {
      e.preventDefault();
      addToast({
        title: 'Permission Denied',
        description: denialToastMessage,
        type: 'error',
      });
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
  };

  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
  const disabledClasses = !isAllowed ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${disabledClasses} ${className}`}
      onClick={handleClick}
      disabled={!isAllowed}
      title={!isAllowed ? denialToastMessage : props.title}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Link button with permission checks
 */
export const PermissionLink = ({
  children,
  permission,
  role,
  requireAll = false,
  to,
  hidden = true,
  className = '',
  variant = 'primary',
  denialMessage = 'You do not have permission to access this page.',
  ...props
}) => {
  const { has, hasAny, hasAll, hasRole } = usePermissions();
  const { addToast } = useToast();

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

  // Hide link if not allowed
  if (!isAllowed && hidden) {
    return null;
  }

  const handleClick = (e) => {
    if (!isAllowed) {
      e.preventDefault();
      addToast({
        title: 'Permission Denied',
        description: denialMessage,
        type: 'error',
      });
    }
  };

  const variantClasses = {
    primary: 'text-blue-600 hover:text-blue-700 hover:underline',
    secondary: 'text-gray-600 hover:text-gray-700 hover:underline',
    danger: 'text-red-600 hover:text-red-700 hover:underline',
    success: 'text-green-600 hover:text-green-700 hover:underline',
  };

  const disabledClasses = !isAllowed ? 'opacity-50 cursor-not-allowed no-underline' : '';

  return (
    <a
      href={to}
      className={`${variantClasses[variant] || variantClasses.primary} ${disabledClasses} ${className}`}
      onClick={handleClick}
      title={!isAllowed ? denialMessage : props.title}
      {...props}
    >
      {children}
    </a>
  );
};

export default PermissionButton;
