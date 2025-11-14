'use client';

import { create } from 'zustand';
import useSocketStore from './socketStore';

export interface SharedLocation {
  userId: string;
  userName: string;
  coordinates: [number, number];
  timestamp: number;
  isActive: boolean;
  accuracy?: number;
  heading?: number;
  speed?: number;
  locationName?: string;
}

export interface LocationShareRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  timestamp: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface LocationPrivacySettings {
  shareWithAll: boolean;
  shareWithFriends: boolean;
  shareWithNone: boolean;
  allowedUsers: string[];
  blockedUsers: string[];
  shareAccuracy: boolean;
  shareHeading: boolean;
  shareSpeed: boolean;
  autoExpireAfter: number; // minutes
}

interface LocationShareStore {
  // State
  sharedLocations: Map<string, SharedLocation>; // userId -> location
  locationRequests: Map<string, LocationShareRequest>; // requestId -> request
  mySharedLocation: SharedLocation | null;
  isLocationSharing: boolean;
  privacySettings: LocationPrivacySettings;
  watchId: number | null;
  
  // Actions
  startLocationSharing: () => Promise<void>;
  stopLocationSharing: () => void;
  updateMyLocation: (position: GeolocationPosition) => void;
  
  // Location sharing requests
  sendLocationRequest: (toUserId: string, toUserName: string, message?: string) => void;
  acceptLocationRequest: (requestId: string) => void;
  declineLocationRequest: (requestId: string) => void;
  
  // Privacy settings
  updatePrivacySettings: (settings: Partial<LocationPrivacySettings>) => void;
  allowUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  
  // Data management
  updateSharedLocation: (location: SharedLocation) => void;
  removeSharedLocation: (userId: string) => void;
  cleanupExpiredRequests: () => void;
  
  // Utilities
  isUserAllowed: (userId: string) => boolean;
  getDistanceToUser: (userId: string, myLocation: [number, number]) => number | null;
  getNearbyUsers: (myLocation: [number, number], radiusKm: number) => SharedLocation[];
}

const defaultPrivacySettings: LocationPrivacySettings = {
  shareWithAll: false,
  shareWithFriends: true,
  shareWithNone: false,
  allowedUsers: [],
  blockedUsers: [],
  shareAccuracy: false,
  shareHeading: false,
  shareSpeed: false,
  autoExpireAfter: 60, // 1 hour
};

const useLocationShareStore = create<LocationShareStore>((set, get) => ({
  // Initial state
  sharedLocations: new Map(),
  locationRequests: new Map(),
  mySharedLocation: null,
  isLocationSharing: false,
  privacySettings: defaultPrivacySettings,
  watchId: null,

  startLocationSharing: async () => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation desteklenmiyor');
    }

    return new Promise((resolve, reject) => {
      const success = (position: GeolocationPosition) => {
        const socketStore = useSocketStore.getState();
        
        // Subscribe to location events
        socketStore.subscribe('location-shared', (location: SharedLocation) => {
          get().updateSharedLocation(location);
        });

        socketStore.subscribe('location-request-received', (request: LocationShareRequest) => {
          const { locationRequests } = get();
          const newRequests = new Map(locationRequests);
          newRequests.set(request.id, request);
          set({ locationRequests: newRequests });
        });

        socketStore.subscribe('location-request-response', ({ requestId, status }: { requestId: string; status: 'accepted' | 'declined' }) => {
          const { locationRequests } = get();
          const request = locationRequests.get(requestId);
          if (request) {
            const newRequests = new Map(locationRequests);
            newRequests.set(requestId, { ...request, status });
            set({ locationRequests: newRequests });
          }
        });

        socketStore.subscribe('location-sharing-stopped', ({ userId }: { userId: string }) => {
          get().removeSharedLocation(userId);
        });

        // Start watching position
        const watchId = navigator.geolocation.watchPosition(
          (position) => get().updateMyLocation(position),
          (error) => console.error('Location error:', error),
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000
          }
        );

        set({ 
          isLocationSharing: true, 
          watchId,
        });

        // Initial location update
        get().updateMyLocation(position);
        
        resolve();
      };

      const error = (err: GeolocationPositionError) => {
        reject(new Error(`Konum alınamadı: ${err.message}`));
      };

      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  },

  stopLocationSharing: () => {
    const { watchId } = get();
    const socketStore = useSocketStore.getState();

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    // Notify server
    socketStore.emit('stop-location-sharing');

    set({
      isLocationSharing: false,
      watchId: null,
      mySharedLocation: null
    });

    console.log('📍 Location sharing stopped');
  },

  updateMyLocation: (position: GeolocationPosition) => {
    const { privacySettings } = get();
    const socketStore = useSocketStore.getState();

    const location: SharedLocation = {
      userId: 'current-user', // Will be replaced with actual user ID
      userName: 'Me', // Will be replaced with actual user name
      coordinates: [position.coords.latitude, position.coords.longitude],
      timestamp: Date.now(),
      isActive: true,
      accuracy: privacySettings.shareAccuracy ? position.coords.accuracy : undefined,
      heading: privacySettings.shareHeading ? position.coords.heading || undefined : undefined,
      speed: privacySettings.shareSpeed ? position.coords.speed || undefined : undefined,
    };

    set({ mySharedLocation: location });

    // Send to server
    socketStore.emit('share-location', location);
  },

  sendLocationRequest: (toUserId: string, toUserName: string, message = '') => {
    const socketStore = useSocketStore.getState();
    
    const request: LocationShareRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: 'current-user', // Will be replaced
      fromUserName: 'Me', // Will be replaced
      toUserId,
      toUserName,
      message,
      timestamp: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
      status: 'pending'
    };

    socketStore.emit('send-location-request', request);
    
    // Add to local requests
    const { locationRequests } = get();
    const newRequests = new Map(locationRequests);
    newRequests.set(request.id, request);
    set({ locationRequests: newRequests });
  },

  acceptLocationRequest: (requestId: string) => {
    const { locationRequests } = get();
    const socketStore = useSocketStore.getState();
    
    const request = locationRequests.get(requestId);
    if (request) {
      socketStore.emit('respond-location-request', { 
        requestId, 
        response: 'accepted' 
      });
      
      // Start sharing if not already sharing
      if (!get().isLocationSharing) {
        get().startLocationSharing();
      }
    }
  },

  declineLocationRequest: (requestId: string) => {
    const socketStore = useSocketStore.getState();
    
    socketStore.emit('respond-location-request', { 
      requestId, 
      response: 'declined' 
    });
  },

  updatePrivacySettings: (settings: Partial<LocationPrivacySettings>) => {
    const { privacySettings } = get();
    set({ 
      privacySettings: { ...privacySettings, ...settings }
    });
  },

  allowUser: (userId: string) => {
    const { privacySettings } = get();
    const newSettings = {
      ...privacySettings,
      allowedUsers: [...privacySettings.allowedUsers.filter(id => id !== userId), userId],
      blockedUsers: privacySettings.blockedUsers.filter(id => id !== userId)
    };
    set({ privacySettings: newSettings });
  },

  blockUser: (userId: string) => {
    const { privacySettings } = get();
    const newSettings = {
      ...privacySettings,
      blockedUsers: [...privacySettings.blockedUsers.filter(id => id !== userId), userId],
      allowedUsers: privacySettings.allowedUsers.filter(id => id !== userId)
    };
    set({ privacySettings: newSettings });
  },

  updateSharedLocation: (location: SharedLocation) => {
    const { sharedLocations } = get();
    const newLocations = new Map(sharedLocations);
    newLocations.set(location.userId, location);
    set({ sharedLocations: newLocations });
  },

  removeSharedLocation: (userId: string) => {
    const { sharedLocations } = get();
    const newLocations = new Map(sharedLocations);
    newLocations.delete(userId);
    set({ sharedLocations: newLocations });
  },

  cleanupExpiredRequests: () => {
    const { locationRequests } = get();
    const now = Date.now();
    const newRequests = new Map();
    
    for (const [id, request] of locationRequests) {
      if (request.expiresAt > now && request.status === 'pending') {
        newRequests.set(id, request);
      }
    }
    
    set({ locationRequests: newRequests });
  },

  isUserAllowed: (userId: string) => {
    const { privacySettings } = get();
    
    if (privacySettings.shareWithNone) return false;
    if (privacySettings.blockedUsers.includes(userId)) return false;
    if (privacySettings.shareWithAll) return true;
    if (privacySettings.allowedUsers.includes(userId)) return true;
    if (privacySettings.shareWithFriends) {
      // TODO: Check if user is in friends list
      return true; // For now, assume all users are friends
    }
    
    return false;
  },

  getDistanceToUser: (userId: string, myLocation: [number, number]) => {
    const { sharedLocations } = get();
    const userLocation = sharedLocations.get(userId);
    
    if (!userLocation) return null;
    
    return calculateDistance(
      myLocation[0], 
      myLocation[1], 
      userLocation.coordinates[0], 
      userLocation.coordinates[1]
    );
  },

  getNearbyUsers: (myLocation: [number, number], radiusKm: number) => {
    const { sharedLocations } = get();
    const nearbyUsers: SharedLocation[] = [];
    
    for (const location of sharedLocations.values()) {
      const distance = calculateDistance(
        myLocation[0], 
        myLocation[1], 
        location.coordinates[0], 
        location.coordinates[1]
      );
      
      if (distance <= radiusKm) {
        nearbyUsers.push(location);
      }
    }
    
    return nearbyUsers.sort((a, b) => {
      const distA = calculateDistance(myLocation[0], myLocation[1], a.coordinates[0], a.coordinates[1]);
      const distB = calculateDistance(myLocation[0], myLocation[1], b.coordinates[0], b.coordinates[1]);
      return distA - distB;
    });
  },
}));

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default useLocationShareStore;