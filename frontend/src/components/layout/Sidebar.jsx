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

const navSections = [
  {
    id: 'dashboard',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['admin', 'manager', 'staff', 'viewer'] },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    roles: ['admin', 'manager', 'staff', 'viewer'],
    items: [
      { to: '/products', label: 'Products', icon: Package, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/categories', label: 'Categories', icon: Folder, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/warehouses', label: 'Warehouses', icon: Warehouse, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/serial-numbers', label: 'Serial Numbers', icon: ScanLine, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/batches', label: 'Batches', icon: Layers, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/inventory', label: 'Inventory', icon: Boxes, roles: ['admin', 'manager', 'staff', 'viewer'] },
    ],
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    icon: Truck,
    roles: ['admin', 'manager', 'staff', 'viewer'],
    items: [
      { to: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/vendors', label: 'Vendor Portal', icon: Building2, roles: ['admin', 'manager'] },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    roles: ['admin', 'manager', 'staff', 'viewer'],
    items: [
      { to: '/purchases', label: 'Purchases', icon: ShoppingCart, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/sales', label: 'Sales', icon: Receipt, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/kanban', label: 'Order Board', icon: Kanban, roles: ['admin', 'manager', 'staff'] },
      { to: '/calendar', label: 'Calendar', icon: CalendarIcon, roles: ['admin', 'manager', 'staff'] },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    roles: ['admin', 'manager', 'staff', 'viewer'],
    items: [
      { to: '/quotes', label: 'Quotes', icon: FileText, roles: ['admin', 'manager', 'staff'] },
      { to: '/returns', label: 'Returns', icon: RotateCcw, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/invoices', label: 'Invoices', icon: DollarSign, roles: ['admin', 'manager', 'staff', 'viewer'] },
      { to: '/shipping', label: 'Shipping', icon: PackageCheck, roles: ['admin', 'manager', 'staff'] },
    ],
  },
  {
    id: 'customers',
    roles: ['admin', 'manager', 'staff', 'viewer'],
    items: [
      { to: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'staff', 'viewer'] },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Shield,
    roles: ['admin', 'manager'],
    items: [
      { to: '/users', label: 'Users', icon: Shield, roles: ['admin', 'manager'] },
      { to: '/audit-logs', label: 'Audit Logs', icon: History, roles: ['admin', 'manager'] },
    ],
  },
  {
    id: 'reports',
    roles: ['admin', 'manager', 'staff', 'viewer'],
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart2, roles: ['admin', 'manager', 'staff', 'viewer'] },
    ],
  },
  {
    id: 'settings',
    roles: ['admin', 'manager'],
    items: [
      { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager'] },
    ],
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();
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

  // Filter navigation sections based on user role
  const userRole = user?.role || 'viewer';
  const filteredNavSections = navSections
    .filter(section => !section.roles || section.roles.includes(userRole))
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.roles || item.roles.includes(userRole))
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
