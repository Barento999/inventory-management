import React from 'react';
import { Search, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function TopNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-8 pr-4 py-1 w-64 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="w-5 h-5" />
        </button>
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        {/* Profile */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name || 'Guest'}</span>
          <button
            onClick={logout}
            className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-light"
          >Logout</button>
        </div>
      </div>
    </header>
  );
}
