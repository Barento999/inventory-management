import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export default function NotificationSettings() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    email_on_order: true,
    email_on_shipment: true,
    email_on_return: true,
    email_on_low_stock: true,
    email_digest: 'daily',
    push_enabled: true,
    push_on_urgent: true,
    sms_enabled: false,
    sms_phone: '',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings/notifications');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setLoading(true);
      await apiClient.put('/settings/notifications', settings);
      addToast({
        title: 'Success',
        description: 'Notification settings updated',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to save settings',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-8">
        <Bell className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Notification Settings</h1>
      </div>

      {/* Email Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Email Notifications</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <input
              type="checkbox"
              checked={settings.email_on_order}
              onChange={() => handleToggle('email_on_order')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Order Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get emails when orders are placed or updated</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <input
              type="checkbox"
              checked={settings.email_on_shipment}
              onChange={() => handleToggle('email_on_shipment')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Shipment Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get emails on shipment status changes</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <input
              type="checkbox"
              checked={settings.email_on_return}
              onChange={() => handleToggle('email_on_return')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Return Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get emails for return requests and updates</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <input
              type="checkbox"
              checked={settings.email_on_low_stock}
              onChange={() => handleToggle('email_on_low_stock')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Low Stock Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get emails when products reach low stock levels</p>
            </div>
          </label>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="block mb-2">
              <p className="font-medium text-gray-900 dark:text-white mb-1">Email Digest Frequency</p>
              <select
                value={settings.email_digest}
                onChange={(e) => handleChange('email_digest', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="instant">Instant</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold">Push Notifications</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
            <input
              type="checkbox"
              checked={settings.push_enabled}
              onChange={() => handleToggle('push_enabled')}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Push Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications on your devices</p>
            </div>
          </label>

          {settings.push_enabled && (
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
              <input
                type="checkbox"
                checked={settings.push_on_urgent}
                onChange={() => handleToggle('push_on_urgent')}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Urgent Alerts Only</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Only push notifications for urgent events</p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold">Quiet Hours</h2>
        </div>

        <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 mb-4">
          <input
            type="checkbox"
            checked={settings.quiet_hours_enabled}
            onChange={() => handleToggle('quiet_hours_enabled')}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Enable Quiet Hours</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Mute non-urgent notifications during quiet hours</p>
          </div>
        </label>

        {settings.quiet_hours_enabled && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={settings.quiet_hours_start}
                onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                End Time
              </label>
              <input
                type="time"
                value={settings.quiet_hours_end}
                onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SMS Notifications (disabled by default) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 opacity-50">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold">SMS Notifications</h2>
          <span className="ml-auto px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded">
            Coming Soon
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">SMS notifications will be available soon</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={fetchSettings}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 disabled:opacity-50"
          disabled={loading}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          disabled={loading}
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          Save Changes
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 Tip: Customize your notification preferences to stay informed without being overwhelmed. You can always adjust these settings later.
        </p>
      </div>
    </div>
  );
}
