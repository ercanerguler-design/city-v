import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location } from '@/types';

interface TrackedState {
  trackedLocationIds: string[];
  trackLocation: (locationId: string) => void;
  untrackLocation: (locationId: string) => void;
  isTracked: (locationId: string) => boolean;
  getTrackedLocations: (allLocations: Location[]) => Location[];
  clearAllTracked: () => void;
}

export const useTrackedStore = create<TrackedState>()(
  persist(
    (set, get) => ({
      trackedLocationIds: [],

      trackLocation: (locationId: string) => {
        set((state) => {
          if (!state.trackedLocationIds.includes(locationId)) {
            return {
              trackedLocationIds: [...state.trackedLocationIds, locationId],
            };
          }
          return state;
        });
      },

      untrackLocation: (locationId: string) => {
        set((state) => ({
          trackedLocationIds: state.trackedLocationIds.filter((id) => id !== locationId),
        }));
      },

      isTracked: (locationId: string) => {
        return get().trackedLocationIds.includes(locationId);
      },

      getTrackedLocations: (allLocations: Location[]) => {
        const { trackedLocationIds } = get();
        return allLocations.filter((loc) => trackedLocationIds.includes(loc.id));
      },

      clearAllTracked: () => {
        set({ trackedLocationIds: [] });
      },
    }),
    {
      name: 'tracked-locations-storage',
    }
  )
);
