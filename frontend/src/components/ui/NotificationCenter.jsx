import React, { useState, useEffect } from 'react';
import Button from './Button';
import Modal from './Modal';
import Badge from './Badge';
import { Bell, X, Check, Settings, Clock, Trash2, ShoppingCart, Truck } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { notificationsApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';

export default function NotificationCenter() {
  const { version, refresh } = useDataRefresh();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('notificationPreferences');
    return saved ? JSON.parse(saved) : {
      lowStock: true,
      sales: true,
      purchases: true,
      system: true,
      sound: true,
      desktop: false,
    };
  });

  const { data: notifications, loading, reload } = useApi(() => notificationsApi.list(), [version]);

  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      refresh();
      reload();
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const markAllAsRead = async () => {
    try {
      for (const notification of notifications?.filter(n => !n.read) || []) {
        await notificationsApi.markAsRead(notification.id);
      }
      refresh();
      reload();
      addToast({ title: 'All notifications marked as read', type: 'success' });
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsApi.delete(id);
      refresh();
      reload();
      addToast({ title: 'Notification deleted', type: 'success' });
    } catch (err) {
      addToast({ title: err.message, type: 'error' });
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      low_stock: Bell,
      sale: ShoppingCart,
      purchase: Truck,
      system: Settings,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      low_stock: 'bg-yellow-500',
      sale: 'bg-green-500',
      purchase: 'bg-blue-500',
      system: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <>
      <div className="relative">
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Notifications" size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <Check className="w-4 h-4 mr-1" /> Mark All Read
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-1" /> Settings
              </Button>
            </div>
            <span className="text-sm text-gray-500">{unreadCount} unread</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : notifications?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No notifications</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications?.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const color = getNotificationColor(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${color} text-white shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {!notification.read && (
                              <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(notification.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Notification Settings">
        <div className="space-y-4">
          <h3 className="font-medium">Notification Types</h3>
          <div className="space-y-2">
            {Object.entries(preferences).filter(([key]) => !['sound', 'desktop'].includes(key)).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                  className="rounded"
                />
              </div>
            ))}
          </div>

          <h3 className="font-medium pt-4 border-t">Alert Methods</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sound Alerts</span>
              <input
                type="checkbox"
                checked={preferences.sound}
                onChange={(e) => setPreferences({ ...preferences, sound: e.target.checked })}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Desktop Notifications</span>
              <input
                type="checkbox"
                checked={preferences.desktop}
                onChange={(e) => {
                  setPreferences({ ...preferences, desktop: e.target.checked });
                  if (e.target.checked && 'Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
                className="rounded"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setIsSettingsOpen(false)}>Save Settings</Button>
            <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
