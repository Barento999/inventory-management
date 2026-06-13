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

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/create" element={<ProductDetails />} />
        <Route path="products/:id" element={<ProductDetails />} />
        {/* Categories */}
        <Route path="categories" element={<CategoryList />} />
        {/* Suppliers */}
        <Route path="suppliers" element={<SupplierList />} />
        {/* Customers */}
        <Route path="customers" element={<CustomerList />} />
        {/* Inventory */}
        <Route path="inventory" element={<Inventory />} />
        {/* Purchases */}
        <Route path="purchases" element={<PurchaseList />} />
        {/* Sales */}
        <Route path="sales" element={<SaleList />} />
        {/* Reports */}
        <Route path="reports" element={<Reports />} />
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
