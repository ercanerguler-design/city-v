'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, Users, TrendingUp, Crown, MapPin, MessageSquare, 
  Camera, Heart, Star, DollarSign, Activity, LogOut,
  RefreshCw, BarChart3, Clock, AlertCircle, Home
} from 'lucide-react';
import { useAdminStore } from '@/lib/stores/adminStore';
import { formatTime } from '@/lib/utils';
import { getAllUsers } from '@/lib/stores/userManager';
import toast from 'react-hot-toast';

export default function CityVAdminDashboard() {
  const router = useRouter();
  const { isAdmin, stats, refreshStats, logout } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'locations' | 'revenue'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin değilse login sayfasına yönlendir
  useEffect(() => {
    if (!isAdmin) {
      router.push('/cityvadmin');
    }
  }, [isAdmin, router]);

  // Admin değilse hiçbir şey gösterme
  if (!isAdmin) {
    return null;
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshStats();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast.success('📊 İstatistikler güncellendi');
  };

  const handleLogout = () => {
    logout();
    toast.success('👋 Çıkış yapıldı');
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  // Tab içerikleri
  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'locations', label: 'Mekanlar', icon: MapPin },
    { id: 'revenue', label: 'Gelir', icon: DollarSign },
  ];

  // Stat Card Component
  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    gradient 
  }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    change?: string; 
    gradient: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  // Mini Stat Card Component
  const MiniStatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
                title="Ana Sayfaya Dön"
              >
                <Home className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">City View Management</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 group"
                title="İstatistikleri Yenile"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                label="Toplam Kullanıcı"
                value={stats.totalUsers.toLocaleString()}
                change={`+${stats.userGrowth.month} bu ay`}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Activity}
                label="Aktif Kullanıcı"
                value={stats.activeUsers.toLocaleString()}
                change={`+${stats.userGrowth.week} bu hafta`}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={Crown}
                label="Premium Üye"
                value={stats.premiumUsers.toLocaleString()}
                gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
              />
              <StatCard
                icon={DollarSign}
                label="Aylık Gelir"
                value={`₺${stats.revenue.monthly.toLocaleString()}`}
                change={`₺${stats.revenue.yearly.toLocaleString()} yıllık`}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStatCard icon={AlertCircle} label="Raporlar" value={stats.totalReports} />
              <MiniStatCard icon={MapPin} label="Check-inler" value={stats.totalCheckIns} />
              <MiniStatCard icon={Heart} label="Favoriler" value={stats.totalFavorites} />
              <MiniStatCard icon={Star} label="Takip Edilenler" value={stats.totalTrackedLocations} />
            </div>

            {/* Popular Locations & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Locations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Popüler Mekanlar
                </h3>
                <div className="space-y-3">
                  {stats.popularLocations.map((location, index) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          'bg-orange-400 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{location.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{location.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{location.visits.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ziyaret</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Son Aktiviteler
                </h3>
                <div className="space-y-3">
                  {stats.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'signup' ? 'bg-green-100 dark:bg-green-900/30' :
                        activity.type === 'premium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        activity.type === 'report' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {activity.type === 'signup' && <Users className="w-4 h-4 text-green-600 dark:text-green-400" />}
                        {activity.type === 'premium' && <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                        {activity.type === 'report' && <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {activity.type === 'checkin' && <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.details}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Users}
                label="Bugün Katılan"
                value={stats.userGrowth.today}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Bu Hafta"
                value={stats.userGrowth.week}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Activity}
                label="Bu Ay"
                value={stats.userGrowth.month}
                gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              />
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tüm Kullanıcılar
                </h3>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium">
                  {(() => {
                    try {
                      const allUsers = getAllUsers();
                      return allUsers.length;
                    } catch {
                      return stats.totalUsers;
                    }
                  })()} Kullanıcı
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Kullanıcı
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        E-posta
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Durum
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Kayıt Tarihi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      try {
                        const allUsers = getAllUsers();
                        return allUsers.length > 0 ? (
                          allUsers.map((user) => (
                            <tr 
                              key={user.id}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      ID: {user.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {user.email}
                              </td>
                              <td className="py-3 px-4">
                                {user.premium ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                                    <Crown className="w-3 h-3" />
                                    Premium
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                                    Ücretsiz
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                                {formatTime(user.createdAt)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              Henüz kayıtlı kullanıcı bulunmuyor
                            </td>
                          </tr>
                        );
                      } catch (error) {
                        return (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-red-500">
                              Kullanıcılar yüklenirken bir hata oluştu
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={MapPin}
                label="Toplam Mekan"
                value={stats.totalLocations}
                gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
              />
              <StatCard
                icon={MessageSquare}
                label="Yorumlar"
                value={stats.totalComments}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Camera}
                label="Fotoğraflar"
                value={stats.totalPhotos}
                gradient="bg-gradient-to-br from-pink-500 to-pink-600"
              />
              <StatCard
                icon={Heart}
                label="Beğeniler"
                value={stats.totalFavorites + stats.totalTrackedLocations}
                gradient="bg-gradient-to-br from-red-500 to-red-600"
              />
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={DollarSign}
                label="Aylık Gelir"
                value={`₺${stats.revenue.monthly.toLocaleString()}`}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Yıllık Gelir"
                value={`₺${stats.revenue.yearly.toLocaleString()}`}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Crown}
                label="Toplam Gelir"
                value={`₺${stats.revenue.total.toLocaleString()}`}
                gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Premium Üye Dağılımı</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Premium Üyeler</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stats.premiumUsers} aktif üye</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₺{stats.revenue.monthly.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
