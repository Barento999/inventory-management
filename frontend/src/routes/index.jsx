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
    return null; // or return a loading spinner
  }
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return null; // or return a loading spinner
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
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/create" element={<ProductDetails />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/:id" element={<CategoryDetails />} />
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="vendors" element={<VendorPortal />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="warehouses" element={<WarehouseList />} />
        <Route path="warehouses/create" element={<WarehouseDetails />} />
        <Route path="warehouses/:id" element={<WarehouseDetails />} />
        <Route path="serial-numbers" element={<SerialNumberList />} />
        <Route path="batches" element={<BatchList />} />
        <Route path="quotes" element={<QuoteList />} />
        <Route path="returns" element={<ReturnList />} />
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="users" element={<UserList />} />
        <Route path="audit-logs" element={<AuditLogList />} />
        <Route path="shipping" element={<ShippingList />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="purchases" element={<PurchaseList />} />
        <Route path="sales" element={<SaleList />} />
        <Route path="calendar" element={<OrderCalendar />} />
        <Route path="kanban" element={<OrderKanban />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/custom" element={<CustomReportBuilder />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
