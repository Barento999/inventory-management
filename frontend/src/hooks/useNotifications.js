import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';

/**
 * Hook for managing real-time notifications
 * Uses polling as fallback for WebSocket-less environments
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications', {
        params: { limit: 50, unread_only: false },
      });
      
      const notifs = Array.isArray(response.data) ? response.data : [];
      setNotifications(notifs);
      
      // Count unread
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await apiClient.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, []);

  // Start polling
  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};
