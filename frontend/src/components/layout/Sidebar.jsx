import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Folder,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  Users,
  BarChart2,
  Settings,
  Warehouse,
  ScanLine,
  Layers,
  FileText,
  RotateCcw,
  DollarSign,
  Shield,
  History,
  PackageCheck,
  Building2,
  Calendar as CalendarIcon,
  Kanban,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_GROUPS } from '../../utils/permissions';

const navSections = [
  {
    id: 'dashboard',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, permission: 'dashboard_view' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    permission: PERMISSION_GROUPS.PRODUCTS.VIEW,
    items: [
      { to: '/products', label: 'Products', icon: Package, permission: PERMISSION_GROUPS.PRODUCTS.VIEW },
      { to: '/categories', label: 'Categories', icon: Folder, permission: PERMISSION_GROUPS.CATEGORIES.VIEW },
      { to: '/warehouses', label: 'Warehouses', icon: Warehouse, permission: PERMISSION_GROUPS.WAREHOUSES.VIEW },
      { to: '/serial-numbers', label: 'Serial Numbers', icon: ScanLine, permission: PERMISSION_GROUPS.SERIAL_NUMBERS.VIEW },
      { to: '/batches', label: 'Batches', icon: Layers, permission: PERMISSION_GROUPS.BATCHES.VIEW },
      { to: '/inventory', label: 'Inventory', icon: Boxes, permission: PERMISSION_GROUPS.INVENTORY.VIEW },
    ],
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    icon: Truck,
    permission: PERMISSION_GROUPS.SUPPLIERS.VIEW,
    items: [
      { to: '/suppliers', label: 'Suppliers', icon: Truck, permission: PERMISSION_GROUPS.SUPPLIERS.VIEW },
      { to: '/vendors', label: 'Vendor Portal', icon: Building2, permission: PERMISSION_GROUPS.SUPPLIERS.VIEW },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    permission: PERMISSION_GROUPS.PURCHASES.VIEW,
    items: [
      { to: '/purchases', label: 'Purchases', icon: ShoppingCart, permission: PERMISSION_GROUPS.PURCHASES.VIEW },
      { to: '/sales', label: 'Sales', icon: Receipt, permission: PERMISSION_GROUPS.SALES.VIEW },
      { to: '/kanban', label: 'Order Board', icon: Kanban, permission: PERMISSION_GROUPS.PURCHASES.VIEW },
      { to: '/calendar', label: 'Calendar', icon: CalendarIcon, permission: PERMISSION_GROUPS.PURCHASES.VIEW },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    permission: PERMISSION_GROUPS.INVOICES.VIEW,
    items: [
      { to: '/quotes', label: 'Quotes', icon: FileText, permission: 'quotes_view' },
      { to: '/returns', label: 'Returns', icon: RotateCcw, permission: PERMISSION_GROUPS.RETURNS.VIEW },
      { to: '/invoices', label: 'Invoices', icon: DollarSign, permission: PERMISSION_GROUPS.INVOICES.VIEW },
      { to: '/shipping', label: 'Shipping', icon: PackageCheck, permission: 'shipping_view' },
    ],
  },
  {
    id: 'customers',
    permission: PERMISSION_GROUPS.CUSTOMERS.VIEW,
    items: [
      { to: '/customers', label: 'Customers', icon: Users, permission: PERMISSION_GROUPS.CUSTOMERS.VIEW },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Shield,
    permission: PERMISSION_GROUPS.USERS.VIEW,
    items: [
      { to: '/users', label: 'Users', icon: Shield, permission: PERMISSION_GROUPS.USERS.VIEW },
      { to: '/audit-logs', label: 'Audit Logs', icon: History, permission: PERMISSION_GROUPS.AUDIT_LOGS.VIEW },
    ],
  },
  {
    id: 'reports',
    permission: PERMISSION_GROUPS.REPORTS.VIEW,
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart2, permission: PERMISSION_GROUPS.REPORTS.VIEW },
    ],
  },
  {
    id: 'settings',
    permission: PERMISSION_GROUPS.SETTINGS.VIEW,
    items: [
      { to: '/settings', label: 'Settings', icon: Settings, permission: PERMISSION_GROUPS.SETTINGS.VIEW },
    ],
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();
  const { has } = usePermissions();
  const [openSections, setOpenSections] = useState(() => {
    const saved = localStorage.getItem('sidebarSections');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleSection = (sectionId) => {
    setOpenSections(prev => {
      const newOpen = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem('sidebarSections', JSON.stringify(newOpen));
      return newOpen;
    });
  };

  // Filter navigation sections based on user permissions
  const filteredNavSections = navSections
    .filter(section => !section.permission || has(section.permission))
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.permission || has(item.permission))
    }))
    .filter(section => section.items.length > 0); // Remove sections with no visible items

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform md:transform-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-lg font-bold text-primary">InventoryPro</h1>
          <p className="text-xs text-gray-500">Inventory SaaS</p>
          {user && (
            <p className="text-xs text-gray-500 mt-2">
              Role: <span className="font-semibold capitalize">{user.role}</span>
            </p>
          )}
        </div>
        <nav className="mt-4 pb-4 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-5rem)]">
          {filteredNavSections.map((section) => {
            const isOpen = openSections[section.id] || false;
            const hasLabel = section.label;
            const Icon = section.icon;

            return (
              <div key={section.id}>
                {hasLabel ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium mx-2 rounded text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0" />
                      {section.label}
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                ) : null}
                {isOpen || !hasLabel ? (
                  <div className={`${hasLabel ? 'ml-4' : ''}`}>
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-sm font-medium mx-2 rounded ${
                            isActive
                              ? 'text-primary bg-primary/10'
                              : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        {hasLabel ? null : <item.icon className="w-5 h-5 shrink-0" />}
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
