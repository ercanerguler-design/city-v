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
  const analysisInterval = useRef<NodeJS.Timeout>();
  
  // isOpen değişkenini state'lerden sonra tanımla
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  // 🔥 DEMO: Canlı kalabalık sistemi demonstrasyonu
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 DEMO: Canlı kalabalık sistemi başlatılıyor!');
      
      const demoLocations = [
        { id: 'demo-cafe-1', name: 'Starbucks Tunalı', category: 'cafe', coordinates: [32.85, 39.92] },
        { id: 'demo-restaurant-1', name: 'McDonald\'s Kızılay', category: 'restaurant', coordinates: [32.86, 39.93] },
        { id: 'demo-bank-1', name: 'İş Bankası', category: 'bank', coordinates: [32.84, 39.91] },
        { id: 'demo-market-1', name: 'CarrefourSA', category: 'supermarket', coordinates: [32.87, 39.94] },
        { id: 'demo-hospital-1', name: 'Hacettepe Hastanesi', category: 'hospital', coordinates: [32.88, 39.95] }
      ];
      
      // İlk analizi hemen başlat
      console.log('📊 İlk crowd analizi başlatılıyor...');
      analyzeOpenLocations(demoLocations);
      
      // Her 10 saniyede bir güncelle (demo için hızlı)
      const demoInterval = setInterval(() => {
        console.log('🔄 Periyodik crowd analizi çalışıyor...');
        analyzeOpenLocations(demoLocations);
      }, 10000);
      
      return () => {
        clearInterval(demoInterval);
        console.log('🛑 Demo interval temizlendi');
      };
    }
  }, [isOpen, analyzeOpenLocations]);
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
  }, [isOpen, user?.premium, locations]);

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

  // Premium kontrolü
  if (!isAuthenticated || !user?.premium) {
    return (
      <div className={`fixed top-1/2 -translate-y-1/2 right-0 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-80'}`}>
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="absolute -left-12 top-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg rounded-l-lg p-3 hover:from-yellow-500 hover:to-orange-600 transition-all"
        >
          {isOpen ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <Lock className="w-5 h-5 text-white animate-pulse" />
          )}
        </button>

        {/* Premium Required Content */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-2xl h-96 w-80 rounded-l-xl border-l border-t border-b border-yellow-200 dark:border-yellow-700 flex flex-col">
          <div className="p-6 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Premium Özellik</h3>
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
      </div>
    );
  }

  return (
    <div className={`fixed top-1/2 -translate-y-1/2 right-0 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-80'}`}>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-l-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="bg-white dark:bg-gray-800 shadow-2xl h-96 w-80 rounded-l-xl border-l border-t border-b border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Canlı Kalabalık</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {activeCrowdCount}/{totalLocationsOnMap} mekan canlı • Haritada {totalLocationsOnMap.toLocaleString()} yer
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {crowdData.size === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sistem başlatılıyor</p>
              <p className="text-xs">Veriler yükleniyor...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(crowdData.values()).map((data) => (
                <div
                  key={data.locationId}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate pr-2">
                      {data.name}
                    </h4>
                    {getTrendIcon(data.trend)}
                  </div>
                  
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <Users className={`w-3 h-3 ${getCrowdColor(data.crowdLevel)}`} />
                      <span className={`text-xs font-medium ${getCrowdColor(data.crowdLevel)}`}>
                        {data.crowdCount}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {data.estimatedWaitTime}dk
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {formatLastUpdated(data.lastUpdated)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Otomatik güncelleme
          </div>
        </div>
      </div>
    </div>
  );
}