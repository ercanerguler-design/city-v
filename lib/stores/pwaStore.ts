import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

// PWA Install Prompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Notification Permission
export type NotificationPermission = 'default' | 'granted' | 'denied';

// PWA State
interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  notificationPermission: NotificationPermission;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  
  // Actions
  setIsInstalled: (installed: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setCanInstall: (canInstall: boolean) => void;
  setInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  setNotificationPermission: (permission: NotificationPermission) => void;
  setServiceWorkerRegistration: (registration: ServiceWorkerRegistration | null) => void;
  setUpdateAvailable: (available: boolean) => void;
  
  // Install PWA
  installPWA: () => Promise<boolean>;
  
  // Request notification permission
  requestNotificationPermission: () => Promise<NotificationPermission>;
  
  // Send notification
  sendNotification: (title: string, options?: NotificationOptions) => void;
  
  // Update service worker
  updateServiceWorker: () => void;
  
  // Check online status
  checkOnlineStatus: () => boolean;
  
  // Cache management
  clearCache: () => Promise<void>;
}

export const usePWAStore = create<PWAState>((set, get) => ({
  isInstalled: false,
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  canInstall: false,
  installPrompt: null,
  notificationPermission: 'default',
  serviceWorkerRegistration: null,
  updateAvailable: false,

  setIsInstalled: (installed: boolean) => {
    set({ isInstalled: installed });
  },

  setIsOnline: (online: boolean) => {
    const wasOffline = !get().isOnline;
    set({ isOnline: online });
    
    if (online && wasOffline) {
      toast.success('🌐 İnternet bağlantısı geri geldi!', {
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
    } else if (!online) {
      toast.error('📡 İnternet bağlantısı kesildi. Çevrimdışı mod aktif.', {
        duration: 5000,
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  },

  setCanInstall: (canInstall: boolean) => {
    set({ canInstall });
  },

  setInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => {
    set({ installPrompt: prompt, canInstall: prompt !== null });
  },

  setNotificationPermission: (permission: NotificationPermission) => {
    set({ notificationPermission: permission });
  },

  setServiceWorkerRegistration: (registration: ServiceWorkerRegistration | null) => {
    set({ serviceWorkerRegistration: registration });
  },

  setUpdateAvailable: (available: boolean) => {
    set({ updateAvailable: available });
    
    if (available) {
      toast.success(
        '🎉 Yeni güncelleme mevcut! Yenilemek ister misiniz?',
        {
          duration: 10000,
          style: {
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
          },
        }
      );
    }
  },

  installPWA: async () => {
    const { installPrompt } = get();
    
    if (!installPrompt) {
      toast.error('Uygulama zaten yüklü veya yükleme mevcut değil.', {
        duration: 3000,
      });
      return false;
    }

    try {
      // Show install prompt
      await installPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        set({ isInstalled: true, canInstall: false, installPrompt: null });
        
        toast.success('🎉 Uygulama başarıyla yüklendi!', {
          duration: 5000,
          style: {
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
          },
        });
        
        return true;
      } else {
        toast('Yükleme iptal edildi.', {
          duration: 3000,
          icon: 'ℹ️',
        });
        
        return false;
      }
    } catch (error) {
      console.error('PWA install error:', error);
      toast.error('Yükleme sırasında bir hata oluştu.', {
        duration: 3000,
      });
      return false;
    }
  },

  requestNotificationPermission: async () => {
    if (!('Notification' in window)) {
      toast.error('Tarayıcınız bildirimleri desteklemiyor.', {
        duration: 3000,
      });
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      set({ notificationPermission: permission });
      
      if (permission === 'granted') {
        toast.success('✅ Bildirim izni verildi!', {
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
          },
        });
      } else if (permission === 'denied') {
        toast.error('❌ Bildirim izni reddedildi.', {
          duration: 3000,
        });
      }
      
      return permission;
    } catch (error) {
      console.error('Notification permission error:', error);
      return 'denied';
    }
  },

  sendNotification: (title: string, options?: NotificationOptions) => {
    const { notificationPermission, serviceWorkerRegistration } = get();
    
    if (notificationPermission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'cityview-notification',
      ...options,
    };

    if (serviceWorkerRegistration) {
      // Use service worker to show notification
      serviceWorkerRegistration.showNotification(title, defaultOptions);
    } else if ('Notification' in window) {
      // Fallback to regular notification
      new Notification(title, defaultOptions);
    }
  },

  updateServiceWorker: () => {
    const { serviceWorkerRegistration } = get();
    
    if (serviceWorkerRegistration && serviceWorkerRegistration.waiting) {
      // Send message to service worker to skip waiting
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      toast.success('Uygulama güncelleniyor...', {
        duration: 2000,
        style: {
          borderRadius: '12px',
          background: '#667eea',
          color: '#fff',
        },
      });

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  },

  checkOnlineStatus: () => {
    return get().isOnline;
  },

  clearCache: async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      
      toast.success('✅ Önbellek temizlendi!', {
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Cache clear error:', error);
      toast.error('Önbellek temizlenirken hata oluştu.', {
        duration: 3000,
      });
    }
  },
}));

// Initialize PWA listeners (call this in _app.tsx or layout.tsx)
export const initializePWA = () => {
  if (typeof window === 'undefined') return;

  const store = usePWAStore.getState();

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    store.setIsInstalled(true);
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    store.setInstallPrompt(e as BeforeInstallPromptEvent);
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    store.setIsInstalled(true);
    store.setInstallPrompt(null);
    console.log('PWA installed successfully');
  });

  // Listen for online/offline events
  window.addEventListener('online', () => {
    store.setIsOnline(true);
  });

  window.addEventListener('offline', () => {
    store.setIsOnline(false);
  });

  // Register service worker (only in production)
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
        store.setServiceWorkerRegistration(registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                store.setUpdateAvailable(true);
              }
            });
          }
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  } else if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
    // Unregister any existing service workers in development
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
        console.log('Service Worker unregistered in development');
      });
    });
  }

  // Check notification permission
  if ('Notification' in window) {
    store.setNotificationPermission(Notification.permission);
  }
};
