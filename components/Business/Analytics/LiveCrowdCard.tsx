'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface LiveCrowdCardProps {
  businessId: string;
}

interface CrowdData {
  peopleCount: number;
  crowdLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  density: number;
  queueLength: number;
  entryCount: number;
  exitCount: number;
}

const crowdLevelConfig = {
  very_low: { color: 'bg-green-500', label: 'Çok Rahat', textColor: 'text-green-400' },
  low: { color: 'bg-blue-500', label: 'Rahat', textColor: 'text-blue-400' },
  medium: { color: 'bg-yellow-500', label: 'Normal', textColor: 'text-yellow-400' },
  high: { color: 'bg-orange-500', label: 'Kalabalık', textColor: 'text-orange-400' },
  very_high: { color: 'bg-red-500', label: 'Çok Kalabalık', textColor: 'text-red-400' }
};

export default function LiveCrowdCard({ businessId }: LiveCrowdCardProps) {
  const [crowdData, setCrowdData] = useState<CrowdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchCrowdData();
    // 🔥 REAL-TIME: 5 saniyede bir güncelle (IoT kamera verileri)
    const interval = setInterval(fetchCrowdData, 5000);
    return () => clearInterval(interval);
  }, [businessId]);

  const fetchCrowdData = async () => {
    try {
      console.log('🔄 REAL-TIME UPDATE - Fetching crowd data for business:', businessId);
      
      // 🔄 REAL-TIME: Camera analytics öncelikli, error handling ile
      const cameraResponse = await fetch(`/api/business/cameras/analytics/summary?businessUserId=${businessId}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });

      let cameraData = null;
      let iotData = null;

      // Camera data - primary source
      if (cameraResponse.ok) {
        cameraData = await cameraResponse.json();
        console.log('📹 Camera analytics received:', cameraData.success ? 'SUCCESS' : 'FAILED');
      } else {
        console.warn('⚠️ Camera analytics failed, status:', cameraResponse.status);
      }

      // Fallback to IoT data if camera fails
      if (!cameraData?.success) {
        try {
          const iotResponse = await fetch(`/api/business/crowd-analytics?businessId=${businessId}&timeRange=1hour`);
          if (iotResponse.ok) {
            iotData = await iotResponse.json();
            console.log('📊 IoT fallback data:', iotData.success ? 'SUCCESS' : 'FAILED');
          }
        } catch (iotError) {
          console.warn('⚠️ IoT fallback also failed:', iotError);
        }
      }

      // Process data with better error handling
      let peopleCount = 0;
      let entryCount = 0;
      let exitCount = 0;
      let density = 0;
      let crowdLevel: any = 'low';

      if (cameraData?.success && cameraData.summary) {
        // Primary: Camera analytics data
        const summary = cameraData.summary;
        peopleCount = Number(summary.totalPeople) || 0;
        entryCount = Number(summary.totalEntries) || 0;
        exitCount = Number(summary.totalExits) || 0;
        density = Number(summary.avgOccupancy) || 0;
        crowdLevel = summary.crowdLevel || 'low';
        
        console.log('✅ Using camera data:', { peopleCount, entryCount, exitCount, density, crowdLevel });
        
        // Density'ye göre more precise level
        if (density > 20) crowdLevel = 'very_high';
        else if (density > 15) crowdLevel = 'high';
        else if (density > 8) crowdLevel = 'medium';
        else if (density > 3) crowdLevel = 'low';
        else crowdLevel = 'very_low';
        
      } else if (iotData?.success && iotData.currentStatus) {
        // Fallback: IoT data
        const status = iotData.currentStatus;
        peopleCount = Number(status.peopleCount) || 0;
        crowdLevel = status.crowdLevel || 'low';
        density = Number(status.density) || 0;
        entryCount = Number(iotData.entryExit?.totalEntries) || 0;
        exitCount = Number(iotData.entryExit?.totalExits) || 0;
        
        console.log('✅ Using IoT fallback:', { peopleCount, crowdLevel, density });
      } else {
        console.warn('⚠️ No valid data from any source, using defaults');
      }

      const newData = {
        peopleCount,
        crowdLevel,
        density,
        queueLength: Math.max(0, peopleCount - Math.floor(density / 2)), // Estimated queue
        entryCount,
        exitCount
      };

      // Determine trend
      if (crowdData) {
        if (newData.peopleCount > crowdData.peopleCount) setTrend('up');
        else if (newData.peopleCount < crowdData.peopleCount) setTrend('down');
        else setTrend('stable');
      }

      setCrowdData(newData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch crowd data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="h-20 bg-gray-800 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-800 rounded"></div>
            <div className="h-16 bg-gray-800 rounded"></div>
            <div className="h-16 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!crowdData) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <p className="text-gray-400 text-center">Veri yüklenemedi</p>
      </div>
    );
  }

  const levelConfig = crowdLevelConfig[crowdData.crowdLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${levelConfig.color} rounded-xl bg-opacity-20`}>
            <Users className={`w-6 h-6 ${levelConfig.textColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Anlık Kalabalık</h3>
            <p className="text-sm text-gray-400">Canlı veri akışı</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-semibold">🔴 CANLI</span>
          </div>
          <span className="text-[10px] text-gray-500">
            Son: {lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Main Count */}
      <div className="mb-6">
        <div className="flex items-end gap-3">
          <motion.div
            key={crowdData.peopleCount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold text-white"
          >
            {crowdData.peopleCount}
          </motion.div>
          <div className="flex items-center gap-1 mb-2">
            {trend === 'up' && <TrendingUp className="w-5 h-5 text-red-400" />}
            {trend === 'down' && <TrendingDown className="w-5 h-5 text-green-400" />}
            <span className={`text-sm font-medium ${levelConfig.textColor}`}>
              {levelConfig.label}
            </span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-1">Mevcut insan sayısı</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Yoğunluk</p>
          <p className="text-white text-lg font-semibold">{crowdData.density.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Kuyruk</p>
          <p className="text-white text-lg font-semibold">{crowdData.queueLength}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">Net Değişim</p>
          <p className={`text-lg font-semibold ${
            crowdData.entryCount - crowdData.exitCount > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {crowdData.entryCount - crowdData.exitCount > 0 ? '+' : ''}
            {crowdData.entryCount - crowdData.exitCount}
          </p>
        </div>
      </div>

      {/* Entry/Exit */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-400">Giriş:</span>
          <span className="text-sm font-semibold text-white">{crowdData.entryCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-gray-400">Çıkış:</span>
          <span className="text-sm font-semibold text-white">{crowdData.exitCount}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(crowdData.density, 100)}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${levelConfig.color}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
