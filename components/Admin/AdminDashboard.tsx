'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Crown, MapPin, MessageSquare, TrendingUp, DollarSign, Activity, Eye, Heart, Star, Camera, BarChart3 } from 'lucide-react';
import { useAdminStore } from '@/lib/stores/adminStore';
import { formatTime } from '@/lib/utils';
import { Line, Bar } from 'recharts';
import { useState } from 'react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const { stats, refreshStats } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'locations' | 'revenue'>('overview');

  // Mock chart data
  const userGrowthData = [
    { name: 'Pzt', users: 120 },
    { name: 'Sal', users: 152 },
    { name: 'Çar', users: 189 },
    { name: 'Per', users: 234 },
    { name: 'Cum', users: 298 },
    { name: 'Cmt', users: 167 },
    { name: 'Paz', users: 145 },
  ];

  const revenueData = [
    { name: 'Oca', revenue: 3200 },
    { name: 'Şub', revenue: 3800 },
    { name: 'Mar', revenue: 4100 },
    { name: 'Nis', revenue: 4450 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup': return <Users className="w-4 h-4" />;
      case 'premium': return <Crown className="w-4 h-4" />;
      case 'report': return <MessageSquare className="w-4 h-4" />;
      case 'checkin': return <MapPin className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'signup': return 'bg-green-500';
      case 'premium': return 'bg-yellow-500';
      case 'report': return 'bg-blue-500';
      case 'checkin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
          />

          {/* Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 z-[90] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                  <p className="text-white/80 text-sm">Sistem yönetim paneli</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshStats}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                >
                  🔄 Yenile
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700 px-6 bg-gray-50 dark:bg-slate-900">
              <div className="flex gap-4">
                {[
                  { id: 'overview', label: 'Genel Bakış', icon: <Activity className="w-4 h-4" /> },
                  { id: 'users', label: 'Kullanıcılar', icon: <Users className="w-4 h-4" /> },
                  { id: 'locations', label: 'Mekanlar', icon: <MapPin className="w-4 h-4" /> },
                  { id: 'revenue', label: 'Gelir', icon: <DollarSign className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={<Users className="w-6 h-6" />}
                      label="Toplam Kullanıcı"
                      value={stats.totalUsers.toLocaleString('tr-TR')}
                      change={`+${stats.userGrowth.today} bugün`}
                      color="blue"
                    />
                    <StatCard
                      icon={<Activity className="w-6 h-6" />}
                      label="Aktif Kullanıcı"
                      value={stats.activeUsers.toLocaleString('tr-TR')}
                      change={`${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% oranı`}
                      color="green"
                    />
                    <StatCard
                      icon={<Crown className="w-6 h-6" />}
                      label="Premium Üye"
                      value={stats.premiumUsers.toLocaleString('tr-TR')}
                      change={`${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% oran`}
                      color="yellow"
                    />
                    <StatCard
                      icon={<DollarSign className="w-6 h-6" />}
                      label="Aylık Gelir"
                      value={`₺${stats.revenue.monthly.toLocaleString('tr-TR')}`}
                      change="Bu ay"
                      color="purple"
                    />
                  </div>

                  {/* More Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniStatCard
                      icon={<MessageSquare className="w-5 h-5" />}
                      label="Bildirimler"
                      value={stats.totalReports.toLocaleString('tr-TR')}
                    />
                    <MiniStatCard
                      icon={<MapPin className="w-5 h-5" />}
                      label="Check-in"
                      value={stats.totalCheckIns.toLocaleString('tr-TR')}
                    />
                    <MiniStatCard
                      icon={<Heart className="w-5 h-5" />}
                      label="Favoriler"
                      value={stats.totalFavorites.toLocaleString('tr-TR')}
                    />
                    <MiniStatCard
                      icon={<Star className="w-5 h-5" />}
                      label="Takipler"
                      value={stats.totalTrackedLocations.toLocaleString('tr-TR')}
                    />
                  </div>

                  {/* Popular Locations */}
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Popüler Mekanlar
                    </h3>
                    <div className="space-y-3">
                      {stats.popularLocations.map((location, index) => (
                        <div
                          key={location.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{location.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{location.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-600">{location.visits.toLocaleString('tr-TR')}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">ziyaret</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Son Aktiviteler
                    </h3>
                    <div className="space-y-3">
                      {stats.recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg"
                        >
                          <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} text-white`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">{activity.userName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {formatTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      icon={<Users className="w-6 h-6" />}
                      label="Bugün"
                      value={stats.userGrowth.today.toLocaleString('tr-TR')}
                      change="Yeni kullanıcı"
                      color="blue"
                    />
                    <StatCard
                      icon={<TrendingUp className="w-6 h-6" />}
                      label="Bu Hafta"
                      value={stats.userGrowth.week.toLocaleString('tr-TR')}
                      change="Yeni kullanıcı"
                      color="green"
                    />
                    <StatCard
                      icon={<Activity className="w-6 h-6" />}
                      label="Bu Ay"
                      value={stats.userGrowth.month.toLocaleString('tr-TR')}
                      change="Yeni kullanıcı"
                      color="purple"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'locations' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MiniStatCard
                      icon={<Eye className="w-5 h-5" />}
                      label="Toplam Görüntülenme"
                      value={stats.popularLocations.reduce((sum, loc) => sum + loc.visits, 0).toLocaleString('tr-TR')}
                    />
                    <MiniStatCard
                      icon={<MessageSquare className="w-5 h-5" />}
                      label="Yorumlar"
                      value={stats.totalComments.toLocaleString('tr-TR')}
                    />
                    <MiniStatCard
                      icon={<Camera className="w-5 h-5" />}
                      label="Fotoğraflar"
                      value={stats.totalPhotos.toLocaleString('tr-TR')}
                    />
                    <MiniStatCard
                      icon={<Heart className="w-5 h-5" />}
                      label="Beğeniler"
                      value={stats.totalFavorites.toLocaleString('tr-TR')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      icon={<DollarSign className="w-6 h-6" />}
                      label="Aylık Gelir"
                      value={`₺${stats.revenue.monthly.toLocaleString('tr-TR')}`}
                      change="Bu ay"
                      color="green"
                    />
                    <StatCard
                      icon={<TrendingUp className="w-6 h-6" />}
                      label="Yıllık Gelir"
                      value={`₺${stats.revenue.yearly.toLocaleString('tr-TR')}`}
                      change="Bu yıl"
                      color="blue"
                    />
                    <StatCard
                      icon={<Crown className="w-6 h-6" />}
                      label="Toplam Gelir"
                      value={`₺${stats.revenue.total.toLocaleString('tr-TR')}`}
                      change="Tüm zamanlar"
                      color="purple"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Premium Üye Dağılımı
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">Ücretsiz</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {(stats.totalUsers - stats.premiumUsers).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <span className="text-yellow-700 dark:text-yellow-300">Premium</span>
                        <span className="font-bold text-yellow-700 dark:text-yellow-300">
                          {stats.premiumUsers.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper Components
function StatCard({ icon, label, value, change, color }: any) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500">{change}</p>
    </div>
  );
}

function MiniStatCard({ icon, label, value }: any) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-600">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}
