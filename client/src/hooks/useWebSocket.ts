import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketProps {
  url: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = ({ url, onConnect, onDisconnect }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(url, {
      transports: ['websocket'],
      timeout: 10000,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      onConnect?.();
      console.log('WebSocket connected');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      onDisconnect?.();
      console.log('WebSocket disconnected');
    });

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url, onConnect, onDisconnect]);

  const emit = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket not connected');
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketRef.current?.off(event, callback);
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off
  };
};