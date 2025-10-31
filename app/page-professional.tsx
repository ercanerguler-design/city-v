'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Map as MapIcon, Grid3x3, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import ProHeader from '@/components/Layout/ProHeader';
import LocationCard from '@/components/ui/LocationCard';
import ReportForm from '@/components/CrowdReport/ReportForm';
import AuthModal from '@/components/Auth/AuthModal';
import FilterPanel from '@/components/ui/FilterPanel';
import AnalyticsDashboard from '@/components/Analytics/AnalyticsDashboard';
import AdvancedAnalytics from '@/components/Analytics/AdvancedAnalytics';
import GamificationDashboard from '@/components/Gamification/GamificationDashboard';
import SocialModal from '@/components/Social/SocialModal';
import SmartRecommendations from '@/components/Recommendations/SmartRecommendations';
import LocationPicker from '@/components/ui/LocationPicker';
import LocationPermissionBanner from '@/components/ui/LocationPermissionBanner';
import PremiumModal from '@/components/Premium/PremiumModal';
import PremiumThemesModal from '@/components/Premium/PremiumThemesModal';
import PWASettingsModal from '@/components/PWA/PWASettingsModal';
import MapControlPanel from '@/components/Map/MapControlPanel';
import RouteModal from '@/components/ui/RouteModal';
import TrackedLocationsModal from '@/components/Tracked/TrackedLocationsModal';
import WeatherWidget from '@/components/ui/WeatherWidget';
import { LoadingGrid } from '@/components/ui/LocationCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import LocationGrid from '@/components/ui/LocationGrid';
import OnboardingTour from '@/components/Onboarding/OnboardingTour';
import ProfileModal from '@/components/Profile/ProfileModal';
import SettingsModal from '@/components/Settings/SettingsModal';
import NotificationsPanel from '@/components/Notifications/NotificationsPanel';
import BusinessNotificationsPanel from '@/components/Notifications/BusinessNotificationsPanel';
import AIChatBot from '@/components/AI/AIChatBot';
import LiveCrowdSidebar from '@/components/RealTime/LiveCrowdSidebar';
import QRScanner from '@/components/Camera/QRScanner';
import PhotoGallery from '@/components/Camera/PhotoGallery';

// Business Box Promotion Components
import BusinessBoxBanner from '@/components/business-box/BusinessBoxBanner';
import BusinessBoxFloatingButton from '@/components/business-box/BusinessBoxFloatingButton';
import BusinessBoxModal from '@/components/business-box/BusinessBoxModal';

// Hooks
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useThemeStore } from '@/lib/stores/themeStore';
import { useAnalyticsStore } from '@/lib/stores/analyticsStore';
import { useGamificationStore } from '@/lib/stores/gamificationStore';
import { useRecommendationStore } from '@/lib/stores/recommendationStore';
import { usePremiumStore } from '@/lib/stores/premiumStore';
import { useTrackedStore } from '@/lib/stores/trackedStore';
import { useCameraStore } from '@/store/cameraStore';

// Data & Types
import { Location, CrowdLevel } from '@/types';
import { useFilterStore } from '@/store/filterStore';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { isLocationOpen } from '@/lib/workingHours';

// Dynamic imports
const MapView = dynamic(() => import('@/components/Map/MapViewEnhanced'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Harita yükleniyor...</p>
      </div>
    </div>
  ),
});

export default function ProfessionalHome() {
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedSocialLocation, setSelectedSocialLocation] = useState<Location | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeTargetLocation, setRouteTargetLocation] = useState<Location | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showThemesModal, setShowThemesModal] = useState(false);
  const [showPWASettings, setShowPWASettings] = useState(false);
  const [showMapControls, setShowMapControls] = useState(false);
  const [showTrackedLocations, setShowTrackedLocations] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showLiveCrowd, setShowLiveCrowd] = useState(true); // 🔥 Canlı kalabalık otomatik açık
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9334, 32.8597]); // Ankara merkez
  const [mapZoom, setMapZoom] = useState(12);
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [nearbyLocationsGenerated, setNearbyLocationsGenerated] = useState(false);

  // Stores
  const { selectedCategories, crowdLevelFilter, searchQuery, showFavoritesOnly, favorites, clearFilters } = useFilterStore();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedCity, userLocation, userAddress, requestUserLocation } = useLocationStore();
  const { toggleTheme } = useThemeStore();
  const { trackVisit } = useAnalyticsStore();
  const { checkIn, reportSubmitted, routeCreated, favoriteAdded } = useGamificationStore();
  const { addVisitToHistory } = useRecommendationStore();
  const { checkSubscriptionStatus } = usePremiumStore();
  const { isQRScannerActive } = useCameraStore();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => {
        searchInputRef.current?.focus();
        toast.success('🔍 Arama çubuğuna odaklandı');
      },
      description: 'Arama çubuğuna odaklan'
    },
    {
      key: 'f',
      ctrlKey: true,
      callback: () => {
        setShowFilterPanel(prev => !prev);
        toast.success(showFilterPanel ? 'Filtreler kapatıldı' : '🎯 Filtreler açıldı');
      },
      description: 'Filtreleri aç/kapat'
    },
    {
      key: 'Escape',
      callback: () => {
        if (selectedLocation) setSelectedLocation(null);
        if (showFilterPanel) setShowFilterPanel(false);
        if (showReportForm) setShowReportForm(false);
        if (showAuthModal) setShowAuthModal(false);
        if (showAnalytics) setShowAnalytics(false);
        if (showRouteModal) setShowRouteModal(false);
        if (showPremiumModal) setShowPremiumModal(false);
        toast('Kapatıldı');
      },
      description: 'Açık pencereleri kapat'
    },
    {
      key: 'd',
      ctrlKey: true,
      callback: () => {
        toggleTheme();
        toast.success('🌓 Tema değiştirildi');
      },
      description: 'Dark mode aç/kapat'
    }
  ]);

  // Şehir değişince sadece harita merkezini güncelle (locations API'den gelecek)
  useEffect(() => {
    // Şehir merkezleri
    const cityCenters: Record<string, [number, number]> = {
      ankara: [39.9334, 32.8597],
      istanbul: [41.0082, 28.9784],
      izmir: [38.4237, 27.1428]
    };
    
    setMapCenter(cityCenters[selectedCity] || [39.9334, 32.8597]);
    setMapZoom(12);
  }, [selectedCity]);

  // Kullanıcı konumu alındığında harita merkezini güncelle
  useEffect(() => {
    if (userLocation) {
      console.log('📍 Kullanıcı konumu algılandı:', userLocation);
      setMapCenter(userLocation);
      setMapZoom(14); // Daha yakın zoom
      
      // Filtreleri temizle
      useFilterStore.getState().clearFilters();
    }
  }, [userLocation]);

  // Business locations'ları çek ve haritaya ekle (SADECE GERÇEK VERİ)
  useEffect(() => {
    const fetchBusinessLocations = async () => {
      try {
        console.log('🏢 Business locations çekiliyor...');
        const response = await fetch('/api/cityv/business-locations');
        const data = await response.json();
        
        if (data.success && data.locations) {
          console.log('✅ Business locations alındı:', data.locations.length);
          console.log('📍 Locations detay:', data.locations);
          
          // Business locations'ı Location formatına dönüştür
          const businessLocations: Location[] = data.locations.map((business: any) => {
            // API'den [lng, lat] geliyor, Leaflet için [lat, lng] çevirelim
            const lat = business.coordinates[1];
            const lng = business.coordinates[0];
            
            console.log(`🏪 ${business.name}: [${lat}, ${lng}] (lat, lng)`);
            
            return {
              id: `business-${business.businessId}`, // Business prefix ile unique ID
              name: business.name,
              category: business.category || 'restaurant',
              coordinates: [lat, lng], // Leaflet için [lat, lng] formatı
              address: business.address,
              description: business.description,
              currentCrowdLevel: business.crowdLevel || 'orta',
              photos: business.photos || [],
              workingHours: business.workingHours,
              phone: business.phone,
              email: business.email,
              website: business.website,
              features: business.features || [],
              isBusiness: true, // Business marker olarak işaretle
              businessData: business, // Tüm business verilerini sakla
              // Crowd data ekle
              currentPeople: business.currentPeople || 0,
              isLive: business.isLive || false,
              hasCampaigns: business.hasCampaigns || false,
              campaigns: business.campaigns || []
            };
          });
          
          console.log('🗺️ Haritaya eklenecek locations:', businessLocations.length);
          
          // Sadece business locations'ları set et (mock data YOK)
          setLocations(businessLocations);
          setIsLoadingPlaces(false);
          
          console.log('✅ Business locations haritaya eklendi');
        } else {
          console.warn('⚠️ Business location bulunamadı');
          setLocations([]);
          setIsLoadingPlaces(false);
        }
      } catch (error) {
        console.error('❌ Business locations çekilemedi:', error);
        setLocations([]);
        setIsLoadingPlaces(false);
      }
    };
    
    // Sayfa yüklendiğinde çek
    setIsLoadingPlaces(true);
    fetchBusinessLocations();
    
    // Her 30 saniyede bir güncelle (real-time IoT data için)
    const interval = setInterval(fetchBusinessLocations, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Konum banner'ını göster (sadece bir kez, kullanıcı konumu yoksa)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userLocation && !localStorage.getItem('locationBannerDismissed')) {
        setShowLocationBanner(true);
      }
    }, 3000); // 3 saniye sonra göster

    return () => clearTimeout(timer);
  }, [userLocation]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    // Eğer yükleniyorsa veya henüz veri yoksa, boş array döndür (hata mesajı gösterme)
    if (isLoadingPlaces || locations.length === 0) {
      console.log('⏳ Filtreleme atlanıyor - Veri yükleniyor veya henüz yok');
      return [];
    }
    
    console.log('\n🔍 ============================================');
    console.log('🔍 FİLTRELEME BAŞLADI');
    console.log('🔍 ============================================');
    console.log('📊 Toplam locations:', locations.length);
    
    if (selectedCategories.length > 0) {
      console.log('🏷️ Seçili kategoriler:', selectedCategories.join(', '));
    }
    if (crowdLevelFilter.length > 0) {
      console.log('👥 Kalabalık filtreleri:', crowdLevelFilter.join(', '));
    }
    if (searchQuery) {
      console.log('🔎 Arama:', searchQuery);
    }
    
    let debugCounter = 0;
    const filtered = locations.filter((loc) => {
      const isMatch = {
        search: true,
        category: true,
        crowd: true,
        favorite: true
      };
      
      // Search filter
      if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        isMatch.search = false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(loc.category)) {
        isMatch.category = false;
      }

      // Crowd level filter
      if (crowdLevelFilter.length > 0 && !crowdLevelFilter.includes(loc.currentCrowdLevel)) {
        isMatch.crowd = false;
      }

      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(loc.id)) {
        isMatch.favorite = false;
      }

      const passes = isMatch.search && isMatch.category && isMatch.crowd && isMatch.favorite;
      
      // Ilk 3 yeri detayli logla
      if (debugCounter < 3) {
        console.log(`\nYer #${debugCounter + 1}: ${loc.name}`);
        console.log('  Filtre sonuclari:', isMatch);
        console.log('  GECTI:', passes ? 'EVET' : 'HAYIR');
        debugCounter++;
      }
      
      return passes;
    });
    
    console.log('\n✅ FİLTRELEME TAMAMLANDI');
    console.log('📊 Sonuç:', filtered.length, 'yer');
    
    if (filtered.length > 0) {
      console.log('📋 İlk 3 yer:');
      filtered.slice(0, 3).forEach((loc, i) => {
        console.log(`   ${i+1}. ${loc.name} (${loc.category}) - ${((loc as any).distance || 0).toFixed(2)} km`);
      });
    } else if (locations.length > 0) {
      console.warn('\n⚠️ FİLTRELEME SONUCU BOŞ!');
      if (selectedCategories.length > 0) console.log('   ↳ Kategori:', selectedCategories.join(', '));
      if (crowdLevelFilter.length > 0) console.log('   ↳ Kalabalık:', crowdLevelFilter.join(', '));
      if (searchQuery) console.log('   ↳ Arama:', searchQuery);
      if (showFavoritesOnly) console.log('   ↳ Sadece favoriler');
    }
    console.log('🔍 ============================================\n');
    
    return filtered;
  }, [locations, selectedCategories, crowdLevelFilter, searchQuery, showFavoritesOnly, favorites, isLoadingPlaces]);

  // Auto-update locations (demo)
  useEffect(() => {
    const interval = setInterval(() => {
      setLocations((prev) => updateLocationsCrowdLevel(prev));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleLocationClick = (location: Location) => {
    // Analytics'e kaydet
    trackVisit(location.id, location.name, location.category, location.currentCrowdLevel);
    
    // Gamification: Check-in
    checkIn(location.id);
    
    // Recommendations: Ziyaret geçmişine ekle
    addVisitToHistory(location.id, location.category, location.currentCrowdLevel);
    
    // Rota modalını aç
    if (userLocation) {
      setRouteTargetLocation(location);
      setShowRouteModal(true);
    } else {
      alert('Rota göstermek için önce konumunuzu paylaşmalısınız.');
    }
  };

  const handleSocialClick = (location: Location) => {
    setSelectedSocialLocation(location);
    setShowSocialModal(true);
  };
  
  const handleMapMarkerClick = (location: Location) => {
    setSelectedLocation(location);
    // Grid'den tıklandıysa haritaya geç ve konumu ortala
    if (viewMode === 'grid') {
      setViewMode('map');
      setMapCenter(location.coordinates);
      setMapZoom(16);
    }
  };

  const handleReportClick = (location: Location) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setSelectedLocation(location);
    setShowReportForm(true);
  };

  const handleReportSubmit = (report: any) => {
    if (selectedLocation) {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === selectedLocation.id
            ? {
                ...loc,
                currentCrowdLevel: report.crowdLevel,
                averageWaitTime: report.waitTime,
                lastUpdated: new Date(),
              }
            : loc
        )
      );
      
      // Gamification: Rapor gönderme
      reportSubmitted();
    }

    setShowReportForm(false);
    setSelectedLocation(null);

    // Success notification
    showNotification('✅ Bildiriminiz başarıyla kaydedildi! Teşekkür ederiz.');
  };

  const showNotification = (message: string) => {
    // Simple notification (can be enhanced with a toast library)
    alert(message);
  };

  const activeFiltersCount = selectedCategories.length + crowdLevelFilter.length + (searchQuery ? 1 : 0);

  // Mesafe hesaplama fonksiyonu (Haversine formula) - useMemo'dan ÖNCE tanımlanmalı
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  // Kullanıcının konumuna göre yakınlık sıralaması
  const sortedLocationsByDistance = useMemo(() => {
    console.log('\n📏 ============================================');
    console.log('📏 MESAFEYE GÖRE SIRALAMA');
    console.log('📏 ============================================');
    console.log('📊 Filtrelenmiş yer sayısı:', filteredLocations.length);
    
    if (!userLocation) {
      console.log('⚠️ Kullanıcı konumu yok, sıralama yapılmıyor');
      console.log('📏 ============================================\n');
      return filteredLocations;
    }

    const sorted = [...filteredLocations]
      .map((loc) => ({
        ...loc,
        distance: calculateDistance(
          userLocation[0],
          userLocation[1],
          loc.coordinates[0],
          loc.coordinates[1]
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
    
    console.log('\n✅ SIRALAMA TAMAMLANDI');
    console.log('📊 Toplam:', sorted.length, 'yer');
    
    if (sorted.length > 0) {
      console.log('🎯 En yakın 3 yer:');
      sorted.slice(0, 3).forEach((loc, i) => {
        console.log(`   ${i+1}. ${loc.name} (${loc.category}) - ${loc.distance.toFixed(2)} km`);
      });
    }
    console.log('📏 ============================================\n');
    
    return sorted;
  }, [filteredLocations, userLocation]);

  // Gerçek istatistikleri hesapla
  const { trackedLocationIds } = useTrackedStore();
  const realTimeStats = useMemo(() => {
    // Takip edilen mekan sayısı (gerçek veri)
    const trackedLocations = trackedLocationIds.length;

    // Toplam bildirim sayısı (her lokasyonun crowd level'ı bir rapor gibi)
    // Gerçek uygulamada bu bir veritabanından gelecek
    const totalReports = locations.reduce((sum, loc) => {
      // Her lokasyon için kalabalık seviyesine göre rapor sayısı
      const reportCount = 
        loc.currentCrowdLevel === 'very_high' ? 50 :
        loc.currentCrowdLevel === 'high' ? 30 :
        loc.currentCrowdLevel === 'moderate' ? 15 :
        loc.currentCrowdLevel === 'low' ? 5 : 2;
      return sum + reportCount;
    }, 0);

    // Aktif kullanıcı sayısı (favorilere eklenen yerler + çevrimiçi kullanıcılar tahmini)
    const activeUsers = favorites.length * 10 + trackedLocationIds.length * 5 + Math.floor(locations.length * 0.8) + 120;

    // Ortalama kalabalık seviyesi
    const crowdLevels = locations.map(loc => loc.currentCrowdLevel);
    const averageCrowdLevel = crowdLevels.length > 0 
      ? (crowdLevels.filter(l => l === 'high' || l === 'very_high').length > crowdLevels.length / 2 
          ? 'high' : 'moderate') as CrowdLevel
      : 'moderate' as CrowdLevel;

    return {
      trackedLocations,
      totalReports,
      activeUsers,
      averageCrowdLevel
    };
  }, [locations, favorites.length, trackedLocationIds.length]);

  const handleCityChange = (city: 'ankara' | 'istanbul', center: [number, number], zoom: number) => {
    setMapCenter(center);
    setMapZoom(zoom);
  };

  const handleRequestPermission = async () => {
    setShowLocationBanner(false);
    
    // FİLTRELERİ TEMİZLE - Yakındaki yerler gösterilirken filtre olmasın
    useFilterStore.getState().clearFilters();
    console.log('Filtreler temizlendi');
    
    console.log('🔔 Konum izni isteniyor...');
    await requestUserLocation();
    const { userLocation: newLocation } = useLocationStore.getState();
    
    console.log('📍 Konum alındı:', newLocation);
    
    if (newLocation) {
      setMapCenter(newLocation);
      setMapZoom(13);
      
      // GERÇEK YERLER: 100km yarıçapta ara (Ankara çevresi için)
      console.log(`�️ Harita merkezi: ${newLocation[0].toFixed(4)}, ${newLocation[1].toFixed(4)}`);
      const nearby = generateNearbyLocations(newLocation[0], newLocation[1], 100);
      console.log(`📦 ${nearby.length} yer state'e yazılıyor...`);
      setLocations(nearby);
      setNearbyLocationsGenerated(true);
      console.log(`✅ TAMAMLANDI: ${nearby.length} yer gösteriliyor`);
    } else {
      console.error('❌ Konum alınamadı!');
    }
  };

  const handleDismissBanner = () => {
    setShowLocationBanner(false);
    localStorage.setItem('locationBannerDismissed', 'true');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* 🚀 Business Box Banner */}
      <BusinessBoxBanner />

      {/* 🎨 Ultra-Professional Header */}
      <ProHeader
        onAuthClick={() => setShowAuthModal(true)}
        onPremiumClick={() => setShowPremiumModal(true)}
        onProfileClick={() => setShowProfileModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
        onNotificationsClick={() => setShowNotifications(true)}
        onAIClick={() => setShowAIChat(true)}
        onPhotoGalleryClick={() => setShowPhotoGallery(true)}
      />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard stats={realTimeStats} isOpen={showAnalytics} />

      {/* Location Permission Banner */}
      <LocationPermissionBanner
        show={showLocationBanner}
        onRequestPermission={handleRequestPermission}
        onDismiss={handleDismissBanner}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Location Picker - Açılır kapanır konum butonu */}
        <LocationPicker onCityChange={handleCityChange} />

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-3 md:px-4 py-3 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => useFilterStore.getState().setSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-0 transition-colors text-sm md:text-base"
              />
            </div>

            {/* Filter Button */}
            <motion.button
              data-tour="filters"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterPanel(true)}
              className="relative px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-1 md:gap-2 shadow-md"
            >
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline text-sm md:text-base">Filtrele</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </motion.button>

            {/* View Mode Toggle - Mobile Responsive */}
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1 transition-colors">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 md:p-2 rounded-lg transition-all ${
                  viewMode === 'map' ? 'bg-white dark:bg-slate-600 shadow-md' : 'hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
                title="Harita Görünümü"
              >
                <MapIcon className={`w-5 h-5 ${viewMode === 'map' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 md:p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-md' : 'hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
                title="Grid Görünümü"
              >
                <Grid3x3 className={`w-5 h-5 ${viewMode === 'grid' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-sm"
            >
              <span className="text-gray-600 dark:text-gray-300 font-medium">{filteredLocations.length} sonuç</span>
              {selectedCategories.length > 0 && (
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                  {selectedCategories.length} kategori
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'map' ? (
            <div data-tour="map" className="h-full w-full">
              <MapView
                locations={sortedLocationsByDistance}
                center={mapCenter}
                zoom={mapZoom}
                onLocationClick={handleMapMarkerClick}
                userLocation={userLocation}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
              <div className="container mx-auto px-4 py-6">
                {/* Kullanıcı Konumu Banner */}
                {useLocationStore.getState().userLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Konumunuz Tespit Edildi! 🎯</h3>
                        {userAddress && (
                          <p className="text-sm text-white/90 mt-1 font-medium">
                            📍 {userAddress.neighborhood && `${userAddress.neighborhood}, `}
                            {userAddress.district && `${userAddress.district}, `}
                            {userAddress.city || 'Ankara'}
                          </p>
                        )}
                        <p className="text-xs text-white/70 mt-1">
                          Size en yakın <strong>{sortedLocationsByDistance.length} mekan</strong> gösteriliyor
                          {nearbyLocationsGenerated && <span> • Yakınınızda yeni yerler eklendi!</span>}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Business Notifications Panel */}
                <BusinessNotificationsPanel />

                {/* Hava Durumu Widget */}
                {userLocation && (
                  <WeatherWidget
                    lat={userLocation[0]}
                    lon={userLocation[1]}
                    className="mb-6"
                  />
                )}


                {isLoadingPlaces ? (
                  <LoadingGrid count={8} />
                ) : sortedLocationsByDistance.length === 0 ? (
                  <EmptyState
                    type={searchQuery || selectedCategories.length > 0 ? 'no-results' : userLocation ? 'no-location' : 'no-results'}
                    title={
                      searchQuery || selectedCategories.length > 0
                        ? 'Sonuç Bulunamadı'
                        : userLocation
                        ? 'Yakınınızda Yer Bulunamadı'
                        : 'Başlamak için konum seçin'
                    }
                    description={
                      searchQuery || selectedCategories.length > 0
                        ? 'Farklı filtreler veya arama terimleri deneyebilirsiniz'
                        : userLocation
                        ? 'Daha geniş bir alanda arama yapmayı deneyin'
                        : 'Çevrenizdeki yerleri görmek için konumunuzu paylaşın'
                    }
                    action={
                      (searchQuery || selectedCategories.length > 0)
                        ? {
                            label: 'Filtreleri Temizle',
                            onClick: () => {
                              clearFilters();
                              toast.success('✨ Filtreler temizlendi');
                            }
                          }
                        : !userLocation
                        ? {
                            label: 'Konum Ver',
                            onClick: () => {
                              requestUserLocation();
                              toast.success('📍 Konum isteniyor...');
                            }
                          }
                        : undefined
                    }
                  />
                ) : (
                  <LocationGrid
                    locations={sortedLocationsByDistance}
                    userLocation={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null}
                    showDistance={true}
                    showRoute={true}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FilterPanel isOpen={showFilterPanel} onClose={() => setShowFilterPanel(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <AdvancedAnalytics isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
      <GamificationDashboard isOpen={showGamification} onClose={() => setShowGamification(false)} />
      
      {/* Social Modal */}
      {selectedSocialLocation && (
        <SocialModal
          isOpen={showSocialModal}
          onClose={() => {
            setShowSocialModal(false);
            setSelectedSocialLocation(null);
          }}
          locationId={selectedSocialLocation.id}
          locationName={selectedSocialLocation.name}
        />
      )}
      
      {/* Smart Recommendations Modal */}
      <SmartRecommendations
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        locations={filteredLocations}
        userLocation={userLocation || undefined}
        onLocationSelect={handleLocationClick}
      />

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

      {/* Premium Themes Modal */}
      <PremiumThemesModal
        isOpen={showThemesModal}
        onClose={() => setShowThemesModal(false)}
      />

      {/* PWA Settings Modal */}
      <PWASettingsModal
        isOpen={showPWASettings}
        onClose={() => setShowPWASettings(false)}
      />

      {/* Tracked Locations Modal */}
      <TrackedLocationsModal
        isOpen={showTrackedLocations}
        onClose={() => setShowTrackedLocations(false)}
        allLocations={locations}
        onNavigate={(location) => {
          setRouteTargetLocation(location);
          setShowRouteModal(true);
          setShowTrackedLocations(false);
        }}
        userLocation={userLocation}
      />

      {/* Map Control Panel */}
      <AnimatePresence>
        {showMapControls && (
          <MapControlPanel onClose={() => setShowMapControls(false)} />
        )}
      </AnimatePresence>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showReportForm && selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full"
            >
              <button
                onClick={() => {
                  setShowReportForm(false);
                  setSelectedLocation(null);
                }}
                className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-xl hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <ReportForm
                location={selectedLocation}
                onSubmit={handleReportSubmit}
                onCancel={() => {
                  setShowReportForm(false);
                  setSelectedLocation(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Premium Banner - Sadece free kullanıcılara göster */}
      {isAuthenticated && (!user?.membershipTier || user.membershipTier === 'free') && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Premium'a Yükseltin! 👑</h4>
                <p className="text-sm text-white/90 mb-3">
                  Bildirimler, öncelikli destek ve daha fazlası
                </p>
                <button 
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-white text-amber-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-50 transition-colors"
                >
                  Hemen Başla
                </button>
              </div>
              <button 
                className="text-white/70 hover:text-white"
                onClick={() => {
                  const banner = document.querySelector('.fixed.bottom-6.right-6');
                  if (banner) (banner as HTMLElement).style.display = 'none';
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Route Modal */}
      {showRouteModal && routeTargetLocation && userLocation && (
        <RouteModal
          location={routeTargetLocation}
          userLocation={userLocation}
          isOpen={showRouteModal}
          onClose={() => {
            setShowRouteModal(false);
            setRouteTargetLocation(null);
          }}
          onRouteCreated={() => {
            routeCreated();
          }}
        />
      )}

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* AI Chat Bot */}
      <AIChatBot
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />

      {/* Live Crowd Sidebar */}
      <LiveCrowdSidebar
        isOpen={showLiveCrowd}
        onToggle={() => setShowLiveCrowd(!showLiveCrowd)}
        locations={filteredLocations}
      />

      {/* QR Scanner Overlay */}
      <QRScanner />

      {/* Photo Gallery Modal */}
      {showPhotoGallery && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                📸 Fotoğraf Galerim
              </h2>
              <button 
                onClick={() => setShowPhotoGallery(false)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <PhotoGallery />
          </div>
        </div>
      )}

      {/* 🚀 Business Box Promotion - Floating Button */}
      <BusinessBoxFloatingButton />

      {/* 🚀 Business Box Promotion - Modal (First Visit) */}
      <BusinessBoxModal />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            <span className="font-bold">City-V</span> <span className="text-gray-300">2025</span>{' '}
            <span className="text-gray-400">|</span>{' '}
            <span className="font-semibold text-blue-400">SCE INNOVATION</span>{' '}
            <span className="text-gray-300">Her hakkı saklıdır.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
