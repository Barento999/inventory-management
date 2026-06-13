import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/dashboard/Dashboard';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ProductList from '../pages/products/ProductList';
import ProductDetails from '../pages/products/ProductDetails';
import CategoryList from '../pages/categories/CategoryList';
import CategoryDetails from '../pages/categories/CategoryDetails';
import SupplierList from '../pages/suppliers/SupplierList';
import CustomerList from '../pages/customers/CustomerList';
import Inventory from '../pages/inventory/Inventory';
import PurchaseList from '../pages/purchases/PurchaseList';
import SaleList from '../pages/sales/SaleList';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import { useAuth } from '../context/AuthContext';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
      <Route path="/reset-password/:token" element={<GuestOnly><ResetPassword /></GuestOnly>} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/create" element={<ProductDetails />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/:id" element={<CategoryDetails />} />
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="purchases" element={<PurchaseList />} />
        <Route path="sales" element={<SaleList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
