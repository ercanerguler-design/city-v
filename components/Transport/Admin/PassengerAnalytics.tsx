'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface PassengerAnalyticsProps {
  vehicleId?: string;
  stopId?: string;
  timeRange?: '1hour' | '24hours' | '7days';
}

interface PassengerSummary {
  totalBoarding: number;
  totalAlighting: number;
  netChange: number;
  totalEvents: number;
}

interface BusiestPeriod {
  hour: number;
  boarding: number;
  alighting: number;
  events: number;
}

export default function PassengerAnalytics({ vehicleId, stopId, timeRange = '24hours' }: PassengerAnalyticsProps) {
  const [summary, setSummary] = useState<PassengerSummary | null>(null);
  const [busiestPeriods, setBusiestPeriods] = useState<BusiestPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(timeRange);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [vehicleId, stopId, selectedRange]);

  const fetchData = async () => {
    try {
      let url = `/api/transport/passenger-counts?timeRange=${selectedRange}`;
      if (vehicleId) url += `&vehicleId=${vehicleId}`;
      if (stopId) url += `&stopId=${stopId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setBusiestPeriods(data.busiestPeriods || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch passenger analytics:', error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: busiestPeriods.map(p => `${p.hour}:00`),
    datasets: [
      {
        label: 'Binen Yolcu',
        data: busiestPeriods.map(p => p.boarding),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'İnen Yolcu',
        data: busiestPeriods.map(p => p.alighting),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: { size: 12 },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(55, 65, 81, 0.5)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      x: {
        grid: {
          color: 'rgba(55, 65, 81, 0.3)'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
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
          className="grid grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-4 border border-green-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <span className="text-xs text-green-200">Toplam Biniş</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.totalBoarding}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-4 border border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-300" />
              <span className="text-xs text-blue-200">Toplam İniş</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.totalAlighting}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-4 border border-purple-700">
            <span className="text-xs text-purple-200 block mb-2">Net Değişim</span>
            <p className={`text-3xl font-bold ${summary.netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary.netChange >= 0 ? '+' : ''}{summary.netChange}
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl p-4 border border-indigo-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-indigo-300" />
              <span className="text-xs text-indigo-200">Olay Sayısı</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.totalEvents}</p>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Yolcu Akışı Analizi</h3>
            <p className="text-sm text-gray-400">Saatlik biniş/iniş dağılımı</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {[
              { value: '1hour', label: '1 Saat' },
              { value: '24hours', label: '24 Saat' },
              { value: '7days', label: '7 Gün' }
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
        </div>

        <div className="h-80">
          {busiestPeriods.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Henüz yolcu verisi yok</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Peak Hours Table */}
      {busiestPeriods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">En Yoğun Saatler</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Saat</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Biniş</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">İniş</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Toplam</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Olay</th>
                </tr>
              </thead>
              <tbody>
                {busiestPeriods.map((period, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{period.hour}:00</td>
                    <td className="py-3 px-4 text-sm text-green-400 text-right font-semibold">{period.boarding}</td>
                    <td className="py-3 px-4 text-sm text-blue-400 text-right font-semibold">{period.alighting}</td>
                    <td className="py-3 px-4 text-sm text-white text-right font-semibold">
                      {period.boarding + period.alighting}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400 text-right">{period.events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
