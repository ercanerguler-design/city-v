'use client';

import { useState, useEffect, useRef } from 'react';
import useCrowdStore from '@/store/crowdStore';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { isLocationOpen } from '@/lib/workingHours';
import { updateLocationWorkingHours, updateAllLocationsWorkingHours } from '@/lib/googlePlacesAPI';
import { Users, Clock, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, Crown, Lock } from 'lucide-react';

interface LiveCrowdSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  locations?: any[];
}

export default function LiveCrowdSidebar({ isOpen: externalIsOpen, onToggle, locations: propLocations }: LiveCrowdSidebarProps = {}) {
  const { crowdData, analyzeOpenLocations } = useCrowdStore();
  const { isAuthenticated, user } = useAuthStore();
  const { locations: storeLocations, updateLocation } = useLocationStore();
  
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

  // Gerçek business locations ile analiz (mock data YOK)
  useEffect(() => {
    if (isOpen && locations && locations.length > 0) {
      console.log('🚀 Canlı kalabalık sistemi başlatılıyor...');
      console.log('📊 Gerçek business sayısı:', locations.length);
      
      // İlk analizi hemen başlat - gerçek business locations ile
      analyzeOpenLocations(locations);
      
      // Her 30 saniyede bir güncelle (API ile senkronize)
      const interval = setInterval(() => {
        console.log('🔄 Crowd analizi güncelleniyor...');
        analyzeOpenLocations(locations);
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
            {activeCrowdCount > 0 ? (
              <>
                {activeCrowdCount} işletme canlı IoT ile izleniyor
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
          {crowdData.size === 0 ? (
            <div className="text-center text-gray-500 py-8 px-4">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">Henüz Canlı Veri Yok</p>
              <p className="text-xs leading-relaxed">
                İşletmeler IoT kamera sistemi kurduktan sonra burada canlı kalabalık verileri görünecek
              </p>
            </div>
          ) : (
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
            {isMobile && (
              <div className="ml-2 flex items-center gap-1">
                <span className="text-xs">•</span>
                <span className="text-xs">{activeCrowdCount} konum</span>
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
    </>
  );
}