'use client';

import { useState, useEffect } from 'react';
import { Location, CrowdLevel } from '@/types';
import { MapPin, Clock, Bell, Heart, Navigation, TrendingUp, MessageCircle, Star, Camera, Users } from 'lucide-react';
import { getCategoryIcon, getCategoryColor, getCategoryById } from '@/lib/categories';
import { useFilterStore } from '@/store/filterStore';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';
import { useGamificationStore } from '@/lib/stores/gamificationStore';
import { useSocialStore } from '@/lib/stores/socialStore';
import { useTrackedStore } from '@/lib/stores/trackedStore';
import { motion } from 'framer-motion';
import { cn, formatTime } from '@/lib/utils';
import WorkingHoursBadge from './WorkingHoursBadge';
import { isLocationOpen } from '@/lib/workingHours';
import toast from 'react-hot-toast';

interface LocationCardProps {
  location: Location;
  onReportClick: (location: Location) => void;
  onLocationClick?: (location: Location) => void;
  onSocialClick?: (location: Location) => void;
  distance?: number; // km cinsinden mesafe
}

const getCrowdColor = (level: CrowdLevel): string => {
  const colors = {
    empty: 'from-green-500 to-emerald-500',
    low: 'from-lime-500 to-green-500',
    moderate: 'from-yellow-500 to-orange-400',
    high: 'from-orange-500 to-red-500',
    very_high: 'from-red-500 to-pink-600',
  };
  return colors[level];
};

const getCrowdLevelText = (level: CrowdLevel): string => {
  const texts = {
    empty: 'Boş',
    low: 'Az Kalabalık',
    moderate: 'Orta Yoğun',
    high: 'Kalabalık',
    very_high: 'Çok Kalabalık',
  };
  return texts[level];
};

export default function LocationCard({ location, onReportClick, onLocationClick, onSocialClick, distance }: LocationCardProps) {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { favoriteAdded } = useGamificationStore();
  const { getLocationComments, getLocationPhotos, getLocationRating } = useSocialStore();
  const { trackLocation, untrackLocation, isTracked } = useTrackedStore();
  const isLocationFavorite = isFavorite(location.id);
  const isLocationTracked = isTracked(location.id);
  const category = getCategoryById(location.category);
  const [mounted, setMounted] = useState(false);
  
  // Çalışma saati kontrolü
  const workingStatus = isLocationOpen(location);
  const isOpen = workingStatus.isOpen;
  
  // Sosyal veriler
  const comments = getLocationComments(location.id);
  const photos = getLocationPhotos(location.id);
  const rating = getLocationRating(location.id);

  // 🎥 Live Crowd Data
  const [liveCrowdData, setLiveCrowdData] = useState<any>(null);

  // Hydration hatası önlemek için mount sonrası render
  useEffect(() => {
    setMounted(true);
    
    // Load live crowd data from localStorage
    const loadLiveCrowdData = () => {
      const data = localStorage.getItem(`cityv_crowd_${location.id}`);
      if (data) {
        try {
          setLiveCrowdData(JSON.parse(data));
        } catch (error) {
          console.error('Failed to parse crowd data:', error);
        }
      }
    };

    loadLiveCrowdData();
    
    // Listen for crowd updates
    const handleCrowdUpdate = (event: any) => {
      if (event.detail.locationId === location.id) {
        setLiveCrowdData(event.detail);
      }
    };

    window.addEventListener('cityv:crowd-update', handleCrowdUpdate);
    
    // Refresh every 5 seconds
    const interval = setInterval(loadLiveCrowdData, 5000);
    
    return () => {
      window.removeEventListener('cityv:crowd-update', handleCrowdUpdate);
      clearInterval(interval);
    };
  }, [location.id]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-700 w-full",
        !isOpen && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
      )}
    >
      {/* Header with gradient */}
      <div
        className="h-2 bg-gradient-to-r"
        style={{ background: `linear-gradient(to right, ${category?.color || '#6366f1'}, ${category?.color || '#8b5cf6'})` }}
      />
      
      {/* Mesafe Badge (üstte) - HASSAS */}
      {distance !== undefined && distance !== null && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 md:py-2 text-center">
          <p className="text-sm md:text-xs font-semibold">
            📍 {distance < 0.1 
              ? `${Math.round(distance * 1000)} m uzakta`
              : distance < 1 
              ? `${Math.round(distance * 1000)} m uzakta`
              : `${distance.toFixed(2)} km uzakta`
            }
          </p>
        </div>
      )}

      <div className="p-5">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => onLocationClick?.(location)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(location.category)}</span>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {location.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{category?.name}</span>
            </div>
          </div>

          <button
            onClick={() => {
              toggleFavorite(location.id);
              if (!isLocationFavorite) {
                // Gamification: Favori ekleme
                favoriteAdded();
                
                toast.success(`❤️ ${location.name} favorilere eklendi!`, {
                  icon: '⭐',
                  style: {
                    borderRadius: '12px',
                    background: '#10b981',
                    color: '#fff',
                  },
                });
              } else {
                toast(`💔 ${location.name} favorilerden çıkarıldı`, {
                  icon: '➖',
                });
              }
            }}
            className={cn(
              'p-2 rounded-full transition-all',
              isLocationFavorite
                ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-400 dark:hover:text-red-400'
            )}
          >
            <Heart className={cn('w-5 h-5', isLocationFavorite && 'fill-current')} />
          </button>
        </div>

        {/* Crowd Level & Working Hours */}
        <div className="mb-4 space-y-2">
          {/* Çalışma Durumu Badge */}
          <div className="flex items-center justify-between">
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold',
              isOpen 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            )}>
              <Clock className="w-3 h-3" />
              {isOpen ? 'AÇIK' : 'KAPALI'}
            </div>
            {!isOpen && workingStatus.reason && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {workingStatus.reason}
              </span>
            )}
          </div>
          
          {/* 🎥 Live Crowd Data Badge (if available) */}
          {liveCrowdData ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg border-2 border-white/20"
            >
              <Users className="w-4 h-4 animate-pulse" />
              <span>ŞU AN: {liveCrowdData.currentCount} KİŞİ</span>
              <span className="text-xs opacity-80">({liveCrowdData.crowdLevel})</span>
            </motion.div>
          ) : (
            <>
              {/* Kalabalık durumu - sadece açık mekanlar için, kapalıysa boş göster */}
              {(isOpen && location.currentCrowdLevel !== 'empty') || location.averageWaitTime > 0 ? (
                <div className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm bg-gradient-to-r shadow-md',
                  getCrowdColor(location.currentCrowdLevel)
                )}>
                  <TrendingUp className="w-4 h-4" />
                  {getCrowdLevelText(location.currentCrowdLevel)}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 font-bold text-sm bg-gray-100 border-2 border-dashed border-gray-300">
                  <Clock className="w-4 h-4" />
                  Kapalı - Veri Yok
                </div>
              )}
            </>
          )}
          
          {/* Working Hours Badge - Sadece client-side render */}
          {mounted && location.workingHours && (
            <WorkingHoursBadge location={location} size="medium" />
          )}
        </div>

        {/* Address - Google'dan gelen gerçek adres */}
        {location.address && (
          <div className="mb-4 text-sm text-gray-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{location.address}</span>
          </div>
        )}

        {/* Google Rating */}
        {location.rating && (
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
              <span className="text-yellow-500 font-bold mr-1">⭐</span>
              <span className="font-bold text-gray-800">{location.rating.toFixed(1)}</span>
            </div>
            {location.reviewCount && (
              <span className="text-xs text-gray-500">
                ({location.reviewCount.toLocaleString('tr-TR')} değerlendirme)
              </span>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Clock className="w-3 h-3" />
              <span>Bekleme Süresi</span>
            </div>
            <p className="font-bold text-gray-800">
              {location.currentCrowdLevel === 'empty' && location.averageWaitTime === 0 
                ? '-' 
                : location.averageWaitTime === 0 ? 'Yok' : `${location.averageWaitTime} dk`
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Navigation className="w-3 h-3" />
              <span>Mesafe</span>
            </div>
            <p className="font-bold text-gray-800">
              {distance !== undefined
                ? distance < 1
                  ? `${Math.round(distance * 1000)}m`
                  : `${distance.toFixed(1)}km`
                : 'Bilinmiyor'}
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-400 mb-4">
          Son güncelleme: {formatTime(new Date(location.lastUpdated))}
        </p>

        {/* Social Stats */}
        {mounted && (rating || comments.length > 0 || photos.length > 0) && (
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {rating.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({rating.totalRatings})
                </span>
              </div>
            )}
            {comments.length > 0 && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{comments.length}</span>
              </div>
            )}
            {photos.length > 0 && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Camera className="w-4 h-4" />
                <span className="text-sm">{photos.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onLocationClick?.(location)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 md:py-2.5 px-3 md:px-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-1.5 font-bold text-sm md:text-xs shadow-lg hover:shadow-xl touch-manipulation"
          >
            <Navigation className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Rota</span>
            <span className="sm:hidden">🗺️</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReportClick(location)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 md:py-2.5 px-3 md:px-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-1.5 font-bold text-sm md:text-xs shadow-lg hover:shadow-xl touch-manipulation"
          >
            <Bell className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Bildir</span>
            <span className="sm:hidden">📢</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (isLocationTracked) {
                untrackLocation(location.id);
                toast.success(`❌ ${location.name} takipten çıkarıldı`);
              } else {
                trackLocation(location.id);
                toast.success(`📌 ${location.name} takibe eklendi!`);
              }
            }}
            className={cn(
              "text-white py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold text-xs shadow-lg hover:shadow-xl",
              isLocationTracked
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
            )}
          >
            {isLocationTracked ? (
              <>
                <Star className="w-4 h-4 fill-current" />
                Takipte
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                Takip Et
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSocialClick?.(location)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 px-3 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all flex items-center justify-center gap-1.5 font-bold text-xs shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-4 h-4" />
            Sosyal
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
