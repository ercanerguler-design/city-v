'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, Users, TrendingUp, Crown, MapPin, MessageSquare, 
  Camera, Heart, Star, DollarSign, Activity, ArrowLeft,
  RefreshCw, BarChart3, Clock, AlertCircle, Inbox, Building2,
  Mail, Phone, Globe, CheckCircle, XCircle, Eye, MessageCircle
} from 'lucide-react';
import { useAdminStore } from '@/lib/stores/adminStore';
import { useBetaApplicationStore } from '@/store/betaApplicationStore';
import type { StoredUser } from '@/lib/stores/userManager';
import { formatTime } from '@/lib/utils';
import MemberManagement from '@/components/Admin/MemberManagement';
import BusinessUsersManagement from '@/components/Admin/BusinessUsersManagement';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, stats, refreshStats, logout } = useAdminStore();
  const { applications, loading, error, fetchApplications, updateStatus, getPendingCount } = useBetaApplicationStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'members' | 'business' | 'locations' | 'revenue' | 'beta'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<StoredUser[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Client-side mount kontrolü (hydration hatası önleme)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Kullanıcıları yükle (Postgres'ten)
  useEffect(() => {
    if (mounted && (activeTab === 'users' || activeTab === 'overview')) {
      console.log('👥 Kullanıcılar Postgres\'ten yükleniyor...');
      fetchUsers();
    }
  }, [activeTab, mounted]);

  // Kullanıcıları Postgres'ten çek
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${data.users.length} kullanıcı yüklendi`);
        // Postgres formatını StoredUser formatına çevir
        const formattedUsers: StoredUser[] = data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          membershipTier: user.membership_tier || 'free',
          joinDate: user.join_date || user.created_at,
          lastLogin: user.last_login,
          totalSpent: 0, // Postgres'te henüz yok
          aiCredits: user.ai_credits || 0,
          isActive: user.is_active !== false,
          profilePicture: user.profile_picture
        }));
        setAllUsers(formattedUsers);
        
        // İstatistikleri güncelle
        updateStatsFromUsers(formattedUsers);
      } else {
        console.error('❌ Kullanıcılar yüklenemedi:', data.error);
      }
    } catch (error) {
      console.error('❌ Kullanıcı yükleme hatası:', error);
    }
  };

  // Kullanıcılardan istatistikleri hesapla
  const updateStatsFromUsers = (users: StoredUser[]) => {
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.membershipTier && u.membershipTier !== 'free').length;
    const freeUsers = totalUsers - premiumUsers;
    
    // adminStore stats'ı güncelle
    refreshStats(); // Store'u güncelle
  };

  // Beta başvurularını yükle (Postgres'ten)
  useEffect(() => {
    if (mounted && activeTab === 'beta') {
      console.log('📋 Beta başvuruları yükleniyor...');
      fetchApplications();
    }
  }, [activeTab, mounted, fetchApplications]);

  // Admin kontrolü - localStorage yüklendikten sonra kontrol et
  useEffect(() => {
    if (!mounted) return;
    
    // Kısa bir delay ile localStorage'ın yüklenmesini bekle
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
      
      // localStorage'dan kontrol et
      const adminStorage = localStorage.getItem('admin-storage');
      if (adminStorage) {
        try {
          const { state } = JSON.parse(adminStorage);
          if (state?.isAdmin) {
            // Admin oturumu var, sayfada kal
            return;
          }
        } catch (e) {
          console.error('Admin storage parse hatası:', e);
        }
      }
      
      // isAdmin false ise login sayfasına yönlendir
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [mounted, isAdmin, router]);

  // Auth kontrolü devam ediyorsa loading göster
  if (!mounted || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Admin değilse hiçbir şey gösterme
  if (!isAdmin) {
    return null;
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Tab içerikleri
  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'members', label: 'Üye Yönetimi', icon: Crown },
    { id: 'business', label: 'Business Üyeler', icon: Building2 },
    { id: 'locations', label: 'Mekanlar', icon: MapPin },
    { id: 'revenue', label: 'Gelir', icon: DollarSign },
    { id: 'beta', label: 'Beta Başvuruları', icon: Inbox },
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
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
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
                value={allUsers.length.toLocaleString()}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                icon={Activity}
                label="Aktif Kullanıcı"
                value={allUsers.filter(u => u.isActive).length.toLocaleString()}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon={Crown}
                label="Premium Üye"
                value={allUsers.filter(u => u.membershipTier && u.membershipTier !== 'free').length.toLocaleString()}
                gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
              />
              <StatCard
                icon={DollarSign}
                label="Free Üye"
                value={allUsers.filter(u => !u.membershipTier || u.membershipTier === 'free').length.toLocaleString()}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              />
            </div>

            {/* Kullanıcı İstatistikleri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Kullanıcı Dağılımı
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Kayıtlı</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{allUsers.length}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Premium Üyeler</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {allUsers.filter(u => u.membershipTier && u.membershipTier !== 'free').length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Free Üyeler</p>
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {allUsers.filter(u => !u.membershipTier || u.membershipTier === 'free').length}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Son Kayıt Olan Kullanıcılar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Son Kayıt Olan Kullanıcılar
              </h3>
              <div className="space-y-3">
                {allUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                        {user.membershipTier && user.membershipTier !== 'free' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(user.joinDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {!mounted ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    icon={Users}
                    label="Toplam Kullanıcı"
                    value={allUsers.length}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                  />
                  <StatCard
                    icon={Crown}
                    label="Premium Üyeler"
                    value={allUsers.filter(u => u.membershipTier && u.membershipTier !== 'free').length}
                    gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
                  />
                  <StatCard
                    icon={Activity}
                    label="Free Üyeler"
                    value={allUsers.filter(u => !u.membershipTier || u.membershipTier === 'free').length}
                    gradient="bg-gradient-to-br from-gray-500 to-gray-600"
                  />
                </div>

                {/* Kullanıcı Listesi */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tüm Kullanıcılar</h3>
                    <button
                      onClick={() => fetchUsers()}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Yenile
                    </button>
                  </div>

                  {allUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Henüz kayıtlı kullanıcı yok</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allUsers.map((user) => (
                        <div
                          key={user.id}
                          className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* Kullanıcı Bilgileri */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-lg">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {user.name}
                                  </h4>
                                  {user.membershipTier && user.membershipTier !== 'free' && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                                      <Crown className="w-3 h-3" />
                                      {user.membershipTier.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                            </div>

                            {/* Premium Onay Butonları */}
                            <div className="flex items-center gap-2">
                              {(!user.membershipTier || user.membershipTier === 'free') ? (
                                <button
                                  onClick={async () => {
                                    if (confirm(`${user.name} kullanıcısına Premium üyelik verilsin mi?`)) {
                                      try {
                                        console.log('🔄 Premium veriliyor:', user.email);
                                        
                                        // Postgres'e kaydet
                                        const response = await fetch('/api/admin/users', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            userId: user.id,
                                            updates: { membershipTier: 'premium' }
                                          })
                                        });
                                        
                                        const data = await response.json();
                                        
                                        if (data.success) {
                                          console.log('✅ Premium verildi:', user.name);
                                          // Listeyi yeniden yükle
                                          await fetchUsers();
                                        } else {
                                          console.error('❌ Premium verme hatası:', data.error);
                                          alert('Premium üyelik verilemedi: ' + data.error);
                                        }
                                      } catch (error) {
                                        console.error('❌ Premium verme hatası:', error);
                                        alert('Premium üyelik verilemedi');
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg"
                                  title="Premium Üyelik Ver"
                                >
                                  <Crown className="w-4 h-4" />
                                  <span className="hidden sm:inline">Premium Yap</span>
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    if (confirm(`${user.name} kullanıcısının Premium üyeliği iptal edilsin mi?`)) {
                                      try {
                                        console.log('🔄 Premium iptal ediliyor:', user.email);
                                        
                                        // Postgres'ten kaldır
                                        const response = await fetch('/api/admin/users', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            userId: user.id,
                                            updates: { membershipTier: 'free' }
                                          })
                                        });
                                        
                                        const data = await response.json();
                                        
                                        if (data.success) {
                                          console.log('✅ Premium iptal edildi:', user.name);
                                          // Listeyi yeniden yükle
                                          await fetchUsers();
                                        } else {
                                          console.error('❌ Premium iptal hatası:', data.error);
                                          alert('Premium üyelik iptal edilemedi: ' + data.error);
                                        }
                                      } catch (error) {
                                        console.error('❌ Premium iptal hatası:', error);
                                        alert('Premium üyelik iptal edilemedi');
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                  title="Premium İptal Et"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span className="hidden sm:inline">İptal Et</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
            </motion.div>
              </>
            )}
          </div>
        )}

        {/* Member Management Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <MemberManagement />
          </div>
        )}

        {/* Business Users Management Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <BusinessUsersManagement />
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

        {/* Beta Başvuruları Tab */}
        {activeTab === 'beta' && (
          <div className="space-y-6">
            {/* Beta Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={Inbox}
                label="Bekleyen Başvuru"
                value={getPendingCount()}
                gradient="bg-gradient-to-br from-orange-500 to-red-500"
              />
              <StatCard
                icon={CheckCircle}
                label="Onaylanan"
                value={applications.filter(a => a.status === 'approved').length}
                gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              />
              <StatCard
                icon={MessageCircle}
                label="İletişimde"
                value={applications.filter(a => a.status === 'contacted').length}
                gradient="bg-gradient-to-br from-blue-500 to-indigo-500"
              />
              <StatCard
                icon={Building2}
                label="Toplam Başvuru"
                value={applications.length}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              />
            </div>

            {/* Applications List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-indigo-500" />
                  Beta Başvuruları
                </h3>
                <div className="flex items-center gap-2">
                  {getPendingCount() > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold animate-pulse">
                      {getPendingCount()} Yeni
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz beta başvurusu yok</p>
                    <p className="text-sm mt-2">Başvurular email olarak <strong>ercanerguler@gmail.com</strong> adresine geliyor</p>
                  </div>
                ) : (
                  applications.map((app) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-2 rounded-xl p-5 transition-all ${
                        app.status === 'pending'
                          ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/10'
                          : app.status === 'approved'
                          ? 'border-green-200 bg-green-50 dark:bg-green-900/10'
                          : app.status === 'contacted'
                          ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10'
                          : 'border-gray-200 bg-gray-50 dark:bg-gray-900/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                              {app.business_name}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              app.status === 'pending'
                                ? 'bg-orange-200 text-orange-800'
                                : app.status === 'approved'
                                ? 'bg-green-200 text-green-800'
                                : app.status === 'contacted'
                                ? 'bg-blue-200 text-blue-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}>
                              {app.status === 'pending' && '⏳ Bekliyor'}
                              {app.status === 'approved' && '✅ Onaylandı'}
                              {app.status === 'contacted' && '📞 İletişimde'}
                              {app.status === 'rejected' && '❌ Reddedildi'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {app.application_id} • {new Date(app.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <span className="font-semibold">{app.owner_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <a href={`mailto:${app.email}`} className="hover:underline text-blue-600 dark:text-blue-400">
                              {app.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Phone className="w-4 h-4 text-green-500" />
                            <a href={`tel:${app.phone}`} className="hover:underline text-green-600 dark:text-green-400">
                              {app.phone}
                            </a>
                          </div>
                          {app.website && (
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <Globe className="w-4 h-4 text-purple-500" />
                              <a href={app.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-600 dark:text-purple-400">
                                {app.website}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span className="text-gray-700 dark:text-gray-300">{app.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-700 dark:text-gray-300">{app.business_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700 dark:text-gray-300">Günlük: {app.average_daily} müşteri</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-700 dark:text-gray-300">{app.opening_hours}</span>
                          </div>
                        </div>
                      </div>

                      {app.goals.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🎯 Hedefler:</p>
                          <div className="flex flex-wrap gap-2">
                            {app.goals.map((goal, idx) => (
                              <span key={idx} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {app.additional_info && (
                        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">💬 Ek Bilgi:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{app.additional_info}</p>
                        </div>
                      )}

                      {app.admin_notes && (
                        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">📝 Admin Notu:</p>
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">{app.admin_notes}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a
                          href={`mailto:${app.email}?subject=City-V Beta Programı - ${app.business_name}&body=Merhaba ${app.owner_name},%0D%0A%0D%0A`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          Email Gönder
                        </a>
                        <a
                          href={`tel:${app.phone}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium"
                        >
                          <Phone className="w-4 h-4" />
                          Ara
                        </a>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(app.application_id, 'contacted')}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm font-medium"
                            >
                              <MessageCircle className="w-4 h-4" />
                              İletişime Geçildi
                            </button>
                            <button
                              onClick={() => updateStatus(app.application_id, 'approved')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Onayla
                            </button>
                            <button
                              onClick={() => updateStatus(app.application_id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              Reddet
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Beta Başvuruları Bilgi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Beta Başvuruları Email ile Geliyor
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Şu anda beta başvuruları email olarak <strong>ercanerguler@gmail.com</strong> adresine geliyor. 
                    Her başvuru için 2 email alıyorsunuz:
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Admin Bildirimi</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          İşletme bilgileri, iletişim detayları, hedefler ve tüm başvuru bilgileri
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Kullanıcı Onay Maili (İçerik)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Başvuru sahibine gidecek onay mesajının içeriği (konuda kullanıcının email adresi var)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                          Resend Ücretsiz Hesap Kısıtlaması
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                          Şu anda kullanıcılara otomatik email gitmiyor. Domain doğrulaması yapılırsa otomatik olarak gidecek.
                        </p>
                        <a 
                          href="mailto:ercanerguler@gmail.com"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          📧 Gmail'i Kontrol Et
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Database Entegrasyonu Bilgisi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Gelecek Özellikler
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Database entegrasyonu sonrası bu sayfada görebilecekleriniz:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📋 Başvuru Listesi</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Tüm başvuruları listele</li>
                        <li>• Tarih, işletme adı, durum</li>
                        <li>• Filtreleme ve arama</li>
                        <li>• Detaylı görünüm</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Durum Yönetimi</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Beklemede / Onaylandı / Reddedildi</li>
                        <li>• Durum değiştir</li>
                        <li>• Not ekle</li>
                        <li>• Takip sistemi</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📧 Email Yönetimi</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Otomatik onay maili gönder</li>
                        <li>• Red maili gönder</li>
                        <li>• Takip emaili gönder</li>
                        <li>• Email şablonları</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Analitik</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Başvuru istatistikleri</li>
                        <li>• Onay/Red oranları</li>
                        <li>• İşletme tipleri dağılımı</li>
                        <li>• Şehir bazlı analiz</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hızlı Linkler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔗 Hızlı Linkler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="mailto:ercanerguler@gmail.com"
                  className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                >
                  <Inbox className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Gmail'i Aç</span>
                </a>
                
                <a
                  href="/business-box/beta"
                  target="_blank"
                  className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition"
                >
                  <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Beta Formu</span>
                </a>
                
                <a
                  href="/business-box"
                  target="_blank"
                  className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                >
                  <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Business Box</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
