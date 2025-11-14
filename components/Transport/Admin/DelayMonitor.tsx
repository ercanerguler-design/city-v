'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, TrendingDown, Calendar } from 'lucide-react';

interface DelayMonitorProps {
  stopId?: string;
  routeId?: string;
  vehicleId?: string;
  timeRange?: '1hour' | '24hours' | '7days' | '30days';
}

interface DelaySummary {
  totalArrivals: number;
  onTimeArrivals: number;
  delayedArrivals: number;
  earlyArrivals: number;
  onTimePercentage: number;
  avgDelay: number;
}

interface DelayByHour {
  hour: number;
  avgDelay: number;
  totalArrivals: number;
  delayedCount: number;
  onTimeRate: number;
}

interface RecentArrival {
  id: number;
  vehicle: string;
  stop: string;
  route: string;
  scheduledTime: string;
  actualTime: string;
  delayMinutes: number;
  status: 'on-time' | 'delayed' | 'early';
}

export default function DelayMonitor({ stopId, routeId, vehicleId, timeRange = '24hours' }: DelayMonitorProps) {
  const [summary, setSummary] = useState<DelaySummary | null>(null);
  const [delaysByHour, setDelaysByHour] = useState<DelayByHour[]>([]);
  const [recentArrivals, setRecentArrivals] = useState<RecentArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(timeRange);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000); // Update every 20 seconds
    return () => clearInterval(interval);
  }, [stopId, routeId, vehicleId, selectedRange]);

  const fetchData = async () => {
    try {
      let url = `/api/transport/arrivals?timeRange=${selectedRange}`;
      if (stopId) url += `&stopId=${stopId}`;
      if (routeId) url += `&routeId=${routeId}`;
      if (vehicleId) url += `&vehicleId=${vehicleId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setDelaysByHour(data.delaysByHour || []);
        setRecentArrivals(data.recentArrivals || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch delay data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'text-green-400 bg-green-500';
      case 'delayed':
        return 'text-red-400 bg-red-500';
      case 'early':
        return 'text-blue-400 bg-blue-500';
      default:
        return 'text-gray-400 bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'Zamanında';
      case 'delayed':
        return 'Gecikmeli';
      case 'early':
        return 'Erken';
      default:
        return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-6 gap-4"
        >
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl p-4 border border-indigo-700">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-300" />
              <span className="text-xs text-indigo-200">Toplam</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.totalArrivals}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-4 border border-green-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="text-xs text-green-200">Zamanında</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.onTimeArrivals}</p>
          </div>

          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-xl p-4 border border-red-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-300" />
              <span className="text-xs text-red-200">Gecikmeli</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.delayedArrivals}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-4 border border-blue-700">
            <span className="text-xs text-blue-200 block mb-2">Erken</span>
            <p className="text-3xl font-bold text-white">{summary.earlyArrivals}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-4 border border-purple-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-purple-300" />
              <span className="text-xs text-purple-200">Ort. Gecikme</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.avgDelay} dk</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-4 border border-yellow-700">
            <span className="text-xs text-yellow-200 block mb-2">Başarı Oranı</span>
            <p className="text-3xl font-bold text-white">{summary.onTimePercentage}%</p>
          </div>
        </motion.div>
      )}

      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        {[
          { value: '1hour', label: '1 Saat' },
          { value: '24hours', label: '24 Saat' },
          { value: '7days', label: '7 Gün' },
          { value: '30days', label: '30 Gün' }
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setSelectedRange(range.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedRange === range.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Hourly Delay Chart */}
      {delaysByHour.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Saatlik Gecikme Analizi</h3>
          <div className="space-y-3">
            {delaysByHour.map((hour, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm font-semibold text-gray-400">
                  {hour.hour}:00
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {hour.totalArrivals} varış, {hour.delayedCount} gecikmeli
                    </span>
                    <span className={`text-xs font-semibold ${
                      hour.avgDelay <= 0 ? 'text-green-400' : hour.avgDelay <= 3 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {hour.avgDelay > 0 ? '+' : ''}{hour.avgDelay} dk
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${hour.onTimeRate}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="bg-green-500"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - hour.onTimeRate}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="bg-red-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    hour.onTimeRate >= 90 ? 'bg-green-500 bg-opacity-20 text-green-400' :
                    hour.onTimeRate >= 70 ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                    'bg-red-500 bg-opacity-20 text-red-400'
                  }`}>
                    {hour.onTimeRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Arrivals */}
      {recentArrivals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Son Varışlar</h3>
          <div className="space-y-2">
            {recentArrivals.slice(0, 10).map((arrival, index) => (
              <div
                key={arrival.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg p-3 border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    arrival.status === 'on-time' ? 'bg-green-500' :
                    arrival.status === 'delayed' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-semibold text-white">{arrival.vehicle} - {arrival.route}</p>
                    <p className="text-xs text-gray-400">{arrival.stop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Planlanan</p>
                    <p className="text-sm text-gray-300">
                      {new Date(arrival.scheduledTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Gerçek</p>
                    <p className="text-sm text-white font-semibold">
                      {new Date(arrival.actualTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-opacity-20 ${getStatusColor(arrival.status)}`}>
                    {arrival.status === 'on-time' ? <CheckCircle className="w-3 h-3" /> :
                     arrival.status === 'delayed' ? <AlertTriangle className="w-3 h-3" /> :
                     <Clock className="w-3 h-3" />}
                    <span className="text-xs font-semibold">
                      {arrival.delayMinutes > 0 ? '+' : ''}{arrival.delayMinutes} dk
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
