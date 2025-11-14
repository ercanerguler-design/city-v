'use client';

import { create } from 'zustand';
import useSocketStore from './socketStore';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  message: string;
  timestamp: number;
  type: 'text' | 'location' | 'image' | 'system';
  status: 'sent' | 'delivered' | 'read';
  metadata?: {
    location?: {
      coordinates: [number, number];
      name: string;
    };
    imageUrl?: string;
  };
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: number;
}

export interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  lastSeen: number;
  isOnline: boolean;
  location?: {
    coordinates: [number, number];
    name: string;
  };
}

interface ChatStore {
  // State
  messages: Map<string, ChatMessage[]>; // roomId -> messages
  rooms: Map<string, ChatRoom>; // roomId -> room
  onlineUsers: Map<string, OnlineUser>; // userId -> user
  currentUserId: string | null;
  currentUserName: string | null;
  activeRoomId: string | null;
  isTyping: Map<string, string[]>; // roomId -> typing user ids
  
  // Chat management
  initializeChat: (userId: string, userName: string) => void;
  sendMessage: (roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => void;
  receiveMessage: (message: ChatMessage) => void;
  markMessagesAsRead: (roomId: string) => void;
  
  // Room management
  createOrGetRoom: (recipientId: string, recipientName: string) => string;
  setActiveRoom: (roomId: string | null) => void;
  getRoomMessages: (roomId: string) => ChatMessage[];
  
  // Typing indicators
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  setUserTyping: (roomId: string, userId: string, isTyping: boolean) => void;
  
  // Online users
  updateOnlineUsers: (users: OnlineUser[]) => void;
  updateUserLocation: (userId: string, location: { coordinates: [number, number]; name: string }) => void;
  
  // Utilities
  getUnreadCount: () => number;
  searchMessages: (query: string) => ChatMessage[];
}

const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: new Map(),
  rooms: new Map(),
  onlineUsers: new Map(),
  currentUserId: null,
  currentUserName: null,
  activeRoomId: null,
  isTyping: new Map(),

  initializeChat: (userId: string, userName: string) => {
    const socketStore = useSocketStore.getState();
    
    set({ 
      currentUserId: userId, 
      currentUserName: userName 
    });

    // Subscribe to chat events
    socketStore.subscribe('message-received', (message: ChatMessage) => {
      get().receiveMessage(message);
    });

    socketStore.subscribe('user-typing', ({ roomId, userId, isTyping }: { roomId: string; userId: string; isTyping: boolean }) => {
      get().setUserTyping(roomId, userId, isTyping);
    });

    socketStore.subscribe('online-users-update', (users: OnlineUser[]) => {
      get().updateOnlineUsers(users);
    });

    socketStore.subscribe('message-status-update', ({ messageId, status }: { messageId: string; status: 'delivered' | 'read' }) => {
      const { messages } = get();
      const newMessages = new Map(messages);
      
      for (const [roomId, roomMessages] of newMessages) {
        const messageIndex = roomMessages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          const updatedMessages = [...roomMessages];
          updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], status };
          newMessages.set(roomId, updatedMessages);
          break;
        }
      }
      
      set({ messages: newMessages });
    });

    // Join user to chat system
    socketStore.emit('join-chat', { userId, userName });
    console.log('💬 Chat system initialized for user:', userName);
  },

  sendMessage: (roomId: string, messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => {
    const { messages, currentUserId } = get();
    const socketStore = useSocketStore.getState();
    
    const message: ChatMessage = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'sent'
    };

    // Add to local messages
    const roomMessages = messages.get(roomId) || [];
    const newMessages = new Map(messages);
    newMessages.set(roomId, [...roomMessages, message]);
    set({ messages: newMessages });

    // Send via socket
    socketStore.emit('send-message', { roomId, message });
  },

  receiveMessage: (message: ChatMessage) => {
    const { messages, rooms, activeRoomId } = get();
    const roomId = get().createOrGetRoom(message.senderId, message.senderName);
    
    // Add message to room
    const roomMessages = messages.get(roomId) || [];
    const newMessages = new Map(messages);
    newMessages.set(roomId, [...roomMessages, message]);

    // Update room info
    const newRooms = new Map(rooms);
    const room = newRooms.get(roomId);
    if (room) {
      room.lastMessage = message;
      room.unreadCount = activeRoomId === roomId ? 0 : room.unreadCount + 1;
      newRooms.set(roomId, room);
    }

    set({ messages: newMessages, rooms: newRooms });

    // Auto-mark as read if room is active
    if (activeRoomId === roomId) {
      get().markMessagesAsRead(roomId);
    }
  },

  markMessagesAsRead: (roomId: string) => {
    const { rooms, currentUserId } = get();
    const socketStore = useSocketStore.getState();
    
    const newRooms = new Map(rooms);
    const room = newRooms.get(roomId);
    if (room) {
      room.unreadCount = 0;
      newRooms.set(roomId, room);
      set({ rooms: newRooms });
    }

    // Notify server
    socketStore.emit('mark-messages-read', { roomId, userId: currentUserId });
  },

  createOrGetRoom: (recipientId: string, recipientName: string) => {
    const { rooms, currentUserId, currentUserName } = get();
    
    // Generate consistent room ID
    const participants = [currentUserId!, recipientId].sort();
    const roomId = `room_${participants.join('_')}`;
    
    if (!rooms.has(roomId)) {
      const newRoom: ChatRoom = {
        id: roomId,
        participants: participants,
        participantNames: currentUserId! < recipientId 
          ? [currentUserName!, recipientName]
          : [recipientName, currentUserName!],
        unreadCount: 0,
        isActive: true,
        createdAt: Date.now()
      };
      
      const newRooms = new Map(rooms);
      newRooms.set(roomId, newRoom);
      set({ rooms: newRooms });
    }
    
    return roomId;
  },

  setActiveRoom: (roomId: string | null) => {
    const { activeRoomId } = get();
    
    if (activeRoomId !== roomId) {
      set({ activeRoomId: roomId });
      
      if (roomId) {
        get().markMessagesAsRead(roomId);
      }
    }
  },

  getRoomMessages: (roomId: string) => {
    return get().messages.get(roomId) || [];
  },

  startTyping: (roomId: string) => {
    const { currentUserId } = get();
    const socketStore = useSocketStore.getState();
    
    socketStore.emit('typing-start', { roomId, userId: currentUserId });
  },

  stopTyping: (roomId: string) => {
    const { currentUserId } = get();
    const socketStore = useSocketStore.getState();
    
    socketStore.emit('typing-stop', { roomId, userId: currentUserId });
  },

  setUserTyping: (roomId: string, userId: string, isTyping: boolean) => {
    const { isTyping: currentTyping, currentUserId } = get();
    
    if (userId === currentUserId) return; // Don't show own typing
    
    const newTyping = new Map(currentTyping);
    const roomTyping = newTyping.get(roomId) || [];
    
    if (isTyping) {
      if (!roomTyping.includes(userId)) {
        newTyping.set(roomId, [...roomTyping, userId]);
      }
    } else {
      newTyping.set(roomId, roomTyping.filter(id => id !== userId));
    }
    
    set({ isTyping: newTyping });
  },

  updateOnlineUsers: (users: OnlineUser[]) => {
    const newOnlineUsers = new Map();
    users.forEach(user => {
      newOnlineUsers.set(user.id, user);
    });
    set({ onlineUsers: newOnlineUsers });
  },

  updateUserLocation: (userId: string, location: { coordinates: [number, number]; name: string }) => {
    const { onlineUsers } = get();
    const user = onlineUsers.get(userId);
    if (user) {
      const newOnlineUsers = new Map(onlineUsers);
      newOnlineUsers.set(userId, { ...user, location });
      set({ onlineUsers: newOnlineUsers });
    }
  },

  getUnreadCount: () => {
    const { rooms } = get();
    return Array.from(rooms.values()).reduce((total, room) => total + room.unreadCount, 0);
  },

  searchMessages: (query: string) => {
    const { messages } = get();
    const allMessages: ChatMessage[] = [];
    
    for (const roomMessages of messages.values()) {
      allMessages.push(...roomMessages);
    }
    
    return allMessages.filter(message => 
      message.message.toLowerCase().includes(query.toLowerCase()) ||
      message.senderName.toLowerCase().includes(query.toLowerCase())
    );
  },
}));

export default useChatStore;