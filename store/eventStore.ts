'use client';

import { create } from 'zustand';
import useSocketStore from './socketStore';

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  category: 'concert' | 'festival' | 'sports' | 'theater' | 'exhibition' | 'conference' | 'workshop' | 'other';
  coordinates: [number, number];
  venue: string;
  address: string;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled' | 'postponed';
  
  // Real-time data
  currentAttendees: number;
  maxCapacity: number;
  ticketsAvailable: number;
  averageRating: number;
  weatherCondition?: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
  crowdLevel: 'low' | 'medium' | 'high' | 'full';
  
  // Social data
  checkins: number;
  shares: number;
  comments: EventComment[];
  
  // Media
  imageUrl?: string;
  streamUrl?: string;
  
  // Pricing
  ticketPrices?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Updates
  lastUpdate: number;
  organizer: string;
  tags: string[];
}

export interface EventComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
  rating?: number;
  isVerified: boolean;
}

export interface EventUpdate {
  id: string;
  eventId: string;
  type: 'status_change' | 'capacity_update' | 'time_change' | 'weather_alert' | 'announcement';
  title: string;
  message: string;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: {
    oldValue?: any;
    newValue?: any;
  };
}

export interface EventFilters {
  categories: string[];
  status: string[];
  dateRange: {
    start: number | null;
    end: number | null;
  };
  location: {
    coordinates: [number, number] | null;
    radius: number; // km
  };
  priceRange: {
    min: number;
    max: number;
  };
  crowdLevel: string[];
}

interface EventStore {
  // State
  events: Map<string, LiveEvent>;
  trackedEvents: Set<string>;
  eventUpdates: Map<string, EventUpdate[]>; // eventId -> updates
  filters: EventFilters;
  isSubscribed: boolean;
  lastSyncTime: number;
  
  // Actions
  subscribeToEvents: () => void;
  unsubscribeFromEvents: () => void;
  trackEvent: (eventId: string) => void;
  untrackEvent: (eventId: string) => void;
  
  // Event management
  updateEvent: (event: LiveEvent) => void;
  addEventUpdate: (update: EventUpdate) => void;
  getEvent: (eventId: string) => LiveEvent | null;
  getEventsByCategory: (category: LiveEvent['category']) => LiveEvent[];
  getEventsByStatus: (status: LiveEvent['status']) => LiveEvent[];
  getNearbyEvents: (coordinates: [number, number], radiusKm: number) => LiveEvent[];
  
  // Comments and interaction
  addComment: (eventId: string, comment: Omit<EventComment, 'id' | 'timestamp'>) => void;
  checkinToEvent: (eventId: string) => void;
  shareEvent: (eventId: string) => void;
  rateEvent: (eventId: string, rating: number) => void;
  
  // Filtering and searching
  updateFilters: (filters: Partial<EventFilters>) => void;
  getFilteredEvents: () => LiveEvent[];
  searchEvents: (query: string) => LiveEvent[];
  
  // Utilities
  getUpcomingEvents: (limit?: number) => LiveEvent[];
  getLiveEvents: () => LiveEvent[];
  getPopularEvents: (limit?: number) => LiveEvent[];
  getTrackedEventUpdates: () => EventUpdate[];
}

const defaultFilters: EventFilters = {
  categories: [],
  status: ['upcoming', 'live'],
  dateRange: {
    start: null,
    end: null,
  },
  location: {
    coordinates: null,
    radius: 50,
  },
  priceRange: {
    min: 0,
    max: 1000,
  },
  crowdLevel: [],
};

const useEventStore = create<EventStore>((set, get) => ({
  // Initial state
  events: new Map(),
  trackedEvents: new Set(),
  eventUpdates: new Map(),
  filters: defaultFilters,
  isSubscribed: false,
  lastSyncTime: 0,

  subscribeToEvents: () => {
    const { isSubscribed } = get();
    if (isSubscribed) return;

    const socketStore = useSocketStore.getState();
    
    // Subscribe to event updates
    socketStore.subscribe('event-update', (event: LiveEvent) => {
      get().updateEvent(event);
    });

    socketStore.subscribe('event-announcement', (update: EventUpdate) => {
      get().addEventUpdate(update);
    });

    socketStore.subscribe('event-checkin', ({ eventId, count }: { eventId: string; count: number }) => {
      const { events } = get();
      const event = events.get(eventId);
      if (event) {
        const updatedEvent = { ...event, checkins: count };
        get().updateEvent(updatedEvent);
      }
    });

    socketStore.subscribe('event-capacity-update', ({ eventId, currentAttendees, ticketsAvailable }: { 
      eventId: string; 
      currentAttendees: number; 
      ticketsAvailable: number; 
    }) => {
      const { events } = get();
      const event = events.get(eventId);
      if (event) {
        const updatedEvent = { 
          ...event, 
          currentAttendees, 
          ticketsAvailable,
          lastUpdate: Date.now()
        };
        get().updateEvent(updatedEvent);
      }
    });

    socketStore.subscribe('event-comment', ({ eventId, comment }: { eventId: string; comment: EventComment }) => {
      const { events } = get();
      const event = events.get(eventId);
      if (event) {
        const updatedEvent = {
          ...event,
          comments: [...event.comments, comment]
        };
        get().updateEvent(updatedEvent);
      }
    });

    // Request initial events data
    socketStore.emit('subscribe-events', { filters: get().filters });

    set({ isSubscribed: true, lastSyncTime: Date.now() });
    console.log('🎉 Subscribed to live events');
  },

  unsubscribeFromEvents: () => {
    const { isSubscribed } = get();
    if (!isSubscribed) return;

    const socketStore = useSocketStore.getState();
    socketStore.unsubscribe('event-update');
    socketStore.unsubscribe('event-announcement');
    socketStore.unsubscribe('event-checkin');
    socketStore.unsubscribe('event-capacity-update');
    socketStore.unsubscribe('event-comment');

    socketStore.emit('unsubscribe-events');

    set({ isSubscribed: false });
    console.log('🎉 Unsubscribed from live events');
  },

  trackEvent: (eventId: string) => {
    const { trackedEvents } = get();
    const newTrackedEvents = new Set(trackedEvents);
    newTrackedEvents.add(eventId);
    set({ trackedEvents: newTrackedEvents });

    const socketStore = useSocketStore.getState();
    socketStore.emit('track-event', { eventId });
  },

  untrackEvent: (eventId: string) => {
    const { trackedEvents } = get();
    const newTrackedEvents = new Set(trackedEvents);
    newTrackedEvents.delete(eventId);
    set({ trackedEvents: newTrackedEvents });

    const socketStore = useSocketStore.getState();
    socketStore.emit('untrack-event', { eventId });
  },

  updateEvent: (event: LiveEvent) => {
    const { events } = get();
    const newEvents = new Map(events);
    newEvents.set(event.id, event);
    set({ events: newEvents });
  },

  addEventUpdate: (update: EventUpdate) => {
    const { eventUpdates } = get();
    const newUpdates = new Map(eventUpdates);
    const eventUpdateList = newUpdates.get(update.eventId) || [];
    newUpdates.set(update.eventId, [update, ...eventUpdateList]);
    set({ eventUpdates: newUpdates });
  },

  getEvent: (eventId: string) => {
    return get().events.get(eventId) || null;
  },

  getEventsByCategory: (category: LiveEvent['category']) => {
    return Array.from(get().events.values()).filter(event => event.category === category);
  },

  getEventsByStatus: (status: LiveEvent['status']) => {
    return Array.from(get().events.values()).filter(event => event.status === status);
  },

  getNearbyEvents: (coordinates: [number, number], radiusKm: number) => {
    const events = Array.from(get().events.values());
    return events.filter(event => {
      const distance = calculateDistance(
        coordinates[0], 
        coordinates[1], 
        event.coordinates[0], 
        event.coordinates[1]
      );
      return distance <= radiusKm;
    });
  },

  addComment: (eventId: string, commentData: Omit<EventComment, 'id' | 'timestamp'>) => {
    const comment: EventComment = {
      ...commentData,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    const socketStore = useSocketStore.getState();
    socketStore.emit('event-comment', { eventId, comment });
  },

  checkinToEvent: (eventId: string) => {
    const socketStore = useSocketStore.getState();
    socketStore.emit('event-checkin', { eventId });
  },

  shareEvent: (eventId: string) => {
    const { events } = get();
    const event = events.get(eventId);
    if (event) {
      const updatedEvent = { ...event, shares: event.shares + 1 };
      get().updateEvent(updatedEvent);
    }

    const socketStore = useSocketStore.getState();
    socketStore.emit('event-share', { eventId });
  },

  rateEvent: (eventId: string, rating: number) => {
    const socketStore = useSocketStore.getState();
    socketStore.emit('event-rate', { eventId, rating });
  },

  updateFilters: (newFilters: Partial<EventFilters>) => {
    const { filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    set({ filters: updatedFilters });

    // Update subscription with new filters
    const socketStore = useSocketStore.getState();
    socketStore.emit('update-event-filters', { filters: updatedFilters });
  },

  getFilteredEvents: () => {
    const { events, filters } = get();
    let filteredEvents = Array.from(events.values());

    // Filter by categories
    if (filters.categories.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filters.categories.includes(event.category)
      );
    }

    // Filter by status
    if (filters.status.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filters.status.includes(event.status)
      );
    }

    // Filter by date range
    if (filters.dateRange.start) {
      filteredEvents = filteredEvents.filter(event => 
        event.startTime >= filters.dateRange.start!
      );
    }
    if (filters.dateRange.end) {
      filteredEvents = filteredEvents.filter(event => 
        event.startTime <= filters.dateRange.end!
      );
    }

    // Filter by location
    if (filters.location.coordinates) {
      filteredEvents = filteredEvents.filter(event => {
        const distance = calculateDistance(
          filters.location.coordinates![0],
          filters.location.coordinates![1],
          event.coordinates[0],
          event.coordinates[1]
        );
        return distance <= filters.location.radius;
      });
    }

    // Filter by price range
    filteredEvents = filteredEvents.filter(event => {
      if (!event.ticketPrices) return true;
      return event.ticketPrices.min >= filters.priceRange.min && 
             event.ticketPrices.max <= filters.priceRange.max;
    });

    // Filter by crowd level
    if (filters.crowdLevel.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filters.crowdLevel.includes(event.crowdLevel)
      );
    }

    return filteredEvents.sort((a, b) => a.startTime - b.startTime);
  },

  searchEvents: (query: string) => {
    const events = Array.from(get().events.values());
    const lowercaseQuery = query.toLowerCase();
    
    return events.filter(event => 
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.description.toLowerCase().includes(lowercaseQuery) ||
      event.venue.toLowerCase().includes(lowercaseQuery) ||
      event.organizer.toLowerCase().includes(lowercaseQuery) ||
      event.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },

  getUpcomingEvents: (limit = 10) => {
    const now = Date.now();
    return Array.from(get().events.values())
      .filter(event => event.status === 'upcoming' && event.startTime > now)
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, limit);
  },

  getLiveEvents: () => {
    return Array.from(get().events.values())
      .filter(event => event.status === 'live')
      .sort((a, b) => b.currentAttendees - a.currentAttendees);
  },

  getPopularEvents: (limit = 10) => {
    return Array.from(get().events.values())
      .filter(event => event.status !== 'ended' && event.status !== 'cancelled')
      .sort((a, b) => (b.checkins + b.shares) - (a.checkins + a.shares))
      .slice(0, limit);
  },

  getTrackedEventUpdates: () => {
    const { trackedEvents, eventUpdates } = get();
    const updates: EventUpdate[] = [];
    
    for (const eventId of trackedEvents) {
      const eventUpdateList = eventUpdates.get(eventId) || [];
      updates.push(...eventUpdateList);
    }
    
    return updates.sort((a, b) => b.timestamp - a.timestamp);
  },
}));

// Distance calculation helper
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

export default useEventStore;