// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth(); // Removed unused 'user'
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Clean up socket connection
  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      // Remove all listeners before disconnecting
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setConnectionError(null);
    }
  }, []);

  useEffect(() => {
    // Clean up existing socket
    cleanupSocket();

    if (!isAuthenticated || !token) {
      return;
    }

    // Use environment variable for socket URL
    const wsUrl =  'https://crmserver-production-4a42.up.railway.app';
    
    console.log('Attempting to connect to socket at:', wsUrl);

    try {
      const socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true,
      });

      // Setup event listeners
      const handleConnect = () => {
        console.log('Socket connected successfully');
        setConnected(true);
        setConnectionError(null);
      };

      const handleConnectError = (error) => {
        console.warn('Socket connection error:', error.message);
        setConnected(false);
        setConnectionError(error.message);
      };

      const handleDisconnect = (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
      };

      const handleReconnect = (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setConnected(true);
        setConnectionError(null);
      };

      const handleConnected = (data) => {
        console.log('Socket acknowledged connection:', data);
        setConnected(true);
      };

      // Register all event listeners
      socket.on('connect', handleConnect);
      socket.on('connect_error', handleConnectError);
      socket.on('disconnect', handleDisconnect);
      socket.on('reconnect', handleReconnect);
      socket.on('connected', handleConnected);

      socketRef.current = socket;

      // Cleanup function for this effect run
      return () => {
        if (socket) {
          socket.off('connect', handleConnect);
          socket.off('connect_error', handleConnectError);
          socket.off('disconnect', handleDisconnect);
          socket.off('reconnect', handleReconnect);
          socket.off('connected', handleConnected);
          socket.disconnect();
        }
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionError(error.message);
    }
  }, [isAuthenticated, token, cleanupSocket]);

  const emit = useCallback((event, data, callback) => {
    if (socketRef.current && connected) {
      if (callback) {
        socketRef.current.emit(event, data, callback);
      } else {
        socketRef.current.emit(event, data);
      }
    } else {
      console.warn(`Socket not connected (connected: ${connected}), cannot emit:`, event);
      if (callback) {
        callback(new Error('Socket not connected'));
      }
    }
  }, [connected]);

  const joinProject = useCallback((projectId) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('join-project', projectId);
    } else {
      console.warn('Cannot join project, socket not connected');
    }
  }, [connected]);

  const leaveProject = useCallback((projectId) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('leave-project', projectId);
    }
  }, [connected]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.connect();
        }
      }, 500);
    }
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    connectionError,
    emit,
    joinProject,
    leaveProject,
    reconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};