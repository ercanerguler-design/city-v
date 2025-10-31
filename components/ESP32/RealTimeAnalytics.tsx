'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, 
  Users, ArrowUpRight, ArrowDownLeft,
  Activity, BarChart3, Clock 
} from 'lucide-react';

interface CrowdAnalytics {
  deviceId: string;
  peopleCount: number;
  entryCount: number;
  exitCount: number;
  currentOccupancy: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  confidenceScore: number;
  movementDetected: number;
  timestamp: string;
}

interface RealTimeAnalyticsProps {
  deviceId: string;
  refreshInterval?: number;
}

export function RealTimeAnalytics({ deviceId, refreshInterval = 5000 }: RealTimeAnalyticsProps) {
  const [analytics, setAnalytics] = useState<CrowdAnalytics | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/iot/crowd-analysis?device_id=${deviceId}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          const latest = data.analyses?.[0];
          
          if (latest) {
            const analyticsData: CrowdAnalytics = {
              deviceId: latest.device_id,
              peopleCount: latest.people_count || 0,
              entryCount: latest.entry_count || 0,
              exitCount: latest.exit_count || 0,
              currentOccupancy: latest.current_occupancy || latest.people_count || 0,
              trendDirection: latest.trend_direction || 'stable',
              confidenceScore: latest.confidence_score || 0,
              movementDetected: latest.movement_detected || 0,
              timestamp: latest.analysis_timestamp || new Date().toISOString()
            };
            
            setAnalytics(analyticsData);
            setHistory(prev => [...prev.slice(-9), analyticsData.peopleCount]);
          }
        }
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [deviceId, refreshInterval]);

  if (loading || !analytics) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (analytics.trendDirection) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (analytics.trendDirection) {
      case 'increasing':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'decreasing':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const maxValue = Math.max(...history, 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Gerçek Zamanlı Analiz
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium capitalize">{analytics.trendDirection}</span>
        </div>
      </div>

      {/* Ana Metrikler */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="h-6 w-6 opacity-80" />
            <span className="text-sm opacity-80">Mevcut</span>
          </div>
          <div className="text-3xl font-bold">{analytics.peopleCount}</div>
          <div className="text-sm opacity-80 mt-1">kişi tespit edildi</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-6 w-6 opacity-80" />
            <span className="text-sm opacity-80">Doluluk</span>
          </div>
          <div className="text-3xl font-bold">{analytics.currentOccupancy}</div>
          <div className="text-sm opacity-80 mt-1">toplam kişi</div>
        </motion.div>
      </div>

      {/* Giriş/Çıkış */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Giriş</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{analytics.entryCount}</div>
        </div>

        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownLeft className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Çıkış</span>
          </div>
          <div className="text-2xl font-bold text-red-700">{analytics.exitCount}</div>
        </div>
      </div>

      {/* Mini Grafik */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Son 10 Ölçüm</span>
          <span className="text-gray-500">{new Date(analytics.timestamp).toLocaleTimeString('tr-TR')}</span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {history.map((value, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxValue) * 100}%` }}
              className="flex-1 bg-gradient-to-t from-purple-400 to-purple-600 rounded-t"
              title={`${value} kişi`}
            />
          ))}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Güven Skoru</div>
            <div className="text-sm font-semibold text-gray-800">
              {(analytics.confidenceScore * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Hareket</div>
            <div className="text-sm font-semibold text-gray-800">{analytics.movementDetected}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
