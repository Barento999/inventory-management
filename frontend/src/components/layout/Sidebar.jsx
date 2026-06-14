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

const navSections = [
  {
    id: 'dashboard',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    items: [
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: Folder },
      { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
      { to: '/serial-numbers', label: 'Serial Numbers', icon: ScanLine },
      { to: '/batches', label: 'Batches', icon: Layers },
      { to: '/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    icon: Truck,
    items: [
      { to: '/suppliers', label: 'Suppliers', icon: Truck },
      { to: '/vendors', label: 'Vendor Portal', icon: Building2 },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    items: [
      { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
      { to: '/sales', label: 'Sales', icon: Receipt },
      { to: '/kanban', label: 'Order Board', icon: Kanban },
      { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    items: [
      { to: '/quotes', label: 'Quotes', icon: FileText },
      { to: '/returns', label: 'Returns', icon: RotateCcw },
      { to: '/invoices', label: 'Invoices', icon: DollarSign },
      { to: '/shipping', label: 'Shipping', icon: PackageCheck },
    ],
  },
  {
    id: 'customers',
    items: [
      { to: '/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Shield,
    items: [
      { to: '/users', label: 'Users', icon: Shield },
      { to: '/audit-logs', label: 'Audit Logs', icon: History },
    ],
  },
  {
    id: 'reports',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart2 },
    ],
  },
  {
    id: 'settings',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
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
        <nav className="mt-4 pb-4 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {navSections.map((section) => {
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
