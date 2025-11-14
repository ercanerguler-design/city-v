'use client';

import { create } from 'zustand';

interface SocketStore {
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
}

const useSocketStore = create<SocketStore>((set, get) => ({
  isConnected: false,
  connectionStatus: 'disconnected',
  lastReconnectTime: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,

  connect: () => {
    const { isConnected } = get();
    
    if (isConnected) return;
    
    console.log('🔌 Starting mock WebSocket connection...');
    set({ connectionStatus: 'connecting' });
    
    // Mock bağlantı simülasyonu - 2 saniye sonra bağlantıyı başarılı olarak simüle et
    setTimeout(() => {
      set({ 
        isConnected: true, 
        connectionStatus: 'connected',
        reconnectAttempts: 0,
        lastReconnectTime: Date.now()
      });
      console.log('✅ Mock WebSocket connection established successfully!');
    }, 2000);
  },

  disconnect: () => {
    console.log('🔌 Disconnecting mock WebSocket...');
    set({ 
      isConnected: false, 
      connectionStatus: 'disconnected',
      lastReconnectTime: null 
    });
  },

  emit: (event: string, data?: any) => {
    const { isConnected } = get();
    if (isConnected) {
      console.log(`📤 Mock emit: ${event}`, data);
    } else {
      console.warn(`Cannot emit ${event}: Socket not connected`);
    }
  },

  subscribe: (event: string, callback: (data: any) => void) => {
    console.log(`📥 Mock subscribe to: ${event}`);
    // Mock olayları simüle etmek için gerekirse burada callback'leri saklayabilirsiniz
  },

  unsubscribe: (event: string) => {
    console.log(`📥 Mock unsubscribe from: ${event}`);
  },
}));

// Store'u başlatır başlatmaz bağlanmaya çalış
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useSocketStore.getState().connect();
  }, 1000);
}

export default useSocketStore;