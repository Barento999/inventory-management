import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ProtectedRoute, AccessDenied } from '../components/ProtectedRoute';
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
import CustomReportBuilder from '../pages/reports/CustomReportBuilder';
import Settings from '../pages/settings/Settings';
import WarehouseList from '../pages/warehouses/WarehouseList';
import WarehouseDetails from '../pages/warehouses/WarehouseDetails';
import SerialNumberList from '../pages/serial-numbers/SerialNumberList';
import BatchList from '../pages/batches/BatchList';
import QuoteList from '../pages/quotes/QuoteList';
import ReturnList from '../pages/returns/ReturnList';
import InvoiceList from '../pages/invoices/InvoiceList';
import UserList from '../pages/users/UserList';
import AuditLogList from '../pages/audit-logs/AuditLogList';
import ShippingList from '../pages/shipping/ShippingList';
import VendorPortal from '../pages/vendors/VendorPortal';
import OrderCalendar from '../pages/calendar/OrderCalendar';
import OrderKanban from '../pages/kanban/OrderKanban';
import { useAuth } from '../context/AuthContext';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
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
        <Route index element={<ProtectedRoute permission="reports_view"><Dashboard /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute permission="products_view"><ProductList /></ProtectedRoute>} />
        <Route path="products/create" element={<ProtectedRoute permission="products_create"><ProductDetails /></ProtectedRoute>} />
        <Route path="products/:id" element={<ProtectedRoute permission="products_view"><ProductDetails /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute permission="categories_view"><CategoryList /></ProtectedRoute>} />
        <Route path="categories/:id" element={<ProtectedRoute permission="categories_view"><CategoryDetails /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute permission="suppliers_view"><SupplierList /></ProtectedRoute>} />
        <Route path="vendors" element={<ProtectedRoute permission="suppliers_view"><VendorPortal /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute permission="customers_view"><CustomerList /></ProtectedRoute>} />
        <Route path="warehouses" element={<ProtectedRoute permission="warehouses_view"><WarehouseList /></ProtectedRoute>} />
        <Route path="warehouses/create" element={<ProtectedRoute permission="warehouses_create"><WarehouseDetails /></ProtectedRoute>} />
        <Route path="warehouses/:id" element={<ProtectedRoute permission="warehouses_view"><WarehouseDetails /></ProtectedRoute>} />
        <Route path="serial-numbers" element={<ProtectedRoute permission="serial_numbers_view"><SerialNumberList /></ProtectedRoute>} />
        <Route path="batches" element={<ProtectedRoute permission="batches_view"><BatchList /></ProtectedRoute>} />
        <Route path="quotes" element={<ProtectedRoute permission="quotes_view"><QuoteList /></ProtectedRoute>} />
        <Route path="returns" element={<ProtectedRoute permission="returns_view"><ReturnList /></ProtectedRoute>} />
        <Route path="invoices" element={<ProtectedRoute permission="invoices_view"><InvoiceList /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute permission="users_view"><UserList /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute permission="audit_logs_view"><AuditLogList /></ProtectedRoute>} />
        <Route path="shipping" element={<ProtectedRoute permission="sales_view"><ShippingList /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute permission="inventory_view"><Inventory /></ProtectedRoute>} />
        <Route path="purchases" element={<ProtectedRoute permission="purchases_view"><PurchaseList /></ProtectedRoute>} />
        <Route path="sales" element={<ProtectedRoute permission="sales_view"><SaleList /></ProtectedRoute>} />
        <Route path="calendar" element={<ProtectedRoute permission="sales_view"><OrderCalendar /></ProtectedRoute>} />
        <Route path="kanban" element={<ProtectedRoute permission="sales_view"><OrderKanban /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute permission="reports_view"><Reports /></ProtectedRoute>} />
        <Route path="reports/custom" element={<ProtectedRoute permission="reports_view"><CustomReportBuilder /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute permission="settings_view"><Settings /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
