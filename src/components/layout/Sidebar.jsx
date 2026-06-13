import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Folder,
  Boxes,
  Truck,
  ShoppingCart,
  Users,
  BarChart2,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Folder },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
      <nav className="mt-8">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm font-medium ${
                isActive
                  ? 'text-primary bg-gray-100 dark:bg-gray-700 rounded'
                  : 'text-gray-600 hover:text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
