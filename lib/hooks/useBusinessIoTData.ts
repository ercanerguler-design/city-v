import { useState, useEffect } from 'react';

interface BusinessIoTData {
  id: number;
  name: string;
  business_profile_id: number;
  location_id: string;
  cameras?: any[];
  summary?: {
    currentPeople: number;
    averageOccupancy: number;
    crowdLevel: string;
    hasRealtimeData: boolean;
  };
}

interface UseBusinessIoTDataResult {
  businessIoTData: BusinessIoTData[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useBusinessIoTData(enabled = true): UseBusinessIoTDataResult {
  const [businessIoTData, setBusinessIoTData] = useState<BusinessIoTData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBusinessIoTData = async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      
      // Business IoT verileri API
      const response = await fetch('/api/business/iot/analytics-summary');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Business IoT API HTTP hatası:', response.status, errorText);
        return;
      }
      
      const data = await response.json();
      console.log('📦 Business IoT Data:', data);
      
      if (data.success && data.businesses) {
        setBusinessIoTData(data.businesses);
        console.log('✅ Business IoT verileri yüklendi:', data.businesses.length);
      } else {
        console.error('❌ Business IoT API başarısız:', data.error);
      }
    } catch (error) {
      console.error('❌ Business IoT veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      // İlk yükleme
      loadBusinessIoTData();
      
      // Her 30 saniyede bir güncelle
      const interval = setInterval(loadBusinessIoTData, 30000);
      
      return () => clearInterval(interval);
    }
  }, [enabled]);

  return {
    businessIoTData,
    loading,
    refresh: loadBusinessIoTData
  };
}