/**
 * PermissionInfo component
 * Displays user permissions and role information
 * Useful for development and debugging
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { 
  groupPermissionsByCategory, 
  getRoleLabel, 
  getRoleDescription,
  getPermissionLabel,
  PERMISSION_GROUPS 
} from '../utils/permissions';

/**
 * Permission info dialog component
 */
export const PermissionInfo = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { permissions, role } = usePermissions();
  const [expandedCategories, setExpandedCategories] = useState({});

  if (!isOpen || !user) return null;

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const groupedPerms = groupPermissionsByCategory(permissions);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">User Permissions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">{getRoleLabel(role)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{getRoleDescription(role)}</p>
              </div>
            </div>
          </div>

          {/* Permissions by Category */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Permissions by Category</h3>
            <div className="space-y-2">
              {Object.entries(groupedPerms).map(([category, perms]) => (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-left"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category}
                      <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                        ({perms.length})
                      </span>
                    </span>
                    {expandedCategories[category] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedCategories[category] && (
                    <div className="pl-4 pt-2 space-y-1 bg-gray-50 dark:bg-gray-800">
                      {perms.map(perm => (
                        <div key={perm} className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {getPermissionLabel(perm)}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{perm}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded text-sm text-blue-900 dark:text-blue-200">
            Total: <strong>{permissions.length}</strong> permissions across <strong>{Object.keys(groupedPerms).length}</strong> categories
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Permission Info Button
 * Shows a button to open the permission info dialog
 */
export const PermissionInfoButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        title="View your permissions"
      >
        Permissions
      </button>
      <PermissionInfo isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

/**
 * Permission Widget
 * Compact display of user permissions (for development)
 */
export const PermissionWidget = () => {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 text-sm font-medium"
      >
        🔐 {permissions.length} perms
      </button>

      {isExpanded && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xs max-h-64 overflow-y-auto">
          <div className="space-y-2">
            <p className="font-semibold text-gray-900 dark:text-white">Permissions</p>
            <div className="text-xs space-y-1">
              {permissions.slice(0, 10).map(perm => (
                <div key={perm} className="text-gray-700 dark:text-gray-300 truncate">
                  • {perm}
                </div>
              ))}
              {permissions.length > 10 && (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  +{permissions.length - 10} more...
                </p>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="mt-2 w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Development-only permission debugger
 * Only shows in development mode
 */
export const PermissionDebugger = () => {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <PermissionInfoButton />
    </div>
  );
};

export default PermissionInfo;
