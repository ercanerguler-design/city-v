'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Clock, Calendar, BarChart3, Activity,
  ChevronRight, Zap, Target, ArrowUpRight, ArrowDownRight,
  Bell, MapPin, Coffee, DollarSign, Star,
  Smartphone, Eye, Heart, UserCheck, Wifi,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Comprehensive mock data generator
const generateMockData = () => {
  const now = new Date();
  const currentHour = now.getHours();
  
  const getRealisticCount = (hour: number) => {
    if (hour >= 7 && hour < 9) return Math.floor(Math.random() * 15) + 25;
    if (hour >= 9 && hour < 12) return Math.floor(Math.random() * 10) + 12;
    if (hour >= 12 && hour < 14) return Math.floor(Math.random() * 20) + 35;
    if (hour >= 14 && hour < 17) return Math.floor(Math.random() * 15) + 18;
    if (hour >= 17 && hour < 19) return Math.floor(Math.random() * 20) + 28;
    if (hour >= 19 && hour < 22) return Math.floor(Math.random() * 15) + 22;
    return Math.floor(Math.random() * 5) + 3;
  };

  const currentCount = getRealisticCount(currentHour);
  const capacity = 50;
  const occupancy = Math.round((currentCount / capacity) * 100);

  return {
    current: {
      count: currentCount,
      capacity,
      occupancy,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: Math.floor(Math.random() * 5) + 1,
    },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: getRealisticCount(i),
    })),
    weekly: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => ({
      day,
      count: Math.floor(Math.random() * 100) + (i >= 5 ? 180 : 120),
    })),
    demographics: [
      { range: '18-24', percentage: 25, count: 45 },
      { range: '25-34', percentage: 35, count: 63 },
      { range: '35-44', percentage: 20, count: 36 },
      { range: '45-54', percentage: 15, count: 27 },
      { range: '55+', percentage: 5, count: 9 },
    ],
    cityv: {
      profileViews: Math.floor(Math.random() * 200) + 1450,
      favorites: Math.floor(Math.random() * 50) + 287,
      rating: (4.5 + Math.random() * 0.4).toFixed(1),
      reviews: 178,
      checkIns: Math.floor(Math.random() * 30) + 95,
    },
    notifications: [
      {
        id: 1,
        type: 'quiet',
        title: '🎉 İşletmeniz şu an boş!',
        message: 'Sadece 12 kişi var, beklemeden gelin',
        time: '3 dk önce',
        sent: 234,
        opened: 89,
        clicked: 23,
        visited: 7,
      },
      {
        id: 2,
        type: 'campaign',
        title: '☕ Saat 14-16 arası %20 indirim',
        message: 'Tüm sıcak içeceklerde geçerli',
        time: '2 saat önce',
        sent: 567,
        opened: 234,
        clicked: 98,
        visited: 41,
      },
      {
        id: 3,
        type: 'event',
        title: '🍰 Yeni Ürün: Limonlu Cheesecake',
        message: 'Bugün özel fiyatla sizlerle',
        time: 'Bugün 09:00',
        sent: 892,
        opened: 445,
        clicked: 167,
        visited: 73,
      },
    ],
    staff: {
      current: 3,
      recommended: 4,
      efficiency: 87,
      cost: 2850,
      optimized: 2400,
    },
    revenue: {
      today: Math.floor(Math.random() * 2000) + 3500,
      yesterday: 4230,
      trend: '+8%',
      avgPerCustomer: 45,
    },
    activities: [
      { time: '1 dk', text: '2 yeni müşteri', icon: 'users', color: 'blue' },
      { time: '4 dk', text: 'Yoğunluk artıyor', icon: 'trending-up', color: 'yellow' },
      { time: '8 dk', text: '1 müşteri ayrıldı', icon: 'users', color: 'gray' },
      { time: '12 dk', text: 'AI öneri oluşturuldu', icon: 'zap', color: 'purple' },
    ],
  };
};

export default function DemoPage() {
  const [data, setData] = useState(generateMockData());
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'cityv' | 'notifications'>('overview');
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // İşletme adını belirle (kullanıcı giriş yapmışsa gerçek ismi, yoksa genel isim)
  const getBusinessName = () => {
    if (isAuthenticated && user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}'in İşletmesi`;
    }
    if (isAuthenticated && user?.email) {
      const emailPart = user.email.split('@')[0];
      return `${emailPart} İşletmesi`;
    }
    return 'Akıllı İşletme';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy < 30) return 'text-green-600 bg-green-50 border-green-200';
    if (occupancy < 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getOccupancyText = (occupancy: number) => {
    if (occupancy < 30) return '🟢 Boş';
    if (occupancy < 70) return '🟡 Normal';
    return '🔴 Yoğun';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl sticky top-0 z-50 border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75" />
                </div>
                <span className="text-sm font-black tracking-wider bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  CANLI DEMO
                </span>
              </div>
              <div className="hidden sm:block h-6 w-px bg-white/20" />
              <div className="hidden sm:flex items-center gap-2">
                <Coffee className="w-5 h-5 text-blue-300" />
                <span className="text-sm font-semibold">{getBusinessName()} - Kızılay</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 font-mono">
                {mounted ? lastUpdate.toLocaleTimeString('tr-TR') : '--:--:--'}
              </div>
              <button
                onClick={() => setIsLive(!isLive)}
                className={`text-sm px-5 py-2 rounded-lg transition font-semibold shadow-lg ${
                  isLive 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                {isLive ? '⏸️ Duraklat' : '▶️ Devam'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-8 flex gap-2 flex-wrap border border-blue-100">
          {[
            { id: 'overview', label: '📊 Genel Bakış', icon: BarChart3 },
            { id: 'analytics', label: '📈 Analizler', icon: TrendingUp },
            { id: 'cityv', label: '📱 City-V', icon: Smartphone },
            { id: 'notifications', label: '🔔 Bildirimler', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] px-5 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105'
                  : 'hover:bg-gray-100 text-gray-600 hover:scale-102'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB - Full Featured */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Current Occupancy Card */}
              <motion.div
                key={data.current.count}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getOccupancyColor(data.current.occupancy)}`}>
                    {getOccupancyText(data.current.occupancy)}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="text-4xl font-black text-gray-900 mb-1">
                    {data.current.count}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    / {data.current.capacity} kişi kapasiteli
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {data.current.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-green-500" />
                  )}
                  <span className={`text-sm font-bold ${
                    data.current.trend === 'up' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {data.current.change} kişi (son 5dk)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.current.occupancy}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${
                      data.current.occupancy < 30 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                      data.current.occupancy < 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                  />
                </div>
                <div className="text-right text-xs text-gray-500 mt-1 font-semibold">
                  %{data.current.occupancy} doluluk
                </div>
              </motion.div>

              {/* Revenue Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border-2 border-green-200">
                    {data.revenue.trend}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="text-4xl font-black text-gray-900 mb-1">
                    ₺{data.revenue.today.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Bugünkü ciro
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dün:</span>
                    <span className="font-bold text-gray-900">₺{data.revenue.yesterday.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kişi başı ort:</span>
                    <span className="font-bold text-gray-900">₺{data.revenue.avgPerCustomer}</span>
                  </div>
                </div>
              </div>

              {/* Staff Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border-2 border-purple-200">
                    %{data.staff.efficiency} verim
                  </span>
                </div>
                <div className="mb-3">
                  <div className="text-4xl font-black text-gray-900 mb-1">
                    {data.staff.current}→{data.staff.recommended}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Şu an → Öneri
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mevcut:</span>
                    <span className="font-bold text-gray-900">₺{data.staff.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Optimize:</span>
                    <span className="font-bold text-green-600">₺{data.staff.optimized}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs text-green-600 font-bold">
                      💰 Aylık ₺{(data.staff.cost - data.staff.optimized) * 30} tasarruf
                    </span>
                  </div>
                </div>
              </div>

              {/* City-V Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border-2 border-indigo-200">
                    ⭐ {data.cityv.rating}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="text-4xl font-black text-gray-900 mb-1">
                    {data.cityv.profileViews}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Bu ay görüntüleme
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Favoriler:
                    </span>
                    <span className="font-bold text-gray-900">{data.cityv.favorites}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Check-in:
                    </span>
                    <span className="font-bold text-gray-900">{data.cityv.checkIns}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  Saatlik Yoğunluk Analizi
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded" />
                    <span>Boş</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded" />
                    <span>Normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded" />
                    <span>Yoğun</span>
                  </div>
                </div>
              </div>
              
              <div className="relative h-72">
                <div className="absolute inset-0 flex items-end justify-between gap-1">
                  {data.hourly.map((item, index) => {
                    const height = (item.count / 50) * 100;
                    const isCurrentHour = item.hour === new Date().getHours();
                    return (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.02, duration: 0.5 }}
                        className="relative flex-1 group cursor-pointer"
                      >
                        <div className={`w-full rounded-t-lg transition-all duration-300 ${
                          isCurrentHour 
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg ring-2 ring-blue-400' 
                            : height < 30 
                              ? 'bg-gradient-to-t from-green-500 to-green-300 hover:from-green-600 hover:to-green-400' 
                              : height < 70 
                                ? 'bg-gradient-to-t from-yellow-500 to-yellow-300 hover:from-yellow-600 hover:to-yellow-400' 
                                : 'bg-gradient-to-t from-red-500 to-red-300 hover:from-red-600 hover:to-red-400'
                        } h-full`} />
                        
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                          <div className="font-bold">{String(item.hour).padStart(2, '0')}:00</div>
                          <div>{item.count} kişi</div>
                          {isCurrentHour && <div className="text-blue-300">Şu an</div>}
                        </div>
                        
                        {index % 3 === 0 && (
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-medium">
                            {String(item.hour).padStart(2, '0')}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Insights & Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Recommendations */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">AI Önerileri</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-gray-900 mb-1">Personel Optimizasyonu</div>
                        <div className="text-sm text-gray-600 mb-2">
                          14:00-17:00 arası 1 personel azaltabilirsiniz.
                        </div>
                        <div className="text-xs font-bold text-green-600 bg-green-50 inline-block px-2 py-1 rounded">
                          💰 Aylık ~₺13,500 tasarruf
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-gray-900 mb-1">Kampanya Önerisi</div>
                        <div className="text-sm text-gray-600 mb-2">
                          Pazartesi 10:00-12:00 "Şu an boş" bildirimi gönderin.
                        </div>
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                          📈 +18-24 müşteri tahmini
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-gray-900 mb-1">Hafta Sonu Hazırlığı</div>
                        <div className="text-sm text-gray-600 mb-2">
                          Cumartesi 13:00-15:00 %28 artış bekleniyor.
                        </div>
                        <div className="text-xs font-bold text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded">
                          👥 +1 personel öneririz
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities & System Status */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Canlı Aktiviteler</h3>
                </div>
                <div className="space-y-3 mb-6">
                  {data.activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.color === 'blue' ? 'bg-blue-100' :
                        activity.color === 'green' ? 'bg-green-100' :
                        activity.color === 'yellow' ? 'bg-yellow-100' :
                        activity.color === 'purple' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.icon === 'users' && <Users className={`w-5 h-5 ${
                          activity.color === 'blue' ? 'text-blue-600' :
                          activity.color === 'gray' ? 'text-gray-600' :
                          'text-blue-600'
                        }`} />}
                        {activity.icon === 'trending-up' && <TrendingUp className="w-5 h-5 text-yellow-600" />}
                        {activity.icon === 'zap' && <Zap className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{activity.text}</div>
                        <div className="text-xs text-gray-500">{activity.time} önce</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700 mb-3">Sistem Durumu</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Uptime
                      </span>
                      <span className="text-xs font-bold text-green-600">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        Doğruluk
                      </span>
                      <span className="text-xs font-bold text-blue-600">96.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-purple-500" />
                        Bağlantı
                      </span>
                      <span className="text-xs font-bold text-purple-600">Güçlü</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Weekly Trends */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Haftalık Trendler
              </h2>
              <div className="grid grid-cols-7 gap-3">
                {data.weekly.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs font-medium text-gray-500 mb-2">{item.day}</div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.count / 250) * 160}px` }}
                      transition={{ delay: index * 0.1 }}
                      className="h-40 bg-gradient-to-t from-blue-600 to-blue-400 rounded-lg mb-2 relative group cursor-pointer"
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-white font-bold text-sm">{item.count}</span>
                      </div>
                    </motion.div>
                    <div className="text-xs font-bold text-gray-900">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                Demografik Analiz
              </h2>
              <div className="space-y-4">
                {data.demographics.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {item.range} yaş
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {item.count} kişi (%{item.percentage})
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className={`h-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-purple-500' :
                          index === 2 ? 'bg-pink-500' :
                          index === 3 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CITY-V TAB */}
        {activeTab === 'cityv' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border-2 border-blue-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">City-V Entegrasyonu</h2>
                  <p className="text-gray-600">İşletmeniz City-V app'te nasıl görünüyor</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Profil Görüntüleme</span>
                  </div>
                  <div className="text-3xl font-black text-blue-600">{data.cityv.profileViews}</div>
                  <div className="text-xs text-gray-500 mt-1">Bu ay</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <span className="text-sm text-gray-600">Favorilere Ekleme</span>
                  </div>
                  <div className="text-3xl font-black text-pink-600">{data.cityv.favorites}</div>
                  <div className="text-xs text-gray-500 mt-1">Toplam</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">Değerlendirme</span>
                  </div>
                  <div className="text-3xl font-black text-yellow-600">{data.cityv.rating} / 5.0</div>
                  <div className="text-xs text-gray-500 mt-1">{data.cityv.reviews} yorum</div>
                </div>
              </div>

              {/* Live Status Badge */}
              <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">City-V'de Görünen Durum:</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getOccupancyText(data.current.occupancy)}
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg">
                    ✓ Beta Partner Rozeti Aktif
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 border-2 border-purple-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Push Bildirimler</h2>
                  <p className="text-gray-600">City-V kullanıcılarına gönderilen bildirimler</p>
                </div>
              </div>

              <div className="space-y-4">
                {data.notifications.map((notif) => (
                  <div key={notif.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="text-lg font-bold text-gray-900 mb-1">{notif.title}</div>
                          <div className="text-sm text-gray-600 mb-2">{notif.message}</div>
                          <div className="text-xs text-gray-500">{notif.time}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          notif.type === 'quiet' ? 'bg-green-100 text-green-600' :
                          notif.type === 'campaign' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {notif.type === 'quiet' ? 'Yoğunluk' :
                           notif.type === 'campaign' ? 'Kampanya' : 'Etkinlik'}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Gönderildi</div>
                          <div className="text-lg font-bold text-gray-900">{notif.sent}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Açıldı</div>
                          <div className="text-lg font-bold text-blue-600">
                            {notif.opened}
                            <span className="text-xs ml-1">({Math.round((notif.opened/notif.sent)*100)}%)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Tıklandı</div>
                          <div className="text-lg font-bold text-purple-600">
                            {notif.clicked}
                            <span className="text-xs ml-1">({Math.round((notif.clicked/notif.sent)*100)}%)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Ziyaret</div>
                          <div className="text-lg font-bold text-green-600">
                            {notif.visited}
                            <span className="text-xs ml-1">({Math.round((notif.visited/notif.clicked)*100)}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Conversion Funnel */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2 h-8">
                          <div className="flex-1 bg-blue-500 rounded-l h-full flex items-center justify-center text-white text-xs font-bold">
                            Açıldı
                          </div>
                          <div 
                            className="bg-purple-500 h-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ width: `${(notif.clicked/notif.opened)*100}%` }}
                          >
                            Tıklandı
                          </div>
                          <div 
                            className="bg-green-500 rounded-r h-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ width: `${(notif.visited/notif.clicked)*100}%` }}
                          >
                            Geldi
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-4">📊 Özet İstatistikler</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-black text-blue-600">
                      {data.notifications.reduce((acc, n) => acc + n.sent, 0)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Toplam Gönderim</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-black text-purple-600">
                      {Math.round(data.notifications.reduce((acc, n) => acc + (n.opened/n.sent)*100, 0) / data.notifications.length)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Ortalama Açılma</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-black text-green-600">
                      {data.notifications.reduce((acc, n) => acc + n.visited, 0)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Toplam Ziyaret</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl shadow-2xl p-8 md:p-12 mt-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Demo Beğendiniz Mi? 🚀
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Business Box ile bu dashboard'u işletmenizde kullanın. Gerçek zamanlı veri, AI analizleri ve daha fazlası.
            </p>
          </div>

          {/* Campaign Banner */}
          <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 mb-8 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10 text-center text-white">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-4">
                🔥 ÖZEL KAMPANYA - İLK 5 İŞLETME
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-4">
                %40 İndirimli Başlangıç Paketi!
              </h3>
              <div className="flex items-center justify-center gap-8 mb-6 flex-wrap">
                <div>
                  <div className="text-sm opacity-80 line-through">₺7,499</div>
                  <div className="text-5xl font-black">₺4,499</div>
                  <div className="text-sm">Cihaz (Tek Seferlik)</div>
                </div>
                <div className="text-4xl font-black">+</div>
                <div>
                  <div className="text-sm opacity-80 line-through">₺349/ay</div>
                  <div className="text-5xl font-black">₺249/ay</div>
                  <div className="text-sm">İlk 6 Ay Abonelik</div>
                </div>
              </div>
              <div className="inline-block px-6 py-3 bg-yellow-400 text-yellow-900 rounded-xl font-black text-lg mb-6">
                💰 Toplam ₺3,600 Tasarruf!
              </div>
              <a
                href="/business-box/beta"
                className="block w-full max-w-md mx-auto px-8 py-4 bg-white text-red-600 rounded-xl font-black text-lg hover:bg-yellow-50 transition shadow-2xl"
              >
                Hemen Başvur - Kontenjan Kapanmadan! 🔥
              </a>
            </div>
          </div>

          {/* Standard Pricing */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tek Cihaz Paketi */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-blue-300 transition">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Tek Cihaz Paketi</h3>
                <p className="text-gray-600">Tek nokta için ideal çözüm</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-black text-gray-900 mb-2">₺7,499</div>
                <div className="text-sm text-gray-500 mb-4">Cihaz (Tek Seferlik)</div>
                <div className="text-3xl font-black text-blue-600">₺349/ay</div>
                <div className="text-sm text-gray-500">Abonelik Bedeli</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>1 Business Box cihazı</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Gerçek zamanlı kalabalık takibi</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Temel raporlama</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>City-V entegrasyonu</span>
                </li>
              </ul>
              <a
                href="/business-box/beta"
                className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition text-center"
              >
                Başvur
              </a>
            </div>

            {/* Çoklu Cihaz Paketi */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-black">
                ⭐ POPÜLER
              </div>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black mb-2">Çoklu Cihaz Paketi</h3>
                  <p className="text-blue-100">Kurumsal işletmeler için</p>
                </div>
                <div className="text-center mb-8">
                  <div className="text-5xl font-black mb-2">₺13,999</div>
                  <div className="text-sm text-blue-100 mb-4">2+ Cihaz (Tek Seferlik)</div>
                  <div className="text-3xl font-black">₺599/ay</div>
                  <div className="text-sm text-blue-100">Abonelik Bedeli</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>2+ Business Box cihazı</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>Gelişmiş AI analizleri</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>Merkezi yönetim paneli</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>24/7 öncelikli destek</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    <span>API erişimi</span>
                  </li>
                </ul>
                <a
                  href="mailto:sce@scegrup.com?subject=City-V Business Box - Çoklu Cihaz Paketi Teklifi&body=Merhaba,%0A%0AÇoklu Cihaz Paketi hakkında bilgi almak istiyorum.%0A%0Aİşletme Adı:%0ATelefon:%0AŞube Sayısı:"
                  className="block w-full px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition text-center shadow-xl"
                >
                  İletişime Geç
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/business-box"
              className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition"
            >
              Tüm Özellikleri İncele
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Demo Info Banner */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <div className="font-bold text-gray-900 mb-2 text-lg">
                ℹ️ Bu Bir Demo Dashboard'dur
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                Bu sayfada gördüğünüz tüm veriler <strong>simülasyon</strong> ile üretilmiştir. 
                Gerçek sistemde veriler <strong>IoT cihazınızdan canlı olarak</strong> gelir, 
                AI analizleri <strong>işletmenize özel</strong> yapılır ve 
                City-V bildirimleri <strong>gerçek kullanıcılara</strong> ulaşır. 
                <span className="font-bold text-blue-600"> Beta programına katılarak</span> 
                kendi işletmenizde 3 ay boyunca ücretsiz test edebilirsiniz!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
