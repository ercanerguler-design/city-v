import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[]; // location ID'leri
  
  // Actions
  addFavorite: (locationId: string) => void;
  removeFavorite: (locationId: string) => void;
  toggleFavorite: (locationId: string) => void;
  isFavorite: (locationId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (locationId: string) => {
        set((state) => ({
          favorites: [...new Set([...state.favorites, locationId])],
        }));
        console.log('✅ Favorilere eklendi:', locationId);
      },
      
      removeFavorite: (locationId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== locationId),
        }));
        console.log('❌ Favorilerden çıkarıldı:', locationId);
      },
      
      toggleFavorite: (locationId: string) => {
        const { favorites, addFavorite, removeFavorite } = get();
        if (favorites.includes(locationId)) {
          removeFavorite(locationId);
        } else {
          addFavorite(locationId);
        }
      },
      
      isFavorite: (locationId: string) => {
        return get().favorites.includes(locationId);
      },
      
      clearFavorites: () => {
        set({ favorites: [] });
        console.log('🗑️ Tüm favoriler temizlendi');
      },
    }),
    {
      name: 'cityv-favorites', // LocalStorage key
    }
  )
);
