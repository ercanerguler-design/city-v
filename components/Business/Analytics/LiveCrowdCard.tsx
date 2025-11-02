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

  useEffect(() => {
    fetchCrowdData();
    const interval = setInterval(fetchCrowdData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [businessId]);

  const fetchCrowdData = async () => {
    try {
      const response = await fetch(`/api/business/crowd-analytics?businessId=${businessId}&timeRange=1hour`);
      const data = await response.json();

      if (data.success && data.currentStatus) {
        const newData = {
          peopleCount: data.currentStatus.peopleCount || 0,
          crowdLevel: data.currentStatus.crowdLevel || 'low',
          density: data.currentStatus.density || 0,
          queueLength: data.currentStatus.queueLength || 0,
          entryCount: data.entryExit?.totalEntry || 0,
          exitCount: data.entryExit?.totalExit || 0
        };

        // Determine trend
        if (crowdData) {
          if (newData.peopleCount > crowdData.peopleCount) setTrend('up');
          else if (newData.peopleCount < crowdData.peopleCount) setTrend('down');
          else setTrend('stable');
        }

        setCrowdData(newData);
      }
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
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-xs text-green-400">Aktif</span>
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
