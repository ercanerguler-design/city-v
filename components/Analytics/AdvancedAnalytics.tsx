'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, MapPin, Clock, Activity, BarChart3, X, Flame } from 'lucide-react';
import { useAnalyticsStore } from '@/lib/stores/analyticsStore';
import { getCategoryById } from '@/lib/categories';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AdvancedAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function AdvancedAnalytics({ isOpen, onClose }: AdvancedAnalyticsProps) {
  const { totalVisits, getTopLocations, getCategoryStats, getHourlyStats, getTrendingLocations } = useAnalyticsStore();

  if (!isOpen) return null;

  const topLocations = getTopLocations(5);
  const categoryStats = getCategoryStats();
  const hourlyStats = getHourlyStats();
  const trendingLocations = getTrendingLocations(24);

  // Kategori verileri pie chart için
  const categoryChartData = categoryStats.map((stat, index) => ({
    name: getCategoryById(stat.categoryId)?.name || stat.categoryId,
    value: stat.visitCount,
    color: COLORS[index % COLORS.length],
  }));

  // Saatlik veriler area chart için
  const hourlyChartData = hourlyStats.map((stat) => ({
    hour: `${stat.hour}:00`,
    ziyaret: stat.visitCount,
    kalabalik: stat.avgCrowdLevel.toFixed(1),
  }));

  const getCrowdLevelColor = (level: number) => {
    if (level < 2) return 'text-green-500';
    if (level < 3) return 'text-yellow-500';
    if (level < 4) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            📊 Gelişmiş İstatistikler
          </h2>
          <p className="text-white/90">Kullanım verilerinizin detaylı analizi</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8" />
                <span className="text-3xl font-bold">{totalVisits}</span>
              </div>
              <p className="text-blue-100 font-semibold">Toplam Ziyaret</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-8 h-8" />
                <span className="text-3xl font-bold">{topLocations.length}</span>
              </div>
              <p className="text-purple-100 font-semibold">Farklı Mekan</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8" />
                <span className="text-3xl font-bold">{categoryStats.length}</span>
              </div>
              <p className="text-pink-100 font-semibold">Kategori</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Locations */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                🏆 En Çok Ziyaret Edilen Yerler
              </h3>
              <div className="space-y-3">
                {topLocations.map((loc, index) => (
                  <div
                    key={loc.locationId}
                    className="bg-white dark:bg-slate-600 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{loc.locationName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getCategoryById(loc.category)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{loc.count}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ziyaret</p>
                    </div>
                  </div>
                ))}
                {topLocations.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Henüz ziyaret kaydı yok
                  </p>
                )}
              </div>
            </motion.div>

            {/* Trending Locations */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                🔥 Trend Olan Yerler <span className="text-sm text-gray-500">(Son 24 saat)</span>
              </h3>
              <div className="space-y-3">
                {trendingLocations.map((loc) => (
                  <div
                    key={loc.locationId}
                    className="bg-white dark:bg-slate-600 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Flame className="w-6 h-6 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{loc.locationName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{loc.count} ziyaret</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {loc.trend > 0 ? (
                        <>
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          <span className="text-green-600 dark:text-green-400 font-bold">+{loc.trend}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-5 h-5 text-red-500" />
                          <span className="text-red-600 dark:text-red-400 font-bold">{loc.trend}%</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {trendingLocations.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Henüz trend verisi yok
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Hourly Activity Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Saatlik Aktivite
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ziyaret"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Category Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Kategori Dağılımı
              </h3>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-20">
                  Henüz kategori verisi yok
                </p>
              )}
            </motion.div>
          </div>

          {/* Category Stats Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 mt-6"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              📊 Kategori İstatistikleri
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-slate-600">
                    <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                      Kategori
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                      Ziyaret
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                      Ort. Kalabalık
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.map((stat, index) => (
                    <tr
                      key={stat.categoryId}
                      className="border-b border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {getCategoryById(stat.categoryId)?.name || stat.categoryId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-bold">
                          {stat.visitCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${getCrowdLevelColor(stat.avgCrowdLevel)}`}>
                          {stat.avgCrowdLevel.toFixed(1)} / 5
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categoryStats.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Henüz kategori istatistiği yok
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
