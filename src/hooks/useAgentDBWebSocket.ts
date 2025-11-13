// src/hooks/useAgentDBWebSocket.ts
// React hook for real-time data updates via WebSocket

import { useState, useEffect, useRef, useCallback } from 'react';

export interface DashboardData {
  lineChartData: Array<{ timestamp: string; value: number }>;
  barChartData: Array<{ category: string; count: number }>;
  pieChartData: Array<{ category: string; count: number }>;
  totalEvents: number;
  lastUpdated: string;
}

interface WebSocketMessage {
  type: 'initial' | 'update';
  data: DashboardData;
  timestamp?: string;
}

interface UseAgentDBWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Custom React hook for real-time AgentDB data via WebSocket
 *
 * Automatically handles:
 * - Connection management
 * - Reconnection logic
 * - Real-time data updates
 * - Error handling
 */
export function useAgentDBWebSocket(options: UseAgentDBWebSocketOptions) {
  const {
    url,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const reconnectAttemptRef = useRef(0);
  const intentionalCloseRef = useRef(false);

  // Stable callback refs to avoid dependency issues
  const onErrorRef = useRef(onError);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  useEffect(() => {
    onErrorRef.current = onError;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  }, [onError, onConnect, onDisconnect]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      console.log('[WebSocket Hook] Connecting to:', url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WebSocket Hook] Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
        setReconnectAttempt(0);
        onConnectRef.current?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log(`[WebSocket Hook] Received ${message.type} message`);
          setData(message.data);
        } catch (err) {
          console.error('[WebSocket Hook] Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket Hook] Error:', event);
        setError('WebSocket connection error');
        onErrorRef.current?.(event);
      };

      ws.onclose = () => {
        console.log('[WebSocket Hook] Disconnected');
        setIsConnected(false);
        wsRef.current = null;
        onDisconnectRef.current?.();

        // Don't attempt reconnection if this was an intentional close (e.g., React StrictMode cleanup)
        if (intentionalCloseRef.current) {
          intentionalCloseRef.current = false;
          return;
        }

        // Attempt reconnection
        if (mountedRef.current && reconnectAttemptRef.current < maxReconnectAttempts) {
          reconnectAttemptRef.current += 1;
          console.log(
            `[WebSocket Hook] Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts})`
          );
          setReconnectAttempt(reconnectAttemptRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptRef.current >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket Hook] Connection failed:', err);
      setError('Failed to establish WebSocket connection');
    }
  }, [url, reconnectInterval, maxReconnectAttempts]);

  // Initial connection
  useEffect(() => {
    mountedRef.current = true;
    connect();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        // Mark this as an intentional close to prevent reconnection attempts
        intentionalCloseRef.current = true;
        // Close the WebSocket
        if (wsRef.current.readyState === WebSocket.OPEN ||
            wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectAttemptRef.current = 0;
    setReconnectAttempt(0);
    connect();
  }, [connect]);

  return {
    data,
    isConnected,
    error,
    reconnectAttempt,
    reconnect,
  };
}
