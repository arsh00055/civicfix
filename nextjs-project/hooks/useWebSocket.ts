'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketProps {
  url: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (data: any) => void;
  reconnect: () => void;
  disconnect: () => void;
  lastMessage: any | null;
}

export function useWebSocket({ 
  url, 
  onMessage, 
  onOpen, 
  onClose, 
  onError,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5
}: UseWebSocketProps): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!isMounted.current) return;

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isMounted.current) return;
        
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        onOpen?.();
      };

      socket.onmessage = (event) => {
        if (!isMounted.current) return;

        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          // Still pass the raw data if parsing fails
          onMessage?.(event.data);
        }
      };

      socket.onclose = (event) => {
        if (!isMounted.current) return;

        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        onClose?.(event);

        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          console.log(`Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimerRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      socket.onerror = (error) => {
        if (!isMounted.current) return;

        console.error('WebSocket error:', error);
        onError?.(error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [url, onMessage, onOpen, onClose, onError, autoReconnect, reconnectAttempts, maxReconnectAttempts, reconnectInterval]);

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && isConnected) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        socketRef.current.send(message);
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }, [isConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close(1000, 'Client disconnected');
      socketRef.current = null;
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectAttempts(0);
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    sendMessage,
    reconnect,
    disconnect,
    lastMessage,
  };
}