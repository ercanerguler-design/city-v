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

  // GERÇEK IoT VERİLERİ İLE KALABALIK ANALİZİ (MOCK DATA YOK)
  analyzeOpenLocations: (openLocations: any[]) => {
    console.log(`🔍 ${openLocations.length} işletme için gerçek IoT verileri işleniyor...`);
    
    const analyzedData: CrowdData[] = openLocations
      .filter(location => location.isLive) // Sadece canlı IoT verisi olan işletmeler
      .map(location => {
        // API'den gelen gerçek crowd data
        const currentPeople = location.currentPeople || 0;
        
        // API'den gelen crowdLevel'ı bizim sistemimize map et
        let crowdLevel: CrowdData['crowdLevel'] = 'low';
        const apiCrowdLevel = location.crowdLevel?.toLowerCase() || 'empty';
        
        if (apiCrowdLevel === 'very_crowded') crowdLevel = 'very_high';
        else if (apiCrowdLevel === 'crowded') crowdLevel = 'high';
        else if (apiCrowdLevel === 'moderate') crowdLevel = 'medium';
        else crowdLevel = 'low';
        
        // Bekleme süresi tahmini (gerçek kalabalığa göre)
        let estimatedWaitTime = 0;
        if (currentPeople > 20) estimatedWaitTime = 15;
        else if (currentPeople > 10) estimatedWaitTime = 8;
        else if (currentPeople > 5) estimatedWaitTime = 3;
        
        // Trend (gelecekte önceki veri ile karşılaştırma yapılabilir)
        const trend: CrowdData['trend'] = 'stable';
        
        return {
          locationId: location.id,
          crowdLevel,
          crowdCount: currentPeople,
          lastUpdated: Date.now(),
          coordinates: location.coordinates,
          name: location.name,
          category: location.category,
          trend,
          estimatedWaitTime
        };
      });
    
    // Gerçek verileri store'a kaydet
    get().updateCrowdData(analyzedData);
    console.log(`✅ ${analyzedData.length} işletme canlı kalabalık verisi güncellendi (IoT)`);
    
    // Canlı veri olmayan işletme sayısını logla
    const noIoTCount = openLocations.length - analyzedData.length;
    if (noIoTCount > 0) {
      console.log(`ℹ️  ${noIoTCount} işletmenin henüz canlı IoT verisi yok`);
    }
  }
}));

export default useCrowdStore;