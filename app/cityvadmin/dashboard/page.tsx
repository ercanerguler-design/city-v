'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, Users, TrendingUp, Crown, MapPin, MessageSquare, 
  Camera, Heart, Star, DollarSign, Activity, LogOut,
  RefreshCw, BarChart3, Clock, AlertCircle, Home, Building2, Plus
} from 'lucide-react';
import { useAdminStore } from '@/lib/stores/adminStore';
import { formatTime } from '@/lib/utils';
import { getAllUsers } from '@/lib/stores/userManager';
import BusinessMemberForm from '@/components/Admin/BusinessMemberForm';
import toast from 'react-hot-toast';

export default function CityVAdminDashboard() {
  const router = useRouter();
  const { isAdmin, stats: localStats, refreshStats, logout } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'locations' | 'revenue' | 'business'>('overview');
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [businessMembers, setBusinessMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [realStats, setRealStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Gerçek istatistikleri yükle
  const loadRealStats = async () => {
    try {
      console.log('📊 Stats yükleniyor...');
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      console.log('📊 Stats API Response:', data);
      if (data.success) {
        setRealStats(data.stats);
        console.log('✅ Gerçek istatistikler yüklendi:', data.stats.revenue);
      }
    } catch (error) {
      console.error('❌ Stats load error:', error);
    }
  };

  // Kullanıcıları yükle
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        console.log('✅ Kullanıcılar yüklendi:', data.users.length);
        console.log('📋 İlk kullanıcı örneği:', data.users[0]);
      }
    } catch (error) {
      console.error('❌ Users load error:', error);
    }
  };

  // Mekanları yükle
  const loadLocations = async () => {
    try {
      const response = await fetch('/api/admin/locations');
      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
        console.log('✅ Mekanlar yüklendi:', data.locations.length);
      }
    } catch (error) {
      console.error('❌ Locations load error:', error);
    }
  };

  // Admin değilse login sayfasına yönlendir
  useEffect(() => {
    console.log('🔍 useEffect çalıştı - isAdmin:', isAdmin);
    if (!isAdmin) {
      console.log('⚠️ Admin değil, login sayfasına yönlendiriliyor...');
      router.push('/cityvadmin');
    } else {
      // Admin ise gerçek verileri yükle
      console.log('✅ Admin onaylandı, stats yükleniyor...');
      loadRealStats();
      loadUsers();
      loadLocations();
      loadBusinessMembers();
    }
  }, [isAdmin, router]);

  // Prevent navigation without logout
  useEffect(() => {
    if (!isAdmin) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (!confirm('Çıkış yapmadan sayfadan ayrılmak istediğinize emin misiniz?')) {
        window.history.pushState(null, '', window.location.href);
      }
    };

    // Add history state
    window.history.pushState(null, '', window.location.href);
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAdmin]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRealStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'locations') loadLocations();
    if (activeTab === 'business') loadBusinessMembers();
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

  // Business üyeleri yükle fonksiyonu (tekrar kullanılabilir)
  const loadBusinessMembers = async () => {
    try {
      const response = await fetch('/api/admin/business-members');
      const data = await response.json();
      if (data.success) {
        setBusinessMembers(data.members);
        console.log('✅ Business members yüklendi:', data.members.length);
      }
    } catch (error) {
      console.error('❌ Business members load error:', error);
    }
  };

  // Normal kullanıcı premium yapma
  const handleTogglePremium = async (user: any) => {
    const newMembership = user.membership === 'premium' ? 'free' : 'premium';
    const confirm = window.confirm(`${user.name} kullanıcısını ${newMembership === 'premium' ? 'Premium' : 'Free'} yapmak istediğinize emin misiniz?`);
    
    if (!confirm) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.original_id,
          updates: { membership_tier: newMembership }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`✅ ${user.name} ${newMembership === 'premium' ? 'Premium üye yapıldı' : 'Free üye yapıldı'}`);
        
        // Force refresh with delay
        setTimeout(async () => {
          await loadUsers();
          await loadRealStats();
        }, 500);
      } else {
        toast.error(`❌ ${data.error || 'Üyelik güncellenemedi'}`);
      }
    } catch (error) {
      console.error('❌ Membership update error:', error);
      toast.error('❌ Üyelik güncellenemedi');
    }
  };

  // Normal kullanıcı silme
  const handleDeleteUser = async (user: any) => {
    const confirm = window.confirm(`${user.name} (${user.email}) kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`);
    
    if (!confirm) return;

    try {
      const response = await fetch(`/api/admin/users?id=${user.original_id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`✅ ${user.name} silindi`);
        loadUsers(); // Listeyi yenile
        loadRealStats(); // Stats'ı güncelle
      } else {
        toast.error(`❌ ${data.error || 'Kullanıcı silinemedi'}`);
      }
    } catch (error) {
      console.error('❌ User delete error:', error);
      toast.error('❌ Kullanıcı silinemedi');
    }
  };

  // Tab değiştiğinde ilgili verileri yükle
  useEffect(() => {
    if (!isAdmin) return;
    
    if (activeTab === 'business') {
      loadBusinessMembers();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'locations') {
      loadLocations();
    }
  }, [isAdmin, activeTab]);

  // Tab içerikleri
  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'users', label: 'CityV Üyeleri', icon: Users },
    { id: 'business', label: 'Business Üyeler', icon: Building2 },
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

  // Admin değilse loading göster (yönlendirme yapılırken)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

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
                value={(realStats?.totalUsers || localStats.totalUsers).toLocaleString()}
                change={`+${realStats?.userGrowth.month || localStats.userGrowth.month} bu ay`}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Activity}
                label="Aktif Kullanıcı"
                value={(realStats?.activeUsers || localStats.activeUsers).toLocaleString()}
                change={`+${realStats?.userGrowth.week || localStats.userGrowth.week} bu hafta`}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={Crown}
                label="Premium Üye"
                value={(realStats?.premiumUsers || localStats.premiumUsers).toLocaleString()}
                gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
              />
              <StatCard
                icon={DollarSign}
                label="Aylık Gelir"
                value={`₺${(realStats?.revenue.monthly || localStats.revenue.monthly).toLocaleString()}`}
                change={`₺${(realStats?.revenue.yearly || localStats.revenue.yearly).toLocaleString()} yıllık`}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              />
            </div>

            {/* Premium Subscription Breakdown */}
            {realStats?.revenue?.premiumBreakdown && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💎 Premium Abonelik Detayları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">📅 Aylık Abonelik</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {realStats.revenue.premiumBreakdown.monthly?.count || 0} üye
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400 mt-2">
                      ₺{(realStats.revenue.premiumBreakdown.monthly?.revenue || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {realStats.revenue.premiumBreakdown.monthly?.count || 0} × ₺49.99/ay
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-xl p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">🗓️ Yıllık Abonelik</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {realStats.revenue.premiumBreakdown.yearly?.count || 0} üye
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                      ₺{(realStats.revenue.premiumBreakdown.yearly?.revenue || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {realStats.revenue.premiumBreakdown.yearly?.count || 0} × ₺399.99/yıl
                    </div>
                  </div>
                </div>
                
                {/* Total Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 border-2 border-green-200 dark:border-green-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">💰 Toplam Gelir</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Business ({realStats.totalBusinessMembers || 0}) + Normal Premium ({realStats.premiumUsers || 0})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₺{(realStats.revenue?.total || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">toplam</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStatCard icon={Building2} label="Business Üye" value={realStats?.totalBusinessMembers || 0} />
              <MiniStatCard icon={MapPin} label="Mekanlar" value={realStats?.totalLocations || localStats.totalLocations} />
              <MiniStatCard icon={Camera} label="IoT Cihaz" value={realStats?.totalDevices || 0} />
              <MiniStatCard icon={Activity} label="Crowd Analiz" value={realStats?.totalCrowdAnalysis || 0} />
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
                  {(realStats?.popularLocations || localStats.popularLocations).slice(0, 5).map((location: any, index: number) => (
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
                          {location.location && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">{location.location}</p>
                          )}
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
                  {(realStats?.recentActivities || localStats.recentActivities).map((activity: any) => (
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
                value={realStats?.userGrowth.today || localStats.userGrowth.today}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Bu Hafta"
                value={realStats?.userGrowth.week || localStats.userGrowth.week}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Activity}
                label="Bu Ay"
                value={realStats?.userGrowth.month || localStats.userGrowth.month}
                gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              />
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  CityV Normal Üyeleri
                </h3>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium">
                  {users.length} Normal Üye
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Kullanıcı Adı
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        E-posta
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Üyelik Tipi
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Kayıt Tarihi
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Son Aktivite
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user: any) => (
                        <tr 
                          key={user.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </p>
                                {user.company && (
                                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                    🏢 {user.company}
                                  </p>
                                )}
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.membership === 'enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              user.membership === 'premium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {user.membership === 'enterprise' ? '⭐ Enterprise' :
                               user.membership === 'premium' ? '💎 Premium' : ' Free'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                            {user.last_activity ? new Date(user.last_activity).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '❌ Hiç giriş yapmadı'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleTogglePremium(user)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                  user.membership === 'premium'
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
                                }`}
                              >
                                {user.membership === 'premium' ? '⬇️ Free Yap' : '💎 Premium Yap'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition"
                              >
                                🗑️ Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          Henüz normal üye yok
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Business Üyeler</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Toplam {businessMembers.length} business üye
                </p>
              </div>
              <button
                onClick={() => setShowBusinessForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Yeni Üye Ekle
              </button>
            </div>

            {/* Business Members List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Firma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Yetkili Kişi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Lisans
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Başlangıç
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Bitiş
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {businessMembers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Building2 className="w-12 h-12 text-gray-400" />
                            <p className="text-gray-500 dark:text-gray-400">
                              Henüz business üye bulunmuyor
                            </p>
                            <button
                              onClick={() => setShowBusinessForm(true)}
                              className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              İlk üyeyi ekle →
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      businessMembers.map((member) => {
                        const isActive = member.subscription_active && new Date(member.end_date) > new Date();
                        const daysLeft = Math.ceil((new Date(member.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.company_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {member.company_type} • {member.company_city}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.full_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {member.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                member.plan_type === 'enterprise'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {member.plan_type === 'enterprise' ? '⭐ Enterprise' : '💎 Premium'}
                              </span>
                              {member.is_trial && (
                                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                  Trial
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                {member.license_key?.substring(0, 15)}...
                              </code>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {new Date(member.start_date).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {new Date(member.end_date).toLocaleDateString('tr-TR')}
                                </p>
                                {isActive && daysLeft <= 30 && (
                                  <p className="text-xs text-orange-600 dark:text-orange-400">
                                    {daysLeft} gün kaldı
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {isActive ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  ✓ Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  ✕ Süresi Dolmuş
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedBusiness(member);
                                    setShowEditBusinessModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                                >
                                  ✏️ Düzenle
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm(`${member.company_name} firmasının business üyeliğini iptal etmek istediğinize emin misiniz?\n\nTüm veriler backup'lanacak ve haritadan kaldırılacak.`)) {
                                      return;
                                    }

                                    try {
                                      // Business subscription'ı deaktif et
                                      const response = await fetch(`/api/admin/business-members?id=${member.id}`, {
                                        method: 'DELETE'
                                      });

                                      const data = await response.json();
                                      if (data.success) {
                                        toast.success(data.message);
                                        // Business members listesini yenile
                                        const membersRes = await fetch('/api/admin/business-members');
                                        const membersData = await membersRes.json();
                                        if (membersData.success) {
                                          setBusinessMembers(membersData.members);
                                        }
                                        refreshStats();
                                      } else {
                                        toast.error(`❌ Hata: ${data.error}`);
                                      }
                                    } catch (error: any) {
                                      toast.error(`❌ Hata: ${error.message}`);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
                                  title="Business üyelikten çıkar"
                                >
                                  🗑️ Üyelikten Çıkar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
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
                value={realStats?.totalLocations || localStats.totalLocations}
                gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
              />
              <StatCard
                icon={Building2}
                label="Business Mekanları"
                value={locations.length}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Camera}
                label="IoT Cihazlar"
                value={realStats?.totalDevices || 0}
                gradient="bg-gradient-to-br from-pink-500 to-pink-600"
              />
              <StatCard
                icon={Activity}
                label="Crowd Analiz"
                value={realStats?.totalCrowdAnalysis || 0}
                gradient="bg-gradient-to-br from-red-500 to-red-600"
              />
            </div>

            {/* Locations List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Business Mekanları
                </h3>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium">
                  {locations.length} Mekan
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Mekan Adı
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Tür
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Lokasyon
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        İletişim
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Cihaz
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Kayıt Tarihi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.length > 0 ? (
                      locations.map((location: any) => (
                        <tr 
                          key={location.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {location.business_name || 'İsimsiz Mekan'}
                            </div>
                            {location.owner_company && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {location.owner_company}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {location.business_type || 'Diğer'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                            {location.location_string || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                            {location.phone && <div>{location.phone}</div>}
                            {location.email && <div className="text-xs">{location.email}</div>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Camera className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {location.device_count}
                              </span>
                            </div>
                            {location.analysis_count > 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {location.analysis_count} analiz
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                            {location.created_at ? new Date(location.created_at).toLocaleDateString('tr-TR') : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          Henüz mekan yok
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                value={`₺${(realStats?.revenue.monthly || localStats.revenue.monthly).toLocaleString()}`}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Yıllık Gelir"
                value={`₺${(realStats?.revenue.yearly || localStats.revenue.yearly).toLocaleString()}`}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Crown}
                label="Toplam Gelir"
                value={`₺${(realStats?.revenue.total || localStats.revenue.total).toLocaleString()}`}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">{realStats?.premiumUsers || localStats.premiumUsers} aktif üye</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₺{(realStats?.revenue.monthly || localStats.revenue.monthly).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Business Member Form Modal */}
      {showBusinessForm && (
        <BusinessMemberForm
          onClose={() => setShowBusinessForm(false)}
          onSuccess={() => {
            loadBusinessMembers(); // Business members listesini yenile
            setShowBusinessForm(false);
            toast.success('✅ Business üye eklendi');
          }}
        />
      )}

      {/* Edit Business Member Modal */}
      {showEditBusinessModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Business Üye Düzenle
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedBusiness.company_name} - {selectedBusiness.full_name}
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                try {
                  const response = await fetch('/api/admin/business-members', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: selectedBusiness.id,
                      updateData: {
                        membership: {
                          membershipType: formData.get('membershipType'),
                          expiryDate: formData.get('expiryDate'),
                          maxCameras: parseInt(formData.get('maxCameras') as string)
                        },
                        user: {
                          isActive: formData.get('isActive') === 'true',
                          adminNotes: formData.get('adminNotes')
                        }
                      }
                    })
                  });

                  const data = await response.json();
                  if (data.success) {
                    toast.success('✅ Business üye güncellendi');
                    loadBusinessMembers();
                    setShowEditBusinessModal(false);
                    setSelectedBusiness(null);
                  } else {
                    toast.error(`❌ ${data.error}`);
                  }
                } catch (error: any) {
                  toast.error(`❌ ${error.message}`);
                }
              }}
              className="p-6 space-y-6"
            >
              {/* Membership Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Üyelik Tipi
                </label>
                <select
                  name="membershipType"
                  defaultValue={selectedBusiness.plan_type}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="premium">💎 Premium (10 Kamera)</option>
                  <option value="enterprise">⭐ Enterprise (50 Kamera)</option>
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Üyelik Bitiş Tarihi
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  defaultValue={selectedBusiness.end_date ? new Date(selectedBusiness.end_date).toISOString().split('T')[0] : ''}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mevcut: {selectedBusiness.end_date ? new Date(selectedBusiness.end_date).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                </p>
              </div>

              {/* Max Cameras */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maksimum Kamera Sayısı
                </label>
                <input
                  type="number"
                  name="maxCameras"
                  defaultValue={selectedBusiness?.max_cameras ?? 10}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mevcut: {selectedBusiness?.max_cameras ?? 'Belirtilmemiş'}
                </p>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durum
                </label>
                <select
                  name="isActive"
                  defaultValue={selectedBusiness.is_active ? 'true' : 'false'}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="true">✓ Aktif</option>
                  <option value="false">✕ Pasif</option>
                </select>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notları
                </label>
                <textarea
                  name="adminNotes"
                  defaultValue={selectedBusiness.admin_notes || ''}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Özel notlar..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBusinessModal(false);
                    setSelectedBusiness(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
