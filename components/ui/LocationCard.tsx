'use client';

import { useState, useEffect } from 'react';
import { Location, CrowdLevel } from '@/types';
import { MapPin, Clock, Bell, Heart, Navigation, TrendingUp, MessageCircle, Star, Camera, Users, Smile, Sparkles } from 'lucide-react';
import { getCategoryIcon, getCategoryColor, getCategoryById } from '@/lib/categories';
import { useFilterStore } from '@/store/filterStore';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';
import { useGamificationStore } from '@/lib/stores/gamificationStore';
import { useSocialStore } from '@/lib/stores/socialStore';
import { useTrackedStore } from '@/lib/stores/trackedStore';
import { useAuthStore } from '@/store/authStore';
import { usePremiumStore } from '@/lib/stores/premiumStore';
import { cn, formatTime } from '@/lib/utils';
import { safeRenderLocation } from '@/lib/locationUtils';
import WorkingHoursBadge from './WorkingHoursBadge';
import { isLocationOpen } from '@/lib/workingHours';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const AddReviewModal = dynamic(() => import('./AddReviewModal'), { ssr: false });

interface LocationCardProps {
  location: Location;
  onReportClick: (location: Location) => void;
  onLocationClick?: (location: Location) => void;
  onSocialClick?: (location: Location) => void;
  onRouteClick?: (location: Location) => void;
  distance?: number | null; // km cinsinden mesafe
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

export default function LocationCard({ location, onReportClick, onLocationClick, onSocialClick, onRouteClick, distance }: LocationCardProps) {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { user } = useAuthStore();
  const { favoriteAdded } = useGamificationStore();
  const { getLocationComments, getLocationPhotos, getLocationRating } = useSocialStore();
  const { trackLocation, untrackLocation, isTracked } = useTrackedStore();
  const { checkSubscriptionStatus } = usePremiumStore();
  // Premium check: user has premium, business, or enterprise tier
  const isPremium = user?.membershipTier && ['premium', 'business', 'enterprise'].includes(user.membershipTier);
  const isLocationFavorite = isFavorite(location.id);
  const isLocationTracked = isTracked(location.id);
  const category = getCategoryById(location.category);
  const [mounted, setMounted] = useState(false);
  
  // Çalışma saati kontrolü - Safe check
  const workingStatus = isLocationOpen(location) || { isOpen: true };
  const isOpen = workingStatus?.isOpen ?? true;
  
  // Sosyal veriler
  const comments = getLocationComments(location.id);
  const photos = getLocationPhotos(location.id);
  const rating = getLocationRating(location.id);

  // 🎥 Live Crowd Data - REAL-TIME from Business Cameras (PREMIUM ONLY)
  const [liveCrowdData, setLiveCrowdData] = useState<any>(null);
  const [loadingCrowd, setLoadingCrowd] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Hydration hatası önlemek için mount sonrası render
  useEffect(() => {
    setMounted(true);
    
    // Load live crowd data from API (ONLY FOR PREMIUM USERS)
    const loadLiveCrowdData = async () => {
      if (!isPremium) return; // Premium check
      if (loadingCrowd) return; // Prevent multiple simultaneous calls
      
      setLoadingCrowd(true);
      try {
        const response = await fetch(`/api/locations/crowd?locationId=${location.id}`);
        const data = await response.json();
        
        if (data.success && data.location) {
          setLiveCrowdData(data.location);
          
          // Update location's crowd level if available
          if (data.location.crowdLevel) {
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('cityv:crowd-update', {
              detail: {
                locationId: location.id,
                ...data.location
              }
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load crowd data:', error);
      } finally {
        setLoadingCrowd(false);
      }
    };

    loadLiveCrowdData();
    
    // Listen for crowd updates from other sources
    const handleCrowdUpdate = (event: any) => {
      if (event.detail.locationId === location.id) {
        setLiveCrowdData(event.detail);
      }
    };

    window.addEventListener('cityv:crowd-update', handleCrowdUpdate);
    
    // Refresh every 10 seconds
    const interval = setInterval(loadLiveCrowdData, 10000);
    
    return () => {
      window.removeEventListener('cityv:crowd-update', handleCrowdUpdate);
      clearInterval(interval);
    };
  }, [location.id]);

  return (
    <div
      className={cn(
        "group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-700 w-full",
        !isOpen && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
      )}
    >
      {/* Header with gradient */}
      <div
        className="h-2 bg-gradient-to-r"
        style={{ background: `linear-gradient(to right, ${category?.color || '#6366f1'}, ${category?.color || '#8b5cf6'})` }}
      />

      <div className="p-5">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex-1 cursor-pointer"
            onClick={async () => {
              // Track view for business dashboard
              try {
                const businessUser = localStorage.getItem('business_user');
                if (businessUser) {
                  const user = JSON.parse(businessUser);
                  const businessId = user.id;
                  
                  // Track view
                  await fetch('/api/business/track-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      businessId: businessId,
                      location: {
                        id: location.id,
                        name: location.name,
                        category: location.category
                      },
                      source: 'map' 
                    })
                  });
                  console.log('👁️ View tracked for business:', location.name);
                }
              } catch (error) {
                console.error('❌ Failed to track view:', error);
              }
              onLocationClick?.(location);
            }}
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
            onClick={async () => {
              const wasFavorite = isLocationFavorite;
              
              // Toggle favorite with userId if logged in
              await toggleFavorite(location.id, user?.id);
              
              // Track for business dashboard
              try {
                // Check if there's a business user logged in
                const businessUser = localStorage.getItem('business_user');
                if (businessUser) {
                  const businessUserData = JSON.parse(businessUser);
                  const businessId = businessUserData.id;
                  
                  // Send to business favorites API
                  await fetch('/api/business/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      businessId: businessId,
                      location: {
                        id: location.id,
                        name: location.name,
                        category: location.category,
                        address: location.address,
                        coordinates: location.coordinates
                      },
                      action: wasFavorite ? 'remove' : 'add',
                      source: 'map'
                    })
                  });
                  console.log(`⭐ Business favorite ${wasFavorite ? 'removed' : 'added'} for:`, location.name);
                }
              } catch (error) {
                console.error('❌ Failed to track business favorite:', error);
              }
              
              if (!wasFavorite) {
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
            {!isOpen && workingStatus?.reason && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {workingStatus.reason}
              </span>
            )}
          </div>
          
          {/* 🎥 Live Crowd Data Badge (PREMIUM FEATURE) */}
          {isPremium && liveCrowdData && liveCrowdData.isLive ? (
            <div className="space-y-2 animate-in fade-in zoom-in duration-300">

              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold border border-red-300 dark:border-red-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                CANLI VERİ
              </div>
              
              {/* Real-time Crowd Stats */}
              <div className={cn(
                'flex items-center justify-between gap-3 p-3 rounded-xl text-white font-bold text-sm shadow-lg',
                liveCrowdData.crowdLevel === 'very_high' ? 'bg-gradient-to-r from-red-600 to-pink-600' :
                liveCrowdData.crowdLevel === 'high' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                liveCrowdData.crowdLevel === 'moderate' ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                liveCrowdData.crowdLevel === 'low' ? 'bg-gradient-to-r from-lime-500 to-green-500' :
                'bg-gradient-to-r from-green-500 to-emerald-500'
              )}>
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 animate-pulse" />
                  <div className="text-left">
                    <div className="text-lg leading-tight">{liveCrowdData.currentPeople} Kişi</div>
                    <div className="text-xs opacity-90 font-normal">
                      {liveCrowdData.crowdLevel === 'very_high' ? 'Çok Kalabalık' :
                       liveCrowdData.crowdLevel === 'high' ? 'Kalabalık' :
                       liveCrowdData.crowdLevel === 'moderate' ? 'Orta Yoğun' :
                       liveCrowdData.crowdLevel === 'low' ? 'Az Kalabalık' : 'Boş'}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs opacity-90">
                  <div>{liveCrowdData.activeCameras}/{liveCrowdData.totalCameras} kamera</div>
                  <div className="font-normal">%{liveCrowdData.avgOccupancy} yoğunluk</div>
                </div>
              </div>
            </div>
          ) : !isPremium && mounted ? (
            /* Premium Upgrade Teaser */
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white animate-in fade-in slide-in-from-bottom-2 duration-300">

              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">🎥 Canlı Kişi Sayısı</div>
                  <div className="text-xs opacity-90">
                    Premium üyelikle anlık kişi sayısını görün
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast('✨ Premium özelliği! Üyelik sayfasına yönlendiriliyorsunuz...', {
                      icon: '👑',
                    });
                    setTimeout(() => {
                      window.location.href = '/pricing';
                    }, 1000);
                  }}
                  className="flex-shrink-0 bg-white text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors"
                >
                  Yükselt
                </button>
              </div>
            </div>
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 font-bold text-sm bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <Clock className="w-4 h-4" />
                  {isOpen ? 'Veri Bekleniyor' : 'Kapalı - Veri Yok'}
                </div>
              )}
            </>
          )}
          
          {/* Working Hours Badge - Sadece client-side render */}
          {mounted && location.workingHours && (
            <WorkingHoursBadge location={location} size="medium" />
          )}

          {/* Real-time People Count (Business IoT) */}
          {mounted && location.source === 'business' && location.currentPeopleCount !== undefined && location.currentPeopleCount > 0 && (
            <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  İçeride şu anda <span className="text-lg">{location.currentPeopleCount}</span> kişi
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">📡 Canlı AI kamera verisi</p>
            </div>
          )}
        </div>

        {/* Address - Google'dan gelen gerçek adres */}
        {location.address && (
          <div className="mb-4 text-sm text-gray-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{safeRenderLocation(location.address)}</span>
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
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <button
            onClick={() => onRouteClick?.(location)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 md:py-2.5 px-3 md:px-3 rounded-xl hover:from-green-600 hover:to-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold text-sm md:text-xs shadow-lg hover:shadow-xl touch-manipulation"
          >
            <Navigation className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Rota</span>
            <span className="sm:hidden">🗺️</span>
          </button>
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 md:py-2.5 px-3 md:px-3 rounded-xl hover:from-pink-600 hover:to-rose-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold text-sm md:text-xs shadow-lg hover:shadow-xl touch-manipulation"
          >
            <Smile className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Yorum</span>
            <span className="sm:hidden">💬</span>
          </button>
          <button
            onClick={() => onReportClick(location)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 md:py-2.5 px-3 md:px-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold text-sm md:text-xs shadow-lg hover:shadow-xl touch-manipulation"
          >
            <Bell className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Bildir</span>
            <span className="sm:hidden">📢</span>
          </button>
          <button
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
              "text-white py-2.5 px-3 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold text-xs shadow-lg hover:shadow-xl",
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
          </button>
          <button
            onClick={() => onSocialClick?.(location)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 px-3 rounded-xl hover:from-pink-600 hover:to-rose-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 font-bold text-xs shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-4 h-4" />
            Sosyal
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <AddReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          locationId={location.id}
          locationName={location.name}
        />
      )}
    </div>
  );
}
