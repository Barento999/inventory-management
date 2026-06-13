import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { searchApi, notificationsApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { formatDateTime } from '../../utils/format';

export default function TopNavbar({ onMenuToggle, mobileOpen }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { version, refresh } = useDataRefresh();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef(null);

  const { data: results } = useApi(
    () => (query.trim().length >= 2 ? searchApi.global(query) : Promise.resolve(null)),
    [query, version]
  );
  const { data: notifications, reload: reloadNotif } = useApi(
    () => notificationsApi.list(),
    [version]
  );

  const unread = notifications?.filter((n) => !n.read).length || 0;

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    reloadNotif();
    refresh();
  };

  const renderResults = () => {
    if (!results || !query.trim()) return null;
    const sections = [
      { key: 'products', label: 'Products', path: (r) => `/products/${r.id}`, labelFn: (r) => r.name },
      { key: 'customers', label: 'Customers', path: () => '/customers', labelFn: (r) => r.name },
      { key: 'suppliers', label: 'Suppliers', path: () => '/suppliers', labelFn: (r) => r.name },
      { key: 'purchases', label: 'Purchases', path: () => '/purchases', labelFn: (r) => `PO #${r.id} — ${r.supplierName}` },
      { key: 'sales', label: 'Sales', path: () => '/sales', labelFn: (r) => `SO #${r.id} — ${r.customerName}` },
    ];
    const hasAny = sections.some((s) => results[s.key]?.length);
    if (!hasAny) return <p className="p-3 text-sm text-gray-500">No results found</p>;

    return sections.map((s) =>
      results[s.key]?.length ? (
        <div key={s.key} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
          <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">{s.label}</p>
          {results[s.key].map((r) => (
            <Link
              key={`${s.key}-${r.id}`}
              to={s.path(r)}
              onClick={() => { setSearchOpen(false); setQuery(''); }}
              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {s.labelFn(r)}
            </Link>
          ))}
        </div>
      ) : null
    );
  };

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 relative z-20">
      <div className="flex items-center gap-3 flex-1">
        <button type="button" onClick={onMenuToggle} className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Menu">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, customers..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            className="pl-9 pr-4 py-1.5 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:border-gray-600 text-sm"
          />
          {searchOpen && query.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-80 overflow-y-auto">
              {renderResults()}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-50">
              <div className="flex justify-between items-center px-3 py-2 border-b dark:border-gray-700">
                <span className="text-sm font-semibold">Notifications</span>
                {unread > 0 && (
                  <button type="button" onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications?.length ? notifications.slice(0, 8).map((n) => (
                  <div key={n.id} className={`px-3 py-2 border-b dark:border-gray-700 text-sm ${n.read ? 'opacity-60' : ''}`}>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-gray-500 text-xs">{n.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDateTime(n.createdAt)}</p>
                  </div>
                )) : (
                  <p className="p-3 text-sm text-gray-500">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        <button type="button" onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <button type="button" onClick={() => navigate('/settings')} className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-primary">
            {user?.name || 'Guest'}
          </button>
          <button type="button" onClick={logout} className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-light">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
