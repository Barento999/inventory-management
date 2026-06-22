import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook for managing WebSocket connection for real-time notifications
 * 
 * Usage:
 * const { isConnected, send, onMessage } = useWebSocket(token);
 * 
 * onMessage((data) => {
 *   console.log('Received:', data);
 * });
 */
export function useWebSocket(token, onMessageCallback = null) {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const messageCallbacks = useRef(new Set());
  const pingInterval = useRef(null);

  // Register message callback
  const onMessage = useCallback((callback) => {
    messageCallbacks.current.add(callback);
    return () => messageCallbacks.current.delete(callback);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws/notifications/${token}`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);

        // Send ping every 30 seconds to keep connection alive
        pingInterval.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Call all registered callbacks
          messageCallbacks.current.forEach(callback => {
            callback(data);
          });

          // Call the passed callback if provided
          onMessageCallback?.(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Clear ping interval
        if (pingInterval.current) {
          clearInterval(pingInterval.current);
        }

        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError(err.message);
    }
  }, [token, onMessageCallback]);

  // Send message through WebSocket
  const send = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    isConnected,
    error,
    send,
    onMessage,
    disconnect,
  };
}

/**
 * Hook for receiving and managing WebSocket notifications
 */
export function useNotificationSocket(token) {
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);

  const { isConnected, onMessage } = useWebSocket(token);

  useEffect(() => {
    const unsubscribe = onMessage((data) => {
      if (data.type === 'notification') {
        const notification = {
          id: Date.now(),
          ...data.data,
          receivedAt: new Date(),
        };
        
        setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
        setLatestNotification(notification);
      }
    });

    return unsubscribe;
  }, [onMessage]);

  return {
    isConnected,
    notifications,
    latestNotification,
    clearNotifications: () => setNotifications([]),
  };
}
