import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Mobile-optimized navigation component
 * Handles touch interactions and responsive layout
 */
export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  // Close menu on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { label: 'Dashboard', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Customers', href: '/customers' },
    { label: 'Sales', href: '/sales' },
    { label: 'Purchases', href: '/purchases' },
    { label: 'Inventory', href: '/inventory' },
    { label: 'Reports', href: '/reports' },
  ];

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40 h-16">
        <div className="h-full flex items-center justify-between px-4 gap-2">
          {/* Menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo/Title */}
          <div className="flex-1 text-center">
            <Link to="/" className="text-sm font-semibold">
              Inventory
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar (mobile) */}
      {searchOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-39 p-4">
          <input
            type="search"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onBlur={() => setSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <nav
            className="fixed left-0 right-0 top-16 bottom-0 bg-white dark:bg-gray-800 z-40 md:hidden overflow-y-auto"
            role="navigation"
          >
            <div className="space-y-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User section */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              <div className="flex gap-2 pt-2">
                <Link
                  to="/settings"
                  className="flex-1 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </>
      )}

      {/* Spacer for fixed header */}
      <div className="md:hidden h-16" />
    </>
  );
}
