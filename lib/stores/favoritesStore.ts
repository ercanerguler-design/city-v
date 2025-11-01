import { create } from 'zustand';

interface FavoritesStore {
  favorites: string[]; // location ID'leri
  isLoaded: boolean;
  
  // Actions
  loadFavorites: (userId: number) => Promise<void>;
  addFavorite: (locationId: string, userId?: number) => Promise<void>;
  removeFavorite: (locationId: string, userId?: number) => Promise<void>;
  toggleFavorite: (locationId: string, userId?: number) => Promise<void>;
  isFavorite: (locationId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  isLoaded: false,
  
  loadFavorites: async (userId: number) => {
    try {
      const response = await fetch(`/api/user/favorites?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        set({ favorites: data.favorites, isLoaded: true });
        console.log('✅ Favoriler veritabanından yüklendi:', data.favorites.length);
      }
    } catch (error) {
      console.error('❌ Favoriler yüklenemedi:', error);
      set({ isLoaded: true });
    }
  },
  
  addFavorite: async (locationId: string, userId?: number) => {
    // Önce local state'i güncelle (optimistic update)
    set((state) => ({
      favorites: [...new Set([...state.favorites, locationId])],
    }));
    console.log('✅ Favorilere eklendi:', locationId);
    
    // Kullanıcı giriş yaptıysa veritabanına kaydet
    if (userId) {
      try {
        await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            locationId,
            action: 'add'
          })
        });
        console.log('💾 Favori veritabanına kaydedildi');
      } catch (error) {
        console.error('❌ Favori veritabanına kaydedilemedi:', error);
      }
    }
  },
  
  removeFavorite: async (locationId: string, userId?: number) => {
    // Önce local state'i güncelle
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== locationId),
    }));
    console.log('❌ Favorilerden çıkarıldı:', locationId);
    
    // Kullanıcı giriş yaptıysa veritabanından sil
    if (userId) {
      try {
        await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            locationId,
            action: 'remove'
          })
        });
        console.log('💾 Favori veritabanından silindi');
      } catch (error) {
        console.error('❌ Favori veritabanından silinemedi:', error);
      }
    }
  },
  
  toggleFavorite: async (locationId: string, userId?: number) => {
    const { favorites, addFavorite, removeFavorite } = get();
    if (favorites.includes(locationId)) {
      await removeFavorite(locationId, userId);
    } else {
      await addFavorite(locationId, userId);
    }
  },
  
  isFavorite: (locationId: string) => {
    return get().favorites.includes(locationId);
  },
  
  clearFavorites: () => {
    set({ favorites: [], isLoaded: false });
    console.log('🗑️ Tüm favoriler temizlendi');
  },
}));
