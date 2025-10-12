import { create } from 'zustand';
import { Location, CrowdLevel } from '@/types';

interface FilterState {
  selectedCategories: string[];
  crowdLevelFilter: CrowdLevel[];
  searchQuery: string;
  showFavoritesOnly: boolean;
  favorites: string[];
  setSelectedCategories: (categories: string[]) => void;
  setCrowdLevelFilter: (levels: CrowdLevel[]) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (locationId: string) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategories: [],
  crowdLevelFilter: [],
  searchQuery: '',
  showFavoritesOnly: false,
  favorites: [],

  setSelectedCategories: (categories) =>
    set({ selectedCategories: categories }),

  setCrowdLevelFilter: (levels) =>
    set({ crowdLevelFilter: levels }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  toggleFavorite: (locationId) =>
    set((state) => ({
      favorites: state.favorites.includes(locationId)
        ? state.favorites.filter((id) => id !== locationId)
        : [...state.favorites, locationId],
    })),

  setShowFavoritesOnly: (show) =>
    set({ showFavoritesOnly: show }),

  clearFilters: () =>
    set({
      selectedCategories: [],
      crowdLevelFilter: [],
      searchQuery: '',
      showFavoritesOnly: false,
    }),
}));
