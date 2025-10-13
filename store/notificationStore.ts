'use client';

import { create } from 'zustand';
import useSocketStore from './socketStore';

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'crowd' | 'message' | 'location' | 'event' | 'business_campaign' | 'business_offer';
  timestamp: number;
  isRead: boolean;
  action?: {
    label: string;
    url?: string;
    callback?: () => void;
  };
  metadata?: {
    locationId?: string;
    userId?: string;
    eventId?: string;
    businessId?: string;
    campaignId?: string;
    coordinates?: [number, number];
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: number;
}

export interface BusinessNotification {
  id: string;
  businessId: string;
  businessName: string;
  businessCategory: string;
  title: string;
  message: string;
  type: 'campaign' | 'offer' | 'event' | 'announcement';
  image?: string;
  validUntil?: number;
  isActive: boolean;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
  targetAudience?: string[];
  location?: {
    lat: number;
    lng: number;
    radius?: number; // km cinsinden
  };
  discountCode?: string;
  discountValue?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  webPushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  types: {
    crowdUpdates: boolean;
    messages: boolean;
    locationShares: boolean;
    events: boolean;
    emergencies: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  locationBased: {
    nearbyEvents: boolean;
    crowdAlerts: boolean;
    radius: number; // km
  };
}

interface NotificationStore {
  // State
  notifications: PushNotification[];
  businessNotifications: BusinessNotification[];
  settings: NotificationSettings;
  permission: NotificationPermission;
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  registerServiceWorker: () => Promise<void>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  
  // Notification management
  addNotification: (notification: Omit<PushNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearExpiredNotifications: () => void;
  
  // Business Notifications
  addBusinessNotification: (notification: Omit<BusinessNotification, 'id' | 'createdAt'>) => void;
  removeBusinessNotification: (id: string) => void;
  getActiveBusinessNotifications: () => BusinessNotification[];
  getNearbyBusinessNotifications: (userLat: number, userLng: number, radius?: number) => BusinessNotification[];
  getBusinessNotificationsByCategory: (category: string) => BusinessNotification[];
  
  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  toggleNotificationType: (type: keyof NotificationSettings['types']) => void;
  
  // Utilities
  getUnreadCount: () => number;
  getNotificationsByType: (type: PushNotification['type']) => PushNotification[];
  isQuietTime: () => boolean;
  shouldShowNotification: (notification: PushNotification) => boolean;
  showBrowserNotification: (notification: PushNotification) => void;
  playNotificationSound: (type: PushNotification['type']) => void;
  getNotificationIcon: (type: PushNotification['type']) => string;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  webPushEnabled: false,
  soundEnabled: true,
  vibrationEnabled: true,
  types: {
    crowdUpdates: true,
    messages: true,
    locationShares: true,
    events: true,
    emergencies: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  locationBased: {
    nearbyEvents: true,
    crowdAlerts: true,
    radius: 5,
  },
};

const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial state
  notifications: [],
  businessNotifications: [],
  settings: defaultSettings,
  permission: typeof window !== 'undefined' ? Notification.permission : 'default',
  registration: null,
  isSupported: typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator,

  requestPermission: async () => {
    if (!get().isSupported) return false;
    
    try {
      const permission = await Notification.requestPermission();
      set({ permission });
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  },

  registerServiceWorker: async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      set({ registration });
      console.log('🔔 Service worker registered for notifications');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  },

  subscribe: async () => {
    const { registration, permission } = get();
    
    if (!registration || permission !== 'granted') {
      throw new Error('Notifications not available');
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      const socketStore = useSocketStore.getState();
      socketStore.emit('push-subscription', {
        subscription: subscription.toJSON(),
        settings: get().settings
      });

      set((state) => ({ 
        settings: { ...state.settings, webPushEnabled: true }
      }));

      console.log('🔔 Push notifications subscribed');
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  },

  unsubscribe: async () => {
    const { registration } = get();
    
    if (!registration) return;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server
        const socketStore = useSocketStore.getState();
        socketStore.emit('push-unsubscribe');
      }

      set((state) => ({ 
        settings: { ...state.settings, webPushEnabled: false }
      }));

      console.log('🔔 Push notifications unsubscribed');
    } catch (error) {
      console.error('Push unsubscription failed:', error);
    }
  },

  addNotification: (notificationData) => {
    const notification: PushNotification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      isRead: false,
    };

    const { shouldShowNotification } = get();
    
    if (!shouldShowNotification(notification)) {
      return;
    }

    set((state) => ({
      notifications: [notification, ...state.notifications]
    }));

    // Show browser notification if permission granted
    if (get().permission === 'granted' && get().settings.enabled) {
      get().showBrowserNotification(notification);
    }

    // Play sound
    if (get().settings.soundEnabled && !get().isQuietTime()) {
      get().playNotificationSound(notification.type);
    }

    // Vibrate
    if (get().settings.vibrationEnabled && 'vibrate' in navigator) {
      const pattern = notification.priority === 'urgent' ? [200, 100, 200] : [100];
      navigator.vibrate(pattern);
    }
  },

  showBrowserNotification: (notification: PushNotification) => {
    const icon = get().getNotificationIcon(notification.type);
    
    new Notification(notification.title, {
      body: notification.message,
      icon,
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: get().isQuietTime(),
    });
  },

  playNotificationSound: (type: PushNotification['type']) => {
    try {
      const audio = new Audio('/sounds/notification.mp3'); // You'll need to add this file
      audio.volume = type === 'error' || type === 'warning' ? 0.8 : 0.5;
      audio.play().catch(() => {}); // Ignore autoplay restrictions
    } catch (error) {
      // Ignore sound errors
    }
  },

  getNotificationIcon: (type: PushNotification['type']) => {
    const icons = {
      info: '/icons/info.png',
      success: '/icons/success.png',
      warning: '/icons/warning.png',
      error: '/icons/error.png',
      crowd: '/icons/crowd.png',
      message: '/icons/message.png',
      location: '/icons/location.png',
      event: '/icons/event.png',
    };
    return icons[type] || '/icons/default.png';
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      )
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true }))
    }));
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearExpiredNotifications: () => {
    const now = Date.now();
    set((state) => ({
      notifications: state.notifications.filter(n => 
        !n.expiresAt || n.expiresAt > now
      )
    }));
  },

  // Business Notifications
  addBusinessNotification: (notification) => {
    const newNotification: BusinessNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    
    set((state) => ({
      businessNotifications: [newNotification, ...state.businessNotifications],
    }));

    // Ana sayfada da göster
    get().addNotification({
      title: `${notification.businessName} - ${notification.title}`,
      message: notification.message,
      type: notification.type === 'campaign' ? 'business_campaign' : 'business_offer',
      priority: notification.priority === 'high' ? 'high' : 'normal',
      metadata: {
        businessId: notification.businessId,
        coordinates: notification.location ? [notification.location.lat, notification.location.lng] : undefined,
      },
      expiresAt: notification.validUntil,
    });
  },

  removeBusinessNotification: (id) => {
    set((state) => ({
      businessNotifications: state.businessNotifications.filter(n => n.id !== id),
    }));
  },

  getActiveBusinessNotifications: () => {
    const now = Date.now();
    return get().businessNotifications.filter(
      n => n.isActive && (!n.validUntil || n.validUntil > now)
    );
  },

  getNearbyBusinessNotifications: (userLat, userLng, radius = 10) => {
    return get().getActiveBusinessNotifications().filter(notification => {
      if (!notification.location) return true;
      
      const distance = calculateDistance(
        userLat, 
        userLng, 
        notification.location.lat, 
        notification.location.lng
      );
      
      const notificationRadius = notification.location.radius || 10;
      return distance <= Math.min(radius, notificationRadius);
    });
  },

  getBusinessNotificationsByCategory: (category) => {
    return get().getActiveBusinessNotifications().filter(
      n => n.businessCategory.toLowerCase() === category.toLowerCase()
    );
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));

    // Update server settings
    const socketStore = useSocketStore.getState();
    socketStore.emit('notification-settings-update', get().settings);
  },

  toggleNotificationType: (type) => {
    set((state) => ({
      settings: {
        ...state.settings,
        types: {
          ...state.settings.types,
          [type]: !state.settings.types[type]
        }
      }
    }));
  },

  getUnreadCount: () => {
    return get().notifications.filter(n => !n.isRead).length;
  },

  getNotificationsByType: (type) => {
    return get().notifications.filter(n => n.type === type);
  },

  isQuietTime: () => {
    const { quietHours } = get().settings;
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(quietHours.start.replace(':', ''));
    const endTime = parseInt(quietHours.end.replace(':', ''));

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  },

  shouldShowNotification: (notification) => {
    const { settings } = get();
    
    if (!settings.enabled) return false;
    
    // Check notification type settings
    const typeEnabled = (() => {
      switch (notification.type) {
        case 'crowd': return settings.types.crowdUpdates;
        case 'message': return settings.types.messages;
        case 'location': return settings.types.locationShares;
        case 'event': return settings.types.events;
        case 'error': case 'warning': return settings.types.emergencies;
        case 'info': case 'success': return settings.types.system;
        default: return true;
      }
    })();

    if (!typeEnabled) return false;

    // Always show urgent notifications
    if (notification.priority === 'urgent') return true;

    // Check quiet hours for non-urgent notifications
    if (get().isQuietTime() && notification.priority !== 'high') return false;

    return true;
  },
}));

// Initialize notifications system
if (typeof window !== 'undefined') {
  const store = useNotificationStore.getState();
  
  // Register service worker
  store.registerServiceWorker();
  
  // Setup socket listeners
  const socketStore = useSocketStore.getState();
  
  socketStore.subscribe('notification', (notification: Omit<PushNotification, 'id' | 'timestamp' | 'isRead'>) => {
    store.addNotification(notification);
  });

  socketStore.subscribe('notification-batch', (notifications: Omit<PushNotification, 'id' | 'timestamp' | 'isRead'>[]) => {
    notifications.forEach(notification => {
      store.addNotification(notification);
    });
  });

  // Cleanup expired notifications every 5 minutes
  setInterval(() => {
    store.clearExpiredNotifications();
  }, 5 * 60 * 1000);

  // Auto-generate demo notifications when socket connects
  let notificationInterval: NodeJS.Timeout;
  
  const startNotifications = () => {
    const socketStore = useSocketStore.getState();
    
    if (socketStore.isConnected && !notificationInterval) {
      console.log('🔔 Starting notification system...');
      
      const generateNotifications = () => {
        const notificationTypes = ['info', 'crowd', 'success', 'warning'];
        const messages = [
          'Starbucks Kızılay\'da kalabalık artıyor',
          'Migros Kızılay\'da kasa bekletisi 5dk', 
          'ANKAmall\'da özel indirim kampanyası',
          'Armada AVM\'de yoğunluk normal seviyede',
          'Kızılay Metro\'da gecikme yok',
          'CarrefourSA Bilkent\'te hızlı alışveriş imkanı'
        ];

        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        store.addNotification({
          title: 'CityView Güncellemesi',
          message: randomMessage,
          type: randomType as any,
          priority: 'normal'
        });
      };

      // Generate notification every 15 seconds
      notificationInterval = setInterval(generateNotifications, 15000);
      
      // Initial notification
      setTimeout(() => {
        store.addNotification({
          title: 'CityView Canlı Sistem',
          message: 'Gerçek zamanlı kalabalık takibi aktif',
          type: 'success',
          priority: 'normal'
        });
      }, 2000);
    }
  };

  // Check for socket connection every 2 seconds
  const checkInterval = setInterval(() => {
    startNotifications();
    const socketStore = useSocketStore.getState();
    if (socketStore.isConnected && notificationInterval) {
      clearInterval(checkInterval);
    }
  }, 2000);
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default useNotificationStore;