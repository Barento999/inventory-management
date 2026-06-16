import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { authApi } from '../services/api';
import apiClient from '../services/apiClient';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Map backend roles to permissions
const ROLE_PERMISSIONS_MAP = {
  admin: [
    'users_view', 'users_create', 'users_update', 'users_delete',
    'products_view', 'products_create', 'products_update', 'products_delete',
    'categories_view', 'categories_create', 'categories_update', 'categories_delete',
    'warehouses_view', 'warehouses_create', 'warehouses_update', 'warehouses_delete',
    'customers_view', 'customers_create', 'customers_update', 'customers_delete',
    'suppliers_view', 'suppliers_create', 'suppliers_update', 'suppliers_delete',
    'sales_view', 'sales_create', 'sales_update', 'sales_delete',
    'purchases_view', 'purchases_create', 'purchases_update', 'purchases_delete',
    'inventory_view', 'inventory_adjust', 'inventory_movements',
    'settings_view', 'settings_update', 'settings_reset',
    'reports_view', 'reports_export',
    'invoices_view', 'invoices_create', 'invoices_update', 'invoices_delete',
    'returns_view', 'returns_create', 'returns_update', 'returns_delete',
    'serial_numbers_view', 'serial_numbers_create', 'serial_numbers_update', 'serial_numbers_delete',
    'batches_view', 'batches_create', 'batches_update', 'batches_delete',
    'audit_logs_view',
    'roles_view', 'roles_create', 'roles_update', 'roles_delete',
  ],
  manager: [
    'users_view', 'users_create', 'users_update',
    'products_view', 'products_create', 'products_update',
    'categories_view', 'categories_create', 'categories_update',
    'warehouses_view', 'warehouses_create', 'warehouses_update',
    'customers_view', 'customers_create', 'customers_update',
    'suppliers_view', 'suppliers_create', 'suppliers_update',
    'sales_view', 'sales_create', 'sales_update',
    'purchases_view', 'purchases_create', 'purchases_update',
    'inventory_view', 'inventory_adjust', 'inventory_movements',
    'settings_view', 'settings_update',
    'reports_view', 'reports_export',
    'invoices_view', 'invoices_create', 'invoices_update',
    'returns_view', 'returns_create', 'returns_update',
    'serial_numbers_view', 'serial_numbers_create', 'serial_numbers_update',
    'batches_view', 'batches_create', 'batches_update',
    'audit_logs_view',
  ],
  staff: [
    'products_view',
    'categories_view',
    'warehouses_view',
    'customers_view',
    'suppliers_view',
    'sales_view', 'sales_create',
    'purchases_view',
    'inventory_view',
    'reports_view',
    'invoices_view',
    'serial_numbers_view',
    'batches_view',
  ],
  user: [
    'products_view',
    'categories_view',
    'warehouses_view',
    'customers_view',
    'suppliers_view',
    'sales_view',
    'purchases_view',
    'inventory_view',
    'reports_view',
    'invoices_view',
  ],
  viewer: [
    'products_view',
    'categories_view',
    'warehouses_view',
    'customers_view',
    'suppliers_view',
    'sales_view',
    'purchases_view',
    'inventory_view',
    'reports_view',
    'invoices_view',
  ],
};

/**
 * Get permissions for a user based on their role
 */
const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS_MAP[role] || [];
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      // Add permissions based on role
      const userWithPermissions = {
        ...parsedUser,
        permissions: getPermissionsForRole(parsedUser.role),
      };
      setUser(userWithPermissions);
      if (token) {
        apiClient.setToken(token);
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await authApi.login(email, password);
      const userData = response.user;
      // Add permissions based on role
      const userWithPermissions = {
        ...userData,
        permissions: getPermissionsForRole(userData.role),
      };
      setUser(userWithPermissions);
      localStorage.setItem('user', JSON.stringify(userWithPermissions));
      localStorage.setItem('auth_token', response.access_token);
      apiClient.setToken(response.access_token);
      addToast({ title: 'Login successful', type: 'success' });
      navigate('/');
      return userWithPermissions;
    } catch (err) {
      addToast({ title: err.message || 'Login failed', type: 'error' });
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const response = await authApi.register(data);
      const userData = response.user;
      // Add permissions based on role
      const userWithPermissions = {
        ...userData,
        permissions: getPermissionsForRole(userData.role),
      };
      setUser(userWithPermissions);
      localStorage.setItem('user', JSON.stringify(userWithPermissions));
      localStorage.setItem('auth_token', response.access_token);
      apiClient.setToken(response.access_token);
      addToast({ title: 'Registration successful', type: 'success' });
      navigate('/');
      return userWithPermissions;
    } catch (err) {
      addToast({ title: err.message || 'Register failed', type: 'error' });
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    apiClient.setToken(null);
    navigate('/login');
    addToast({ title: 'Logged out', type: 'info' });
  };

  /**
   * Refresh user permissions
   * Useful after role changes
   */
  const refreshPermissions = () => {
    if (user) {
      const updatedUser = {
        ...user,
        permissions: getPermissionsForRole(user.role),
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshPermissions }}>
      {children}
    </AuthContext.Provider>
  );
}
