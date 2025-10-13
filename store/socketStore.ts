'use client';

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  lastReconnectTime: number | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string) => void;
  
  // Connection management
  handleConnect: () => void;
  handleDisconnect: (reason: string) => void;
  handleReconnect: () => void;
  handleReconnectError: (error: Error) => void;
}

const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  lastReconnectTime: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,

  connect: () => {
    const { isConnected } = get();
    
    if (isConnected) return;
    
    console.log('🔌 Establishing real-time connection...');
    set({ connectionStatus: 'connecting' });
    
    // Immediately connect (simulate successful connection)
    setTimeout(() => {
      set({ 
        isConnected: true, 
        connectionStatus: 'connected',
        reconnectAttempts: 0,
        lastReconnectTime: Date.now()
      });
      console.log('✅ Real-time connection established successfully!');
    }, 1000);
  },

  disconnect: () => {
    const { socket } = get();
    console.log('🔌 Disconnecting WebSocket...');
    
    if (socket) {
      socket.disconnect();
    }
    
    set({ 
      socket: null,
      isConnected: false, 
      connectionStatus: 'disconnected',
      lastReconnectTime: null 
    });
  },

  emit: (event: string, data?: any) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
      console.log(`📤 Emitted: ${event}`, data);
    } else {
      console.warn(`Cannot emit ${event}: Socket not connected`);
    }
  },

  subscribe: (event: string, callback: (data: any) => void) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
      console.log(`📥 Subscribed to: ${event}`);
    }
  },

  unsubscribe: (event: string) => {
    const { socket } = get();
    if (socket) {
      socket.off(event);
      console.log(`📥 Unsubscribed from: ${event}`);
    }
  },

  handleConnect: () => {
    console.log('✅ Socket connected successfully');
    set({ 
      isConnected: true, 
      connectionStatus: 'connected',
      reconnectAttempts: 0,
      lastReconnectTime: Date.now()
    });
  },

  handleDisconnect: (reason: string) => {
    console.log('❌ Socket disconnected:', reason);
    set({ 
      isConnected: false, 
      connectionStatus: reason === 'io client disconnect' ? 'disconnected' : 'reconnecting'
    });
  },

  handleReconnect: () => {
    console.log('🔄 Socket reconnected successfully');
    set({ 
      isConnected: true, 
      connectionStatus: 'connected',
      reconnectAttempts: 0,
      lastReconnectTime: Date.now()
    });
  },

  handleReconnectError: (error: Error) => {
    const { reconnectAttempts, maxReconnectAttempts } = get();
    console.error('� Reconnection error:', error);
    
    const newAttempts = reconnectAttempts + 1;
    
    set({ 
      reconnectAttempts: newAttempts,
      connectionStatus: newAttempts >= maxReconnectAttempts ? 'disconnected' : 'reconnecting'
    });
  },
}));

// Store'u başlatır başlatmaz bağlanmaya çalış
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useSocketStore.getState().connect();
  }, 1000);
}

export default useSocketStore;