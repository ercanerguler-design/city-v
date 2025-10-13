'use client';

import { create } from 'zustand';
import useSocketStore from './socketStore';

export interface CrowdData {
  locationId: string;
  crowdLevel: 'low' | 'medium' | 'high' | 'very_high';
  crowdCount: number;
  lastUpdated: number;
  coordinates: [number, number];
  name: string;
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  estimatedWaitTime?: number;
}

interface CrowdStore {
  crowdData: Map<string, CrowdData>;
  isSubscribed: boolean;
  lastUpdateTime: number;
  updateInterval: number;
  
  // Actions
  subscribeToCrowdUpdates: () => void;
  unsubscribeFromCrowdUpdates: () => void;
  updateCrowdData: (data: CrowdData[]) => void;
  getCrowdDataForLocation: (locationId: string) => CrowdData | null;
  getAllCrowdData: () => CrowdData[];
  getCrowdDataByLevel: (level: CrowdData['crowdLevel']) => CrowdData[];
  analyzeOpenLocations: (locations: any[]) => void;
  
  // Utilities
  getCrowdLevelColor: (level: CrowdData['crowdLevel']) => string;
  getCrowdLevelText: (level: CrowdData['crowdLevel']) => string;
  getCrowdLevelIcon: (level: CrowdData['crowdLevel']) => string;
}

const useCrowdStore = create<CrowdStore>((set, get) => ({
  crowdData: new Map(),
  isSubscribed: false,
  lastUpdateTime: 0,
  updateInterval: 30000, // 30 seconds

  subscribeToCrowdUpdates: () => {
    const { isSubscribed } = get();
    if (isSubscribed) return;

    const socketStore = useSocketStore.getState();
    
    // Subscribe to crowd updates
    socketStore.subscribe('crowd-update', (data: CrowdData[]) => {
      get().updateCrowdData(data);
    });

    // Subscribe to single location crowd update
    socketStore.subscribe('location-crowd-update', (data: CrowdData) => {
      get().updateCrowdData([data]);
    });

    // Request initial crowd data
    socketStore.emit('request-crowd-data');

    set({ isSubscribed: true });
    console.log('📊 Subscribed to crowd updates');
  },

  unsubscribeFromCrowdUpdates: () => {
    const { isSubscribed } = get();
    if (!isSubscribed) return;

    const socketStore = useSocketStore.getState();
    socketStore.unsubscribe('crowd-update');
    socketStore.unsubscribe('location-crowd-update');

    set({ isSubscribed: false });
    console.log('📊 Unsubscribed from crowd updates');
  },

  updateCrowdData: (data: CrowdData[]) => {
    const { crowdData } = get();
    const newCrowdData = new Map(crowdData);
    
    data.forEach(item => {
      newCrowdData.set(item.locationId, {
        ...item,
        lastUpdated: Date.now()
      });
    });

    set({ 
      crowdData: newCrowdData,
      lastUpdateTime: Date.now()
    });
  },

  getCrowdDataForLocation: (locationId: string) => {
    return get().crowdData.get(locationId) || null;
  },

  getAllCrowdData: () => {
    return Array.from(get().crowdData.values());
  },

  getCrowdDataByLevel: (level: CrowdData['crowdLevel']) => {
    return get().getAllCrowdData().filter(data => data.crowdLevel === level);
  },

  getCrowdLevelColor: (level: CrowdData['crowdLevel']) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      very_high: 'text-red-500'
    };
    return colors[level] || 'text-gray-500';
  },

  getCrowdLevelText: (level: CrowdData['crowdLevel']) => {
    const texts = {
      low: 'Az Yoğun',
      medium: 'Orta Yoğun',
      high: 'Yoğun',
      very_high: 'Çok Yoğun'
    };
    return texts[level] || 'Bilinmiyor';
  },

  getCrowdLevelIcon: (level: CrowdData['crowdLevel']) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      very_high: '🔴'
    };
    return icons[level] || '⚪';
  },

  // 🔥 AÇIK LOKASYONLARI SÜREKLI ANALİZ ETME METODu
  analyzeOpenLocations: (openLocations: any[]) => {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const dayOfWeek = currentTime.getDay(); // 0=Pazar, 1=Pazartesi
    
    console.log(`🔍 ${openLocations.length} açık lokasyon analiz ediliyor... (Saat: ${hour}:${minute})`);
    
    const analyzedData: CrowdData[] = openLocations.map(location => {
      let crowdLevel: CrowdData['crowdLevel'] = 'low';
      let crowdCount = 0;
      let estimatedWaitTime = 0;
      let trend: CrowdData['trend'] = 'stable';
      
      const category = location.category?.toLowerCase() || '';
      
      // KATEGORİ VE SAAT BAZLI GERÇEKÇİ KALABALIK ANALİZİ
      if (category.includes('cafe') || category.includes('coffee')) {
        // Kafe saatleri: Sabah 7-10, öğle 12-14, akşam 17-19 yoğun
        if ((hour >= 7 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 19)) {
          crowdLevel = 'high';
          crowdCount = Math.floor(Math.random() * 40) + 25; // 25-65 kişi
          estimatedWaitTime = Math.floor(Math.random() * 10) + 5; // 5-15dk
        } else if (hour >= 10 && hour <= 12) {
          crowdLevel = 'medium';
          crowdCount = Math.floor(Math.random() * 20) + 10;
          estimatedWaitTime = Math.floor(Math.random() * 5) + 2;
        } else {
          crowdLevel = 'low';
          crowdCount = Math.floor(Math.random() * 15) + 5;
          estimatedWaitTime = 0;
        }
      }
      
      else if (category.includes('restaurant') || category.includes('food')) {
        // Restoran saatleri: Öğle 11:30-14:30, akşam 19-22 çok yoğun
        if ((hour >= 11 && hour <= 14) || (hour >= 19 && hour <= 22)) {
          crowdLevel = 'very_high';
          crowdCount = Math.floor(Math.random() * 60) + 40; // 40-100 kişi
          estimatedWaitTime = Math.floor(Math.random() * 20) + 10; // 10-30dk
        } else if ((hour >= 15 && hour <= 18) || (hour >= 22 && hour <= 23)) {
          crowdLevel = 'medium';
          crowdCount = Math.floor(Math.random() * 30) + 15;
          estimatedWaitTime = Math.floor(Math.random() * 8) + 3;
        } else {
          crowdLevel = 'low';
          crowdCount = Math.floor(Math.random() * 20) + 5;
          estimatedWaitTime = Math.floor(Math.random() * 5);
        }
      }
      
      else if (category.includes('bank') || category.includes('atm')) {
        // Banka: Hafta içi yoğun, öğle saatleri çok yoğun
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Hafta içi
          if (hour >= 12 && hour <= 14) {
            crowdLevel = 'high';
            crowdCount = Math.floor(Math.random() * 25) + 15;
            estimatedWaitTime = Math.floor(Math.random() * 15) + 5;
          } else if ((hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 17)) {
            crowdLevel = 'medium';
            crowdCount = Math.floor(Math.random() * 15) + 8;
            estimatedWaitTime = Math.floor(Math.random() * 8) + 2;
          }
        } else {
          crowdLevel = 'low';
          crowdCount = Math.floor(Math.random() * 5) + 2;
        }
      }
      
      else if (category.includes('market') || category.includes('shopping')) {
        // Market: Akşam 17-20, hafta sonu yoğun
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (isWeekend || (hour >= 17 && hour <= 20)) {
          crowdLevel = 'high';
          crowdCount = Math.floor(Math.random() * 50) + 30;
          estimatedWaitTime = Math.floor(Math.random() * 12) + 3;
        } else if (hour >= 10 && hour <= 17) {
          crowdLevel = 'medium';
          crowdCount = Math.floor(Math.random() * 25) + 15;
          estimatedWaitTime = Math.floor(Math.random() * 6) + 1;
        } else {
          crowdLevel = 'low';
          crowdCount = Math.floor(Math.random() * 15) + 5;
        }
      }
      
      else {
        // Diğer yerler için genel mantık
        if (hour >= 12 && hour <= 14) { // Öğle yoğunluğu
          crowdLevel = Math.random() > 0.5 ? 'medium' : 'high';
          crowdCount = Math.floor(Math.random() * 30) + 10;
        } else if (hour >= 17 && hour <= 19) { // Akşam yoğunluğu
          crowdLevel = Math.random() > 0.3 ? 'high' : 'medium';
          crowdCount = Math.floor(Math.random() * 40) + 15;
        } else {
          crowdLevel = 'low';
          crowdCount = Math.floor(Math.random() * 20) + 5;
        }
        estimatedWaitTime = crowdLevel === 'high' ? Math.floor(Math.random() * 8) + 2 : 
                           crowdLevel === 'medium' ? Math.floor(Math.random() * 5) + 1 : 0;
      }
      
      // Trend hesaplama (rastgele ama mantıklı)
      const trendRandom = Math.random();
      if (hour >= 6 && hour <= 12) { // Sabah artış trendi
        trend = trendRandom > 0.3 ? 'increasing' : 'stable';
      } else if (hour >= 18 && hour <= 22) { // Akşam artış trendi
        trend = trendRandom > 0.4 ? 'increasing' : 'stable';
      } else if (hour >= 22 || hour <= 6) { // Gece azalış trendi
        trend = trendRandom > 0.6 ? 'decreasing' : 'stable';
      } else {
        trend = trendRandom > 0.6 ? 'increasing' : trendRandom > 0.3 ? 'stable' : 'decreasing';
      }
      
      return {
        locationId: location.id,
        crowdLevel,
        crowdCount,
        lastUpdated: Date.now(),
        coordinates: location.coordinates,
        name: location.name,
        category: location.category,
        trend,
        estimatedWaitTime
      };
    });
    
    // Güncellenmiş verileri store'a kaydet
    get().updateCrowdData(analyzedData);
    console.log(`✅ ${analyzedData.length} lokasyon crowd analizi tamamlandı`);
  }
}));

export default useCrowdStore;