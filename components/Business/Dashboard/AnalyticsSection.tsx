'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Activity, Clock, Calendar, ArrowUp, ArrowDown,
  BarChart3, Smartphone, Bell, DollarSign, Eye, Heart, MapPin,
  UserCheck, Zap, Target, CheckCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const DateRangeReport = dynamic(() => import('./DateRangeReport'), { ssr: false });

interface HourlyData {
  hour: number;
  occupancy: number;
  level: string;
}

interface WeeklyTrend {
  day: string;
  date: string;
  visitors: number;
  avgOccupancy: number;
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  impact: string;
  priority: string;
}

interface RecentActivity {
  timestamp: string;
  occupancy: number;
  deviceName: string;
  locationName: string;
  action: string;
}

interface EntryExitData {
  location: string;
  entries: number;
  exits: number;
  net: number;
}

interface ZoneAnalysis {
  zone: string;
  avgOccupancy: number;
  maxOccupancy: number;
  level: string;
}

interface HeatmapData {
  location: string;
  hour: number;
  intensity: number;
}

interface EstimatedRevenue {
  today: number;
  yesterday: number;
  trend: number;
  message: string;
}

interface AnalyticsData {
  todayVisitors: number;
  visitorGrowth: number;
  activeCameras: number;
  totalCameras: number;
  averageOccupancy: number;
  crowdLevel: string;
  avgStayMinutes: number;
  hourlyData?: HourlyData[];
  weeklyTrend?: WeeklyTrend[];
  peakHours?: { hour: number; occupancy: number }[];
  quietHours?: { hour: number; occupancy: number }[];
  aiInsights?: AIInsight[];
  recentActivities?: RecentActivity[];
  entryExitData?: EntryExitData[];
  zoneAnalysis?: ZoneAnalysis[];
  heatmapData?: HeatmapData[];
  estimatedRevenue?: EstimatedRevenue;
}

export default function AnalyticsSection({ businessProfile }: { businessProfile: any }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'cityv' | 'notifications' | 'favorites'>('analytics');
  const [cityvStats, setCityvStats] = useState<any>(null);
  const [favoritesData, setFavoritesData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (businessProfile) {
      loadAnalytics();
      loadCityVStats();
      loadFavorites();
      
      // 30 saniyede bir güncelle
      const interval = setInterval(() => {
        loadAnalytics();
        loadCityVStats();
        loadFavorites();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [businessProfile]);

  const loadCityVStats = async () => {
    try {
      const businessId = businessProfile?.user_id || businessProfile?.id || businessProfile?.business_id;
      if (!businessId) return;

      const response = await fetch(`/api/business/track-view?businessId=${businessId}`);
      const data = await response.json();

      setCityvStats(data);
      console.log('📊 City-V stats loaded:', data);
    } catch (error) {
      console.error('❌ City-V stats load error:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const businessId = businessProfile?.user_id || businessProfile?.id || businessProfile?.business_id;
      if (!businessId) return;

      const response = await fetch(`/api/business/favorites?businessId=${businessId}`);
      const data = await response.json();

      setFavoritesData(data);
      console.log('⭐ Favorites loaded:', data);
    } catch (error) {
      console.error('❌ Favorites load error:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // businessProfile'dan user_id'yi al (bu bizim businessUserId'miz)
      const businessId = businessProfile?.user_id || businessProfile?.id || businessProfile?.business_id;
      
      if (!businessId) {
        console.error('❌ Business ID bulunamadı:', businessProfile);
        setLoading(false);
        return;
      }

      console.log('📊 Analytics yükleniyor - Business ID:', businessId);
      
      const response = await fetch(`/api/business/analytics?businessId=${businessId}`);
      const data = await response.json();

      console.log('📊 Analytics yanıt:', data);

      if (data.success) {
        setAnalytics(data);
      } else {
        console.error('❌ Analytics error:', data.error);
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Analytics load error:', error);
      setLoading(false);
    }
  };

  const getCrowdLevelColor = (level: string) => {
    const colors: Record<string, { bg: string; text: string; label: string }> = {
      'empty': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Boş' },
      'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Düşük' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Orta' },
      'high': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Yüksek' },
      'overcrowded': { bg: 'bg-red-100', text: 'text-red-700', label: 'Çok Kalabalık' }
    };
    return colors[level] || colors.empty;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yok</h3>
        <p className="text-gray-500">IoT cihazlarından henüz veri alınmadı</p>
      </div>
    );
  }

  const crowdColor = getCrowdLevelColor(analytics.crowdLevel);
  const currentOccupancy = Math.round(analytics.averageOccupancy);

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

  const getOccupancyBarColor = (occupancy: number) => {
    if (occupancy < 30) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (occupancy < 70) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 flex gap-2 flex-wrap border border-blue-100">
        {[
          { id: 'analytics', label: '📈 Analizler', icon: BarChart3 },
          { id: 'cityv', label: '📱 City-V', icon: Smartphone },
          { id: 'favorites', label: '⭐ Favoriler', icon: Heart },
          { id: 'notifications', label: '🔔 Bildirimler', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[120px] px-5 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Occupancy Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                {mounted && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getOccupancyColor(currentOccupancy)}`}>
                    {getOccupancyText(currentOccupancy)}
                  </span>
                )}
              </div>
              <div className="mb-3">
                <div className="text-4xl font-black text-gray-900 mb-1">{mounted ? analytics.todayVisitors : '--'}</div>
                <div className="text-sm text-gray-500 font-medium">Bugünkü ziyaretçi</div>
              </div>
              {mounted && (
                <div className="flex items-center gap-2 mb-3">
                  {analytics.visitorGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-bold ${analytics.visitorGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(analytics.visitorGrowth)}%
                  </span>
                </div>
              )}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                {mounted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentOccupancy}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${getOccupancyBarColor(currentOccupancy)}`}
                  />
                )}
              </div>
              <div className="text-right text-xs text-gray-500 mt-1 font-semibold">%{mounted ? currentOccupancy : '--'}</div>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                {mounted && <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border-2 border-gray-200">Bekleniyor</span>}
              </div>
              <div className="mb-3">
                <div className="text-4xl font-black text-gray-900 mb-1">₺0</div>
                <div className="text-sm text-gray-500 font-medium">Tahmini ciro</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-600">Durum:</span>
                  <span className="font-medium text-orange-600">{analytics.estimatedRevenue?.message || 'Kasa entegrasyonu bekleniyor'}</span>
                </div>
              </div>
            </div>

            {/* Cameras Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mb-3">
                <div className="text-4xl font-black text-gray-900 mb-1">{mounted ? analytics.activeCameras : '--'}/{mounted ? analytics.totalCameras : '--'}</div>
                <div className="text-sm text-gray-500 font-medium">Aktif kamera</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ort kalış:</span>
                  <span className="font-bold text-gray-900">{mounted ? analytics.avgStayMinutes : '--'}dk</span>
                </div>
              </div>
            </div>

            {/* City-V Quick */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                {mounted && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border-2 border-green-200">🚀 Canlı</span>}
              </div>
              <div className="mb-3">
                <div className="text-4xl font-black text-gray-900 mb-1">{mounted ? (cityvStats?.totalViews || 0) : '--'}</div>
                <div className="text-sm text-gray-500 font-medium">Toplam Görüntüleme</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-1"><Heart className="w-3 h-3" /> Favoriler:</span>
                  <span className="font-bold text-gray-900">{mounted ? (favoritesData?.totalFavorites || 0) : '--'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly & Weekly Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saatlik Yoğunluk Analizi */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Saatlik Yoğunluk Analizi
              </h3>
              {analytics.hourlyData && analytics.hourlyData.length > 0 ? (
                <div className="space-y-2">
                  {analytics.hourlyData.map((hour) => (
                    <div key={hour.hour} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-16">{hour.hour}:00</span>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div 
                          className={`h-full ${getOccupancyBarColor(hour.occupancy)} transition-all duration-300`}
                          style={{ width: `${Math.min(hour.occupancy * 3, 100)}%` }}
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
                          {hour.occupancy} kişi
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        hour.level === 'Yoğun' ? 'bg-red-100 text-red-700' :
                        hour.level === 'Normal' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {hour.level === 'Yoğun' ? '🔴' : hour.level === 'Normal' ? '🟡' : '🟢'} {hour.level}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2" />
                  <p>Saatlik veri bekleniyor...</p>
                </div>
              )}
            </div>

            {/* Haftalık Trend */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Haftalık Trend & Demografik
              </h3>
              {analytics.weeklyTrend && analytics.weeklyTrend.length > 0 ? (
                <div className="space-y-3">
                  {analytics.weeklyTrend.map((day, index) => {
                    const maxVisitors = Math.max(...analytics.weeklyTrend!.map(d => d.visitors));
                    const percentage = (day.visitors / maxVisitors) * 100;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">{day.day}</span>
                          <span className="font-bold text-gray-900">{day.visitors} ziyaretçi</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-2" />
                  <p>Haftalık veri bekleniyor...</p>
                </div>
              )}
            </div>
          </div>

          {/* Gelişmiş Analizler */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Giriş-Çıkış Analizi */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                Giriş-Çıkış Analizi
              </h3>
              {analytics.entryExitData && analytics.entryExitData.length > 0 ? (
                <div className="space-y-3">
                  {analytics.entryExitData.map((data, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-2">{data.location}</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="text-green-600 font-bold flex items-center justify-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            {data.entries}
                          </div>
                          <div className="text-xs text-gray-500">Giriş</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 font-bold flex items-center justify-center gap-1">
                            <ArrowDownRight className="w-3 h-3" />
                            {data.exits}
                          </div>
                          <div className="text-xs text-gray-500">Çıkış</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-bold ${data.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {data.net > 0 ? '+' : ''}{data.net}
                          </div>
                          <div className="text-xs text-gray-500">Net</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ArrowUpRight className="w-12 h-12 mx-auto mb-2" />
                  <p>Giriş-çıkış verisi bekleniyor...</p>
                </div>
              )}
            </div>

            {/* Bölge Yoğunluk Analizi */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Bölge Yoğunluk Analizi
              </h3>
              {analytics.zoneAnalysis && analytics.zoneAnalysis.length > 0 ? (
                <div className="space-y-3">
                  {analytics.zoneAnalysis.map((zone, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{zone.zone}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          zone.level === 'Yoğun' ? 'bg-red-100 text-red-700' :
                          zone.level === 'Normal' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {zone.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Ort: {zone.avgOccupancy} kişi</span>
                        <span>Maks: {zone.maxOccupancy} kişi</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getOccupancyBarColor(zone.avgOccupancy)} transition-all duration-300`}
                          style={{ width: `${Math.min((zone.avgOccupancy / zone.maxOccupancy) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Bölge verisi bekleniyor...</p>
                </div>
              )}
            </div>

            {/* Isı Haritası Özeti */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                Isı Haritası Analizi
              </h3>
              {analytics.heatmapData && analytics.heatmapData.length > 0 ? (
                <div className="space-y-3">
                  {/* En yoğun lokasyonları göster */}
                  {(() => {
                    const locationIntensity = analytics.heatmapData.reduce((acc: any, item) => {
                      if (!acc[item.location]) acc[item.location] = 0;
                      acc[item.location] += item.intensity;
                      return acc;
                    }, {});
                    
                    return Object.entries(locationIntensity)
                      .sort((a: any, b: any) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([location, intensity]: any, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-red-500' :
                            index === 1 ? 'bg-orange-500' :
                            index === 2 ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}>
                            {Math.round(intensity)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {typeof location === 'string' 
                                ? location 
                                : typeof location === 'object' && location !== null && 'address' in location
                                  ? location.address 
                                  : 'Konum bilgisi yok'}
                            </div>
                            <div className="text-xs text-gray-500">Toplam yoğunluk skoru</div>
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-2" />
                  <p>Isı haritası verisi bekleniyor...</p>
                </div>
              )}
            </div>
          </div>

          {/* AI & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-purple-900">AI Önerileri</h3>
              </div>
              <div className="space-y-4">
                {analytics.aiInsights && analytics.aiInsights.length > 0 ? (
                  analytics.aiInsights.map((insight, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        {insight.type === 'optimization' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                        {insight.type === 'campaign' && <Target className="w-5 h-5 text-blue-500 mt-0.5" />}
                        {insight.type === 'preparation' && <Activity className="w-5 h-5 text-orange-500 mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">{insight.title}</p>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          <p className="text-xs font-semibold text-purple-600">{insight.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">IoT Kamera Kurulumu</p>
                          <p className="text-sm text-gray-600 mb-2">
                            IoT kameralarınızı kurduktan sonra gerçek zamanlı yoğunluk analizine erişin.
                          </p>
                          <p className="text-xs font-semibold text-blue-600">🎯 Müşteri davranışlarını anlayın</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">Akıllı Bildirimler</p>
                          <p className="text-sm text-gray-600 mb-2">
                            City-V uygulaması üzerinden müşterilerinize anlık yoğunluk bildirimleri gönderin.
                          </p>
                          <p className="text-xs font-semibold text-green-600">📈 Boş saatlerde +%30 doluluk artışı</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">Personel Optimizasyonu</p>
                          <p className="text-sm text-gray-600 mb-2">
                            Yoğunluk trendlerine göre vardiya planlaması yapın, maliyetleri optimize edin.
                          </p>
                          <p className="text-xs font-semibold text-orange-600">💰 Aylık ortalama ₺15,000 tasarruf</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <p className="font-bold text-purple-900">Hızlı Başlangıç</p>
                      </div>
                      <p className="text-sm text-purple-800">
                        Kameralar menüsünden akıllı kameralarınızı ekleyin ve veriler burada görünmeye başlasın! 🚀
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Canlı Aktiviteler</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {analytics.recentActivities && analytics.recentActivities.length > 0 ? (
                  analytics.recentActivities.map((activity, index) => {
                    const timeAgo = new Date(activity.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.occupancy > 15 ? 'bg-red-100' : activity.occupancy > 8 ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <Users className={`w-5 h-5 ${
                            activity.occupancy > 15 ? 'text-red-600' : activity.occupancy > 8 ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.deviceName} • {timeAgo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{activity.occupancy}</p>
                          <p className="text-xs text-gray-500">kişi</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Henüz aktivite yok</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CITY-V TAB */}
      {activeTab === 'cityv' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Profil İstatistikleri</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-600">Toplam Görüntülenme</p>
                      <p className="text-2xl font-bold text-gray-900">{cityvStats?.totalViews || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Bugün</p>
                    <p className="text-lg font-bold text-indigo-600">{cityvStats?.todayViews || 0}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Harita Görüntülenme</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {cityvStats?.sourceBreakdown?.find((s: any) => s.source === 'map')?.views || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-pink-600" />
                    <div>
                      <p className="text-sm text-gray-600">Favorilere Ekleme</p>
                      <p className="text-2xl font-bold text-gray-900">{favoritesData?.totalFavorites || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Haftalık Trend */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-indigo-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Haftalık Trend</h3>
              <div className="space-y-3">
                {cityvStats?.weeklyViews && cityvStats.weeklyViews.length > 0 ? (
                  cityvStats.weeklyViews.slice(0, 7).map((day: any) => (
                    <div key={day.date} className="flex items-center gap-3">
                      <div className="text-sm text-gray-600 w-24">
                        {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((day.views / (cityvStats.weeklyViews[0]?.views || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-900 w-12 text-right">{day.views}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Henüz veri yok</p>
                )}
              </div>
            </div>
          </div>

          {/* En Çok Görüntülenen Lokasyonlar */}
          {cityvStats?.topLocations && cityvStats.topLocations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-indigo-600" />
                En Çok Görüntülenen Lokasyonlar
              </h3>
              <div className="space-y-3">
                {cityvStats.topLocations.map((loc: any, index: number) => (
                  <div key={loc.locationId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{loc.locationName}</h4>
                      <p className="text-sm text-gray-600 capitalize">{loc.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{loc.viewCount}</p>
                      <p className="text-xs text-gray-500">görüntülenme</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Favoriler İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Toplam</span>
              </div>
              <h3 className="text-4xl font-black mb-1">{favoritesData?.totalFavorites || 0}</h3>
              <p className="text-sm opacity-90">Toplam Favori</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Bugün</span>
              </div>
              <h3 className="text-4xl font-black mb-1">{favoritesData?.todayFavorites || 0}</h3>
              <p className="text-sm opacity-90">Yeni Favori</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">7 Gün</span>
              </div>
              <h3 className="text-4xl font-black mb-1">{favoritesData?.weekFavorites || 0}</h3>
              <p className="text-sm opacity-90">Haftalık</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">30 Gün</span>
              </div>
              <h3 className="text-4xl font-black mb-1">{favoritesData?.monthFavorites || 0}</h3>
              <p className="text-sm opacity-90">Aylık</p>
            </div>
          </div>

          {/* Kategori Dağılımı */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Kategori Dağılımı
            </h3>
            <div className="space-y-3">
              {favoritesData?.categoryBreakdown && favoritesData.categoryBreakdown.length > 0 ? (
                favoritesData.categoryBreakdown.map((cat: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold capitalize">{cat.location_category || 'Diğer'}</span>
                        <span className="text-gray-600">{cat.count} favori</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-rose-600 h-2 rounded-full transition-all"
                          style={{ width: `${(cat.count / favoritesData.totalFavorites) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz favori eklenmemiş</p>
              )}
            </div>
          </div>

          {/* Son Favoriler Listesi */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-600" />
              Son Eklenen Favoriler
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {favoritesData?.recentFavorites && favoritesData.recentFavorites.length > 0 ? (
                favoritesData.recentFavorites.map((fav: any) => (
                  <div key={fav.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="p-3 bg-pink-100 rounded-xl">
                      <Heart className="w-6 h-6 text-pink-600 fill-current" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{fav.location_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{fav.location_address}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold capitalize">
                          {fav.location_category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(fav.added_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg border">
                      {fav.source === 'map' ? '🗺️ Harita' : fav.source === 'list' ? '📋 Liste' : '🔍 Arama'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz hiç favori eklenmemiş</p>
                  <p className="text-sm text-gray-400 mt-2">Kullanıcılar City-V haritasından işletmenizi favorilerine ekleyebilir</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Bildirimler</h3>
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Henüz gönderilmiş bildirim bulunmuyor</p>
              <p className="text-sm text-gray-400 mt-2">Yoğunluk durumuna göre otomatik bildirimler gönderebilirsiniz</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* DATE RANGE REPORT - Always visible */}
      {mounted && businessProfile && (
        <div className="mt-6">
          <DateRangeReport businessUserId={businessProfile.user_id || businessProfile.id} />
        </div>
      )}

    </div>
  );
}
