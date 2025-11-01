'use client';

import { useState, useEffect, useRef } from 'react';
import useCrowdStore from '@/store/crowdStore';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useFavoritesStore } from '@/lib/stores/favoritesStore';
import { isLocationOpen } from '@/lib/workingHours';
import { updateLocationWorkingHours, updateAllLocationsWorkingHours } from '@/lib/googlePlacesAPI';
import { Users, Clock, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, Crown, Lock, Heart, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import BusinessMenuModal from '@/components/Business/BusinessMenuModal';

interface LiveCrowdSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  locations?: any[];
}

export default function LiveCrowdSidebar({ isOpen: externalIsOpen, onToggle, locations: propLocations }: LiveCrowdSidebarProps = {}) {
  const { crowdData, analyzeOpenLocations } = useCrowdStore();
  const { isAuthenticated, user } = useAuthStore();
  const { locations: storeLocations, updateLocation } = useLocationStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  
  // Prop'tan gelen locations'ı öncelikle kullan, yoksa store'dan al
  // Prop'tan gelen locations'ı öncelikle kullan, yoksa store'dan al
  const locations = propLocations || storeLocations;
  
  // State değişkenlerini önce tanımla
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const analysisInterval = useRef<NodeJS.Timeout>();
  
  // isOpen değişkenini state'lerden sonra tanımla
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  // 📱 Mobil detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 📡 Business IoT canlı verilerini yükle
  const [businessIoTData, setBusinessIoTData] = useState<any[]>([]);
  const [iotLoading, setIotLoading] = useState(false);
  
  // 💰 Fiyat listesi modal state
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState('');
  
  const loadBusinessIoTData = async () => {
    try {
      setIotLoading(true);
      console.log('📡 Business IoT verileri yükleniyor...');
      console.log('👤 User durumu:', { 
        isAuthenticated, 
        hasUser: !!user, 
        membershipTier: user?.membershipTier,
        userId: user?.id 
      });
      
      // İlk başta tüm business'ları çek (onlyWithData=false)
      const response = await fetch('/api/business/live-iot-data');
      
      console.log('📡 API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API HTTP hatası:', response.status, errorText);
        return;
      }
      
      const data = await response.json();
      console.log('📦 API Response Data:', data);
      
      if (data.success) {
        setBusinessIoTData(data.businesses || []);
        console.log('✅ Business IoT verileri yüklendi:', data.businesses?.length || 0);
        
        if (data.businesses && data.businesses.length > 0) {
          console.log('📊 İlk business örneği:', {
            name: data.businesses[0].name,
            cameras: data.businesses[0].cameras?.length,
            hasData: data.businesses[0].summary?.hasRealtimeData
          });
        } else {
          console.log('ℹ️ Hiç business IoT verisi bulunamadı');
        }
      } else {
        console.error('❌ API başarısız:', data.error);
        console.error('📋 Detaylar:', data.details);
      }
    } catch (error) {
      console.error('❌ Business IoT veri yükleme hatası:', error);
    } finally {
      setIotLoading(false);
    }
  };

  // Gerçek business locations ile analiz (mock data YOK)
  useEffect(() => {
    if (isOpen && locations && locations.length > 0) {
      console.log('🚀 Canlı kalabalık sistemi başlatılıyor...');
      console.log('📊 Gerçek business sayısı:', locations.length);
      
      // İlk analizi hemen başlat - gerçek business locations ile
      analyzeOpenLocations(locations);
      
      // Business IoT verilerini de yükle
      loadBusinessIoTData();
      
      // Her 30 saniyede bir güncelle (API ile senkronize)
      const interval = setInterval(() => {
        console.log('🔄 Crowd analizi güncelleniyor...');
        analyzeOpenLocations(locations);
        loadBusinessIoTData();
      }, 30000);
      
      return () => {
        clearInterval(interval);
        console.log('🛑 Analiz interval temizlendi');
      };
    }
  }, [isOpen, locations, analyzeOpenLocations]);
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  
  // Calculate total locations on map
  const totalLocationsOnMap = locations ? locations.length : 0;
  const activeCrowdCount = crowdData.size;

  // 🔥 SÜREKLİ ANALİZ SİSTEMİ
  useEffect(() => {
    console.log('🔧 LiveCrowdSidebar useEffect tetiklendi:', { 
      isOpen, 
      locationsLength: locations?.length || 0, 
      hasLocations: !!locations 
    });
    
    if (!isOpen || !locations || locations.length === 0) {
      console.log('⏹️ Analiz durduruluyor:', { isOpen, hasLocations: !!locations, locationsCount: locations?.length || 0 });
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
      return;
    }

    console.log('🚀 LiveCrowdSidebar sürekli analiz sistemi başlatılıyor...');
    console.log('📊 Mevcut lokasyon sayısı:', locations?.length || 0);
    setIsAnalyzing(true);

    // İlk analizi hemen başlat
    performAnalysis();

    // Her 15 saniyede bir analiz yap
    analysisInterval.current = setInterval(() => {
      performAnalysis();
    }, 15000);

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
      setIsAnalyzing(false);
    };
  }, [isOpen, user?.membershipTier, locations]);

  const performAnalysis = async () => {
    console.log('⏳ performAnalysis fonksiyonu çağrıldı');
    if (!locations) {
      console.log('❌ Lokasyon verisi yok');
      return;
    }

    try {
      setAnalysisCount(prev => prev + 1);
      const now = new Date();
      
      console.log('📍 Toplam lokasyon sayısı:', locations.length);
      
      // Sadece açık olan lokasyonları filtrele
      const openLocations = locations.filter(location => {
        const isCurrentlyOpen = isLocationOpen(location);
        return isCurrentlyOpen;
      });

      console.log(`🔍 Analiz #${analysisCount + 1}: ${openLocations.length}/${locations.length} mekan açık`);

      // Açık lokasyonları analiz et
      if (openLocations.length > 0) {
        analyzeOpenLocations(openLocations);
      }

      // Her 5. analizde Google API'den çalışma saatlerini güncelle (75 saniyede bir)
      if ((analysisCount + 1) % 5 === 0) {
        console.log('🕒 Google API çalışma saatleri güncelleniyor...');
        try {
          const updatedLocations = await updateAllLocationsWorkingHours(locations.slice(0, 5)); // İlk 5'ini test et
          // updatedLocations.forEach(loc => updateLocation(loc));
        } catch (error) {
          console.error('❌ Çalışma saatleri güncelleme hatası:', error);
        }
      }

    } catch (error) {
      console.error('❌ Sürekli analiz hatası:', error);
    }
  };

  const formatLastUpdated = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
    return `${Math.floor(diff / 3600)}sa`;
  };

  const getCrowdColor = (level: string) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[level as keyof typeof colors] || 'text-gray-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-3 h-3 text-green-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  // Premium kontrolü - membershipTier kontrolü
  const isPremiumUser = user?.membershipTier && user.membershipTier !== 'free';
  
  if (!isAuthenticated || !isPremiumUser) {
    return (
      <>
        {/* 📱 Mobile Toggle Button */}
        <button
          onClick={handleToggle}
          className={`fixed z-50 transition-all duration-300 ${
            isMobile 
              ? 'bottom-20 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white p-4 rounded-full shadow-xl' 
              : 'top-1/2 -translate-y-1/2 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg rounded-l-lg p-3 hover:from-yellow-500 hover:to-orange-600'
          }`}
        >
          {isMobile ? (
            <Crown className="w-6 h-6" />
          ) : isOpen ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <Lock className="w-5 h-5 text-white animate-pulse" />
          )}
        </button>

        {/* Premium Required Panel */}
        <div className={`fixed z-40 transition-all duration-300 ${
          isMobile 
            ? `bottom-0 left-0 right-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-t-2xl shadow-2xl transform ${
                isOpen ? 'translate-y-0' : 'translate-y-full'
              }`
            : `top-1/2 -translate-y-1/2 right-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-2xl h-96 w-80 rounded-l-xl transform ${
                isOpen ? 'translate-x-0' : 'translate-x-80'
              }`
        } border-yellow-200 dark:border-yellow-700`}>
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-yellow-200 dark:border-yellow-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Premium Özellik</h3>
              <button
                onClick={handleToggle}
                className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded-lg"
              >
                ✕
              </button>
            </div>
          )}

          {/* Content */}
          <div className={`${isMobile ? 'p-6' : 'p-6'} text-center flex-1 flex flex-col items-center justify-center`}>
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold text-gray-800 dark:text-gray-200 mb-2`}>Premium Özellik</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Canlı kalabalık takibi premium üyelerimize özeldir.
            </p>
            {!isAuthenticated ? (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Lütfen önce giriş yapın.
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Premium'a yükseltin ve anlık takip keyfini yaşayın!
              </p>
            )}
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobile && isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={handleToggle}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* 📱 Mobile Toggle Button */}
      <button
        onClick={handleToggle}
        className={`fixed z-50 transition-all duration-300 ${
          isMobile 
            ? 'bottom-20 right-4 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl' 
            : 'top-1/2 -translate-y-1/2 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-l-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        {isMobile ? (
          <span className="text-xl">📊</span>
        ) : isOpen ? (
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Sidebar/Bottom Sheet */}
      <div className={`fixed z-40 transition-all duration-300 ${
        isMobile 
          ? `bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl transform max-h-[70vh] ${
              isOpen ? 'translate-y-0' : 'translate-y-full'
            }`
          : `top-1/2 -translate-y-1/2 right-0 bg-white dark:bg-gray-800 shadow-2xl h-96 w-80 rounded-l-xl transform ${
              isOpen ? 'translate-x-0' : 'translate-x-80'
            }`
      } border-gray-200 dark:border-gray-700`}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex flex-col">
            {/* Pull Indicator */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📊 Canlı Kalabalık</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeCrowdCount} konum aktif takipte
                </p>
              </div>
              <button
                onClick={handleToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className={`${isMobile ? 'flex-1 overflow-y-auto pb-safe' : 'h-full'} flex flex-col`}>
        {/* Header */}
        <div className={`${isMobile ? 'px-4 py-3' : 'p-4'} border-b border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Canlı Kalabalık</h3>
            {activeCrowdCount > 0 && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {businessIoTData.length > 0 ? (
              <>
                {businessIoTData.length} işletme canlı IoT ile izleniyor
              </>
            ) : activeCrowdCount > 0 ? (
              <>
                {activeCrowdCount} konum aktif takipte
              </>
            ) : (
              <>
                İşletmeler IoT cihazı bağladığında burada görünecek
              </>
            )}
          </p>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-2'}`}>
          {/* Business IoT Verileri (Herkese Açık) */}
          {businessIoTData.length > 0 && (
            <>
              <div className="mb-3 px-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    IoT Kameralar ({businessIoTData.length})
                  </h4>
                </div>
              </div>
              
              <div className={`${isMobile ? 'space-y-3' : 'space-y-2'} mb-4`}>
                {businessIoTData.map((business) => (
                  <div
                    key={business.id}
                    className={`${isMobile ? 'p-4' : 'p-3'} bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all`}
                  >
                    <div className={`flex justify-between items-start ${isMobile ? 'mb-3' : 'mb-2'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${isMobile ? 'text-base' : 'text-sm'} text-gray-900 dark:text-white`}>
                            {business.name}
                          </h4>
                          {/* Açık/Kapalı Badge */}
                          {(() => {
                            const businessLocation = {
                              workingHours: business.workingHours || null,
                              category: business.type
                            };
                            const { isOpen: isBusinessOpen } = isLocationOpen(businessLocation);
                            return (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isBusinessOpen 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {isBusinessOpen ? '🟢 Açık' : '🔴 Kapalı'}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {business.district}, {business.city}
                        </p>
                      </div>
                      <div className="ml-2 flex items-center gap-2">
                        {/* Favori Butonu */}
                        <button
                          onClick={async () => {
                            const businessLocationId = `business-${business.id}`;
                            const wasFavorite = isFavorite(businessLocationId);
                            
                            // Toggle with userId if logged in
                            await toggleFavorite(businessLocationId, user?.id);
                            
                            // Track for business dashboard
                            try {
                              const businessUser = localStorage.getItem('business_user');
                              if (businessUser) {
                                const user = JSON.parse(businessUser);
                                await fetch('/api/business/favorites', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    businessId: user.id,
                                    location: {
                                      id: businessLocationId,
                                      name: business.name,
                                      category: business.type || 'business',
                                      address: `${business.district}, ${business.city}`,
                                      coordinates: [business.latitude, business.longitude]
                                    },
                                    action: wasFavorite ? 'remove' : 'add',
                                    source: 'map'
                                  })
                                });
                              }
                            } catch (error) {
                              console.error('❌ Failed to track business favorite:', error);
                            }
                            
                            if (!wasFavorite) {
                              toast.success(`❤️ ${business.name} favorilere eklendi!`, {
                                icon: '⭐',
                                style: { borderRadius: '12px', background: '#10b981', color: '#fff' }
                              });
                            } else {
                              toast(`💔 ${business.name} favorilerden çıkarıldı`, { icon: '➖' });
                            }
                          }}
                          className={cn(
                            'p-1.5 rounded-full transition-all',
                            isFavorite(`business-${business.id}`)
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-red-50 hover:text-red-400'
                          )}
                        >
                          <Heart className={cn('w-4 h-4', isFavorite(`business-${business.id}`) && 'fill-current')} />
                        </button>
                        
                        {/* Yoğunluk Badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          business.summary.crowdLevel === 'high' || business.summary.crowdLevel === 'overcrowded' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : business.summary.crowdLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {business.summary.crowdLevel === 'high' ? '🔴 Yoğun' :
                           business.summary.crowdLevel === 'medium' ? '🟡 Orta' :
                           business.summary.crowdLevel === 'overcrowded' ? '🔴 Çok Yoğun' : '🟢 Sakin'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`grid grid-cols-3 gap-2 ${isMobile ? 'mb-3' : 'mb-2'}`}>
                      <div className="text-center">
                        <div className={`${isMobile ? 'text-lg' : 'text-base'} font-bold text-gray-900 dark:text-white`}>
                          {business.summary.totalPeople}
                        </div>
                        <div className="text-xs text-gray-500">Kişi</div>
                      </div>
                      <div className="text-center">
                        <div className={`${isMobile ? 'text-lg' : 'text-base'} font-bold text-blue-600 dark:text-blue-400`}>
                          {business.summary.activeCameras}
                        </div>
                        <div className="text-xs text-gray-500">Kamera</div>
                      </div>
                      <div className="text-center">
                        <div className={`${isMobile ? 'text-lg' : 'text-base'} font-bold text-purple-600 dark:text-purple-400`}>
                          %{business.summary.avgOccupancy}
                        </div>
                        <div className="text-xs text-gray-500">Doluluk</div>
                      </div>
                    </div>
                    
                    {/* Fiyatları Gör Butonu */}
                    <button
                      onClick={() => {
                        setSelectedBusinessId(business.id);
                        setSelectedBusinessName(business.name);
                        setMenuModalOpen(true);
                      }}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Fiyatları Gör</span>
                    </button>
                    
                    {business.summary.lastUpdate && (
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(business.summary.lastUpdate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs">
                          ● Canlı
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Normal Crowd Analysis Verileri */}
          {businessIoTData.length === 0 && crowdData.size === 0 ? (
            <div className="text-center text-gray-500 py-8 px-4">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">Henüz Canlı Veri Yok</p>
              <p className="text-xs leading-relaxed">
                İşletmeler IoT kamera sistemi kurduktan sonra burada canlı kalabalık verileri görünecek
              </p>
            </div>
          ) : crowdData.size > 0 && (
            <div className={`${isMobile ? 'space-y-3' : 'space-y-2'}`}>
              {Array.from(crowdData.values()).map((data) => (
                <div
                  key={data.locationId}
                  className={`${isMobile ? 'p-4' : 'p-3'} bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600`}
                >
                  <div className={`flex justify-between items-start ${isMobile ? 'mb-3' : 'mb-2'}`}>
                    <h4 className={`font-medium ${isMobile ? 'text-base' : 'text-sm'} text-gray-900 dark:text-white truncate pr-2`}>
                      {data.name}
                    </h4>
                    <div className={`${isMobile ? 'ml-2' : ''}`}>
                      {getTrendIcon(data.trend)}
                    </div>
                  </div>
                  
                  <div className={`flex justify-between items-center ${isMobile ? 'mb-2' : 'mb-1'}`}>
                    <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-1'}`}>
                      <Users className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} ${getCrowdColor(data.crowdLevel)}`} />
                      <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium ${getCrowdColor(data.crowdLevel)}`}>
                        {data.crowdCount}
                      </span>
                      {isMobile && (
                        <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-600 dark:text-gray-400`}>
                          kişi
                        </span>
                      )}
                    </div>
                    
                    <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-1'} ${isMobile ? 'text-sm' : 'text-xs'} text-gray-500`}>
                      <Clock className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />
                      <span>{data.estimatedWaitTime}dk</span>
                    </div>
                  </div>
                  
                  <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-400 flex items-center justify-between`}>
                    <span>{formatLastUpdated(data.lastUpdated)}</span>
                    {isMobile && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                        Canlı
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`${isMobile ? 'p-4' : 'p-3'} border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800`}>
          <div className={`flex items-center justify-center gap-2 ${isMobile ? 'text-sm' : 'text-xs'} text-gray-500`}>
            <div className={`${isMobile ? 'w-2 h-2' : 'w-1.5 h-1.5'} bg-green-500 rounded-full animate-pulse`}></div>
            <span>Otomatik güncelleme aktif</span>
            {isMobile && (businessIoTData.length > 0 || activeCrowdCount > 0) && (
              <div className="ml-2 flex items-center gap-1">
                <span className="text-xs">•</span>
                <span className="text-xs">
                  {businessIoTData.length > 0 ? `${businessIoTData.length} IoT` : `${activeCrowdCount} konum`}
                </span>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={handleToggle}
        />
      )}

      {/* Fiyat Listesi Modal */}
      {menuModalOpen && selectedBusinessId && (
        <BusinessMenuModal
          isOpen={menuModalOpen}
          onClose={() => {
            setMenuModalOpen(false);
            setSelectedBusinessId(null);
            setSelectedBusinessName('');
          }}
          businessId={selectedBusinessId}
          businessName={selectedBusinessName}
        />
      )}
    </>
  );
}