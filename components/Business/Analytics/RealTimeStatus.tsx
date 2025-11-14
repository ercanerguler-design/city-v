'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

interface RealTimeStatusProps {
  businessId: string;
}

interface RealTimeData {
  currentOccupancy: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  activeCameras: number;
  lastUpdate: Date;
}

export default function RealTimeStatus({ businessId }: RealTimeStatusProps) {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRealTimeData();
    
    // 5 saniyede bir güncelleme
    const interval = setInterval(() => {
      fetchRealTimeData();
    }, 5000);

    return () => clearInterval(interval);
  }, [businessId]);

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch(`/api/business/analytics?businessId=${businessId}`);
      const result = await response.json();

      if (result.success) {
        // Trend hesapla (basitleştirilmiş)
        const currentOcc = result.averageOccupancy || 0;
        const growth = result.visitorGrowth || 0;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (growth > 5) trend = 'up';
        else if (growth < -5) trend = 'down';

        setData({
          currentOccupancy: currentOcc,
          trend,
          trendPercentage: Math.abs(growth),
          activeCameras: result.activeCameras || 0,
          lastUpdate: new Date()
        });
        setError(null);
      } else {
        setError('Veri alınamadı');
      }
      setLoading(false);
    } catch (err) {
      console.error('Real-time data fetch error:', err);
      setError('Bağlantı hatası');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-gray-900 rounded-xl p-6 border border-red-700/50">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div>
            <p className="text-white font-semibold">Veri Alınamadı</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-green-400' : data.trend === 'down' ? 'text-red-400' : 'text-gray-400';
  const bgColor = data.trend === 'up' ? 'from-green-500/10 to-emerald-500/5 border-green-500/20' : 
                   data.trend === 'down' ? 'from-red-500/10 to-rose-500/5 border-red-500/20' : 
                   'from-gray-500/10 to-slate-500/5 border-gray-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${bgColor} rounded-2xl p-6 border shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Gerçek Zamanlı Durum
        </h3>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
        ></motion.div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Current Occupancy */}
        <div>
          <p className="text-sm text-white font-semibold mb-1">Anlık Yoğunluk</p>
          <div className="flex items-end gap-2">
            <motion.span
              key={data.currentOccupancy}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-white"
            >
              {Math.round(data.currentOccupancy)}%
            </motion.span>
            <div className={`flex items-center gap-1 mb-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{data.trendPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Active Cameras */}
        <div>
          <p className="text-sm text-white font-semibold mb-1">Aktif Kamera</p>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{data.activeCameras}</span>
          </div>
        </div>
      </div>

      {/* Occupancy Level Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white font-semibold">
          <span>Yoğunluk Seviyesi</span>
          <span>{data.currentOccupancy > 75 ? 'Kritik' : data.currentOccupancy > 50 ? 'Yüksek' : data.currentOccupancy > 25 ? 'Orta' : 'Düşük'}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(data.currentOccupancy, 100)}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${
              data.currentOccupancy > 75 ? 'bg-gradient-to-r from-red-500 to-red-600' :
              data.currentOccupancy > 50 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
              data.currentOccupancy > 25 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              'bg-gradient-to-r from-green-500 to-green-600'
            }`}
          />
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-white font-medium">
          Son güncelleme: {data.lastUpdate.toLocaleTimeString('tr-TR')}
        </p>
      </div>
    </motion.div>
  );
}
