'use client';

import { useState, useEffect } from 'react';
import { Heart, Star, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';
import WorkingHoursBadge from '@/components/ui/WorkingHoursBadge';

interface BusinessFavorite {
  id: string;
  name: string;
  address: string;
  category: string;
  rating?: number;
  currentCrowdLevel: string;
  coordinates: [number, number];
}

interface BusinessFavoritesSyncProps {
  businessUser: any;
}

export default function BusinessFavoritesSync({ businessUser }: BusinessFavoritesSyncProps) {
  const [syncedFavorites, setSyncedFavorites] = useState<BusinessFavorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [normalUserId, setNormalUserId] = useState<number | null>(null);
  
  const { favorites, loadFavorites, isLoaded } = useFavoritesStore();

  // Business user'ın email'i ile normal user'ı bul
  useEffect(() => {
    const findNormalUser = async () => {
      if (!businessUser?.email) return;
      
      try {
        console.log('🔍 Business user email ile normal user aranıyor:', businessUser.email);
        
        const response = await fetch(`/api/user/find-by-email?email=${encodeURIComponent(businessUser.email)}`);
        const data = await response.json();
        
        if (data.success && data.user) {
          setNormalUserId(data.user.id);
          console.log('✅ Normal user bulundu:', data.user.id);
          
          // Favorites'ları yükle
          await loadFavorites(data.user.id);
        } else {
          console.log('ℹ️ Bu email ile normal user bulunamadı');
        }
      } catch (error) {
        console.error('❌ Normal user arama hatası:', error);
      }
    };
    
    findNormalUser();
  }, [businessUser?.email, loadFavorites]);

  // Favorites'ları location data ile birleştir
  useEffect(() => {
    const loadFavoriteDetails = async () => {
      if (!favorites || favorites.length === 0) {
        setSyncedFavorites([]);
        return;
      }
      
      setLoading(true);
      try {
        console.log('📋 Favori detayları yükleniyor:', favorites);
        
        // Location data'sını çek
        const response = await fetch('/api/locations/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locationIds: favorites })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSyncedFavorites(data.locations || []);
          console.log('✅ Favori detayları yüklendi:', data.locations?.length || 0);
        } else {
          console.error('❌ Favori detayları yüklenemedi:', data.error);
        }
      } catch (error) {
        console.error('❌ Favori detayları yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isLoaded) {
      loadFavoriteDetails();
    }
  }, [favorites, isLoaded]);

  if (!businessUser?.email) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Favori Yerler
        </h3>
        <p className="text-gray-500 text-sm">Business profil bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Favori Yerler
        </h3>
        <div className="text-xs text-gray-500">
          {normalUserId ? (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              ✅ Sync Edildi
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              ⚠️ Sync Yok
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Favoriler yükleniyor...</p>
        </div>
      ) : syncedFavorites.length === 0 ? (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Henüz favori yer yok</p>
          <p className="text-xs text-gray-400">
            Ana uygulamada beğendiğiniz yerleri favorilere ekleyin
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {syncedFavorites.slice(0, 5).map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {favorite.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {favorite.address}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      {favorite.category}
                    </span>
                    <WorkingHoursBadge location={favorite} size="small" />
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  {favorite.rating && (
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">
                        {favorite.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    favorite.currentCrowdLevel === 'empty' ? 'bg-green-100 text-green-700' :
                    favorite.currentCrowdLevel === 'low' ? 'bg-blue-100 text-blue-700' :
                    favorite.currentCrowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    favorite.currentCrowdLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {favorite.currentCrowdLevel === 'empty' && 'Boş'}
                    {favorite.currentCrowdLevel === 'low' && 'Az'}
                    {favorite.currentCrowdLevel === 'medium' && 'Orta'}
                    {favorite.currentCrowdLevel === 'high' && 'Kalabalık'}
                    {favorite.currentCrowdLevel === 'very_high' && 'Çok Kalabalık'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {syncedFavorites.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                +{syncedFavorites.length - 5} favori daha var
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}