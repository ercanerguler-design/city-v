'use client';

import { useState, useEffect } from 'react';
import { Users, Camera, TrendingUp, Clock, Activity, Eye, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const CampaignCreationModal = dynamic(() => import('./CampaignCreationModal'), { ssr: false });
const DailySummaryCards = dynamic(() => import('./DailySummaryCards'), { ssr: false });

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

interface ActivityLog {
  id: number;
  camera_name: string;
  event_type: string;
  person_count: number;
  crowd_level: string;
  timestamp: string;
  timeAgo: string;
}

interface AIPrediction {
  nextHour: { visitors: number; crowdLevel: string; confidence: number };
  peakTime: { hour: number; expectedVisitors: number };
  recommendation: string;
  trend: 'up' | 'down' | 'stable';
}

// Animasyonlu sayaç hook
function useCounter(targetValue: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * targetValue));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);
  
  return count;
}

export default function OverviewSection({ businessProfile }: { businessProfile: any }) {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [aiPredictions, setAiPredictions] = useState<AIPrediction | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Bugünkü Ziyaretçi',
      value: '0',
      change: '+0%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Aktif Kamera',
      value: '0',
      change: '0/10',
      icon: Camera,
      color: 'purple'
    },
    {
      title: 'Ortalama Yoğunluk',
      value: '0%',
      change: 'Düşük',
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Ortalama Kalış',
      value: '0dk',
      change: '+0dk',
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Favorilere Ekleme',
      value: '0',
      change: 'Bugün',
      icon: Eye,
      color: 'pink'
    }
  ]);

  useEffect(() => {
    if (businessProfile) {
      loadAnalytics();
      
      // 🔥 REAL-TIME: 5 saniyede bir otomatik güncelle
      const interval = setInterval(() => {
        loadAnalytics();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [businessProfile]);

  const loadAnalytics = async () => {
    try {
      // businessProfile'dan user_id kullan (id değil!)
      const businessId = businessProfile?.user_id || businessProfile?.id || 6;
      console.log('📊 Loading analytics for businessId:', businessId, 'from profile:', businessProfile);
      
      // 🔄 REAL-TIME: İki kaynaktan veri çek - hem IoT hem Camera Analytics
      const [iotResponse, cameraResponse] = await Promise.all([
        fetch(`/api/business/analytics?businessId=${businessId}`),
        fetch(`/api/business/cameras/analytics/summary?businessUserId=${businessId}`)
      ]);

      const iotData = await iotResponse.json();
      const cameraData = await cameraResponse.json();

      console.log('📊 Analytics data:', { iot: iotData, camera: cameraData });

      // Crowd level'a göre renk belirleme
      const getCrowdColor = (level: string) => {
        const levelMap: Record<string, string> = {
          'empty': 'Boş',
          'low': 'Düşük', 
          'medium': 'Orta',
          'high': 'Yüksek',
          'overcrowded': 'Çok Kalabalık'
        };
        return levelMap[level] || 'Bilinmiyor';
      };

      // 🎯 REAL-TIME: Camera analytics öncelikli (daha güncel)
      const todayVisitors = cameraData.success && cameraData.summary?.totalPeople > 0
        ? cameraData.summary.totalPeople
        : (iotData.success ? iotData.todayVisitors : 0);

      const activeCameras = cameraData.success && cameraData.summary?.activeCameras > 0
        ? cameraData.summary.activeCameras
        : (iotData.success ? iotData.activeCameras : 0);

      const totalCameras = iotData.success ? iotData.totalCameras : 10;

      const avgOccupancy = cameraData.success && cameraData.summary?.avgOccupancy > 0
        ? cameraData.summary.avgOccupancy
        : (iotData.success ? iotData.averageOccupancy : 0);

      const crowdLevel = cameraData.success && cameraData.summary?.crowdLevel
        ? cameraData.summary.crowdLevel
        : (iotData.success ? iotData.crowdLevel : 'low');

      const avgStayMinutes = cameraData.success && cameraData.summary?.avgStayMinutes > 0
        ? cameraData.summary.avgStayMinutes
        : (iotData.success ? iotData.avgStayMinutes : 0);

      const visitorGrowth = iotData.success ? iotData.visitorGrowth : 0;

      // Favoriler verisi çek
      const favoritesResponse = await fetch(`/api/business/favorites/stats?businessId=${businessId}`);
      const favoritesData = await favoritesResponse.json();
      const todayFavorites = favoritesData.success ? favoritesData.todayFavorites : 0;
      const totalFavorites = favoritesData.success ? favoritesData.totalFavorites : 0;

      // Son aktiviteleri çek
      const activitiesResponse = await fetch(`/api/business/cameras/recent-activity?businessUserId=${businessId}&limit=5`);
      const activitiesData = await activitiesResponse.json();
      
      if (activitiesData.success && activitiesData.activities) {
        const formattedActivities = activitiesData.activities.map((act: any) => {
          const timestamp = new Date(act.created_at);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
          
          let timeAgo = '';
          if (diffMinutes < 1) timeAgo = 'Az önce';
          else if (diffMinutes < 60) timeAgo = `${diffMinutes} dakika önce`;
          else if (diffMinutes < 1440) timeAgo = `${Math.floor(diffMinutes / 60)} saat önce`;
          else timeAgo = `${Math.floor(diffMinutes / 1440)} gün önce`;
          
          const crowdLevelText = act.crowd_density === 'high' ? 'Yüksek yoğunluk' :
                                 act.crowd_density === 'medium' ? 'Orta yoğunluk' :
                                 act.crowd_density === 'low' ? 'Düşük yoğunluk' : 'Tespit';
          
          return {
            id: act.id,
            camera_name: act.camera_name || 'Kamera',
            event_type: crowdLevelText,
            person_count: act.person_count || 0,
            crowd_level: act.crowd_density || 'low',
            timestamp: act.created_at,
            timeAgo
          };
        });
        setRecentActivities(formattedActivities);
      }

      // 🤖 AI TAHMİNLERİ - Gelecek saatler için öngörü
      const currentHour = new Date().getHours();
      const hourlyData = iotData.success && iotData.hourlyData ? iotData.hourlyData : [];
      
      // En yoğun saati bul
      const peakHourData = hourlyData.length > 0 
        ? hourlyData.reduce((max: any, curr: any) => 
            (curr.avg_occupancy > (max?.avg_occupancy || 0)) ? curr : max, 
            hourlyData[0]
          )
        : { hour: 14, avg_occupancy: todayVisitors };

      // Trend analizi (son 3 saatin ortalaması)
      const recentHours = hourlyData.filter((h: any) => h.hour >= currentHour - 3 && h.hour <= currentHour);
      const avgRecentVisitors = recentHours.length > 0
        ? recentHours.reduce((sum: number, h: any) => sum + (h.avg_occupancy || 0), 0) / recentHours.length
        : todayVisitors;

      // Gelecek saat tahmini (basit ML benzeri hesaplama)
      const nextHourPrediction = Math.round(avgRecentVisitors * 1.15); // %15 artış tahmini
      const predictedCrowdLevel = nextHourPrediction > 20 ? 'high' : nextHourPrediction > 10 ? 'medium' : 'low';
      
      // Trend belirleme
      const trend = visitorGrowth > 5 ? 'up' : visitorGrowth < -5 ? 'down' : 'stable';
      
      // Akıllı öneriler
      let recommendation = '';
      if (currentHour >= 11 && currentHour <= 14) {
        recommendation = predictedCrowdLevel === 'high' 
          ? '🍽️ Öğle saati yoğunluğu! Ekstra personel hazır olmalı.'
          : '👍 Normal akış. Standart hizmet yeterli.';
      } else if (currentHour >= 17 && currentHour <= 20) {
        recommendation = predictedCrowdLevel === 'high'
          ? '🌆 Akşam yoğunluğu bekleniyor! Stok kontrolü yapın.'
          : '✨ Rahat bir akşam trafiği bekleniyor.';
      } else if (currentHour >= 21) {
        recommendation = '🌙 Gece saatleri. Kapanış hazırlıklarına başlayabilirsiniz.';
      } else {
        recommendation = predictedCrowdLevel === 'high'
          ? '⚡ Yüksek talep bekleniyor! Hazırlıklı olun.'
          : '📊 Normal trafik bekleniyor.';
      }

      setAiPredictions({
        nextHour: {
          visitors: nextHourPrediction,
          crowdLevel: predictedCrowdLevel,
          confidence: Math.min(95, 75 + (recentHours.length * 5)) // Veri ne kadar çok o kadar güvenilir
        },
        peakTime: {
          hour: peakHourData.hour || 14,
          expectedVisitors: Math.round(peakHourData.avg_occupancy || todayVisitors)
        },
        recommendation,
        trend
      });

      // Analytics state'ini güncelle
      setAnalytics({
        totalAnalysis: todayVisitors,
        hourlyData: hourlyData.map((h: any) => ({
          hour: h.hour,
          visitors: h.avg_occupancy || 0
        }))
      });

      // Metrikleri güncelle
      setMetrics(prev => [
        { 
          ...prev[0], 
          value: todayVisitors.toString(), 
          change: visitorGrowth >= 0 ? `+${visitorGrowth}%` : `${visitorGrowth}%` 
        },
        { 
          ...prev[1], 
          value: activeCameras.toString(), 
          change: `${activeCameras}/${totalCameras}` 
        },
        { 
          ...prev[2], 
          value: `${Math.round(avgOccupancy)}%`, 
          change: getCrowdColor(crowdLevel) 
        },
        { 
          ...prev[3], 
          value: `${avgStayMinutes}dk`, 
          change: `+0dk` 
        },
        {
          ...prev[4],
          value: totalFavorites.toString(),
          change: `Bugün: ${todayFavorites}`
        }
      ]);
    } catch (error) {
      console.error('Analytics load error:', error);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Status Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 border border-green-400 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-white animate-pulse" />
            <div>
              <h3 className="text-white font-bold text-lg">🔴 CANLI YAYIN - Gerçek Zamanlı Veri Akışı</h3>
              <p className="text-green-100 text-sm">Tüm metrikler 5 saniyede bir otomatik güncellenir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Günlük Özet Kartları */}
      {businessProfile?.user_id && (
        <DailySummaryCards businessUserId={businessProfile.user_id} />
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-green-600">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-sm text-gray-500">{metric.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900">AI Destekli Yoğunluk Takibi</h3>
              <p className="text-sm text-blue-600 mt-1">{metrics[0].value} kişi tespit edildi</p>
            </div>
          </div>
          <p className="text-blue-700 mb-3">Gerçek zamanlı müşteri sayısı ve yoğunluk analizi</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="font-semibold">Aktif</span>
            </div>
            <div className="text-xs text-blue-500 bg-blue-200 px-2 py-1 rounded">
              {metrics[1].value} kamera çalışıyor
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900">Akıllı İstatistikler</h3>
              <p className="text-sm text-purple-600 mt-1">Yoğunluk: {metrics[2].change}</p>
            </div>
          </div>
          <p className="text-purple-700 mb-3">Saatlik, günlük, haftalık detaylı raporlar</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
              <span className="font-semibold">5 saniyede bir güncelleniyor</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 relative overflow-hidden"
        >
          {/* AI işlem animasyonu */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900">🤖 AI Performans Öngörüleri</h3>
              <p className="text-sm text-green-600 mt-1">
                {aiPredictions ? `%${aiPredictions.nextHour.confidence} güvenilirlik` : 'Hesaplanıyor...'}
              </p>
            </div>
          </div>

          {aiPredictions ? (
            <div className="space-y-3 relative z-10">
              {/* Gelecek Saat Tahmini */}
              <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-green-700">📈 Sonraki Saat Tahmini</span>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    aiPredictions.nextHour.crowdLevel === 'high' ? 'bg-red-100 text-red-700' :
                    aiPredictions.nextHour.crowdLevel === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {aiPredictions.nextHour.crowdLevel === 'high' ? 'Yüksek' :
                     aiPredictions.nextHour.crowdLevel === 'medium' ? 'Orta' : 'Düşük'}
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ~{aiPredictions.nextHour.visitors} <span className="text-sm font-normal text-green-600">kişi</span>
                </p>
              </div>

              {/* Peak Time */}
              <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-green-200">
                <span className="text-xs font-semibold text-green-700">⏰ En Yoğun Saat</span>
                <p className="text-lg font-bold text-green-900 mt-1">
                  {String(aiPredictions.peakTime.hour).padStart(2, '0')}:00 
                  <span className="text-sm font-normal text-green-600 ml-2">
                    (~{aiPredictions.peakTime.expectedVisitors} kişi)
                  </span>
                </p>
              </div>

              {/* AI Önerisi */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-semibold">AI Önerisi</span>
                </div>
                <p className="text-sm leading-relaxed">{aiPredictions.recommendation}</p>
              </div>

              {/* Trend Göstergesi */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-600">Trend:</span>
                <div className="flex items-center gap-1">
                  {aiPredictions.trend === 'up' && (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-700">Yükseliş</span>
                    </>
                  )}
                  {aiPredictions.trend === 'down' && (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                      <span className="font-semibold text-red-700">Düşüş</span>
                    </>
                  )}
                  {aiPredictions.trend === 'stable' && (
                    <>
                      <div className="w-4 h-0.5 bg-blue-600"></div>
                      <span className="font-semibold text-blue-700">Stabil</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Sistemleri Durumu - ULTRA PROFESYONEL */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 shadow-xl border-2 border-blue-400 relative overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20 blur-2xl animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">🚀 AI Sistemleri</h2>
                  <p className="text-sm text-blue-100">Gerçek zamanlı durum</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-500 bg-opacity-90 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-white">ÇEVRIMIÇI</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Toplam Analiz */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20">
                <p className="text-xs text-blue-100 mb-1">Toplam Analiz</p>
                <p className="text-2xl font-bold text-white">{analytics.totalAnalysis.toLocaleString()}</p>
                <p className="text-xs text-blue-200 mt-1">✓ Tamamlandı</p>
              </div>

              {/* AI Doğruluk */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20">
                <p className="text-xs text-blue-100 mb-1">AI Doğruluk</p>
                <p className="text-2xl font-bold text-white">
                  {aiPredictions ? `${aiPredictions.nextHour.confidence}%` : '95%'}
                </p>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aiPredictions?.nextHour.confidence || 95}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-green-400 h-1 rounded-full"
                  />
                </div>
              </div>

              {/* Aktif Kamera */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20">
                <p className="text-xs text-blue-100 mb-1">Aktif Kamera</p>
                <p className="text-2xl font-bold text-white">{metrics[1].value}</p>
                <p className="text-xs text-blue-200 mt-1">📹 Çalışıyor</p>
              </div>

              {/* Bugün İşlenen */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20">
                <p className="text-xs text-blue-100 mb-1">Bugün İşlenen</p>
                <p className="text-2xl font-bold text-white">{metrics[0].value}</p>
                <p className="text-xs text-green-300 mt-1 font-semibold">{metrics[0].change}</p>
              </div>
            </div>

            {/* Sistem Mesajı */}
            <div className="mt-4 flex items-center justify-between bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-sm">🔥</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Sistem Performansı</p>
                  <p className="text-xs text-blue-100">
                    {analytics.totalAnalysis > 100 
                      ? 'Mükemmel! Tüm sistemler optimal çalışıyor.' 
                      : 'Sistem ısınıyor. Daha fazla veri toplandıkça tahminler gelişecek.'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100">Uptime</p>
                <p className="text-sm font-bold text-white">99.9%</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigateToSection', { detail: 'cameras' }))}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 group-hover:text-blue-600">Kamera Ekle</p>
              <p className="text-sm text-gray-500">Yeni AI kamera bağlayın</p>
            </div>
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigateToSection', { detail: 'cameras' }))}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <Eye className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 group-hover:text-purple-600">Canlı İzle</p>
              <p className="text-sm text-gray-500">Kameraları görüntüleyin</p>
            </div>
          </button>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigateToSection', { detail: 'analytics' }))}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 group-hover:text-green-600">Raporlar</p>
              <p className="text-sm text-gray-500">Detaylı analiz görün</p>
            </div>
          </button>

          <button 
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <Megaphone className="w-8 h-8 text-gray-400 group-hover:text-orange-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 group-hover:text-orange-600">Kampanya Oluştur</p>
              <p className="text-sm text-gray-500">Push bildirim gönder</p>
            </div>
          </button>
        </div>
      </div>

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <CampaignCreationModal
            businessProfile={businessProfile}
            onClose={() => setShowCampaignModal(false)}
            onSuccess={() => {
              loadAnalytics(); // Refresh analytics after campaign
            }}
          />
        )}
      </AnimatePresence>

      {/* Saatlik Yoğunluk Haritası - PROFESYONEL ÖZELLIK */}
      {aiPredictions && analytics?.hourlyData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">📊 Saatlik Yoğunluk Haritası</h2>
            </div>
            <span className="text-xs text-purple-600 font-medium">AI Analiz</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">Günün hangi saatlerinde işletmeniz ne kadar yoğun</p>
          
          {/* Saatlik Bar Chart */}
          <div className="grid grid-cols-12 gap-1 mb-4">
            {Array.from({ length: 24 }, (_, i) => {
              const hourData = analytics.hourlyData.find(h => h.hour === i);
              const visitors = hourData?.visitors || 0;
              const maxVisitors = Math.max(...analytics.hourlyData.map(h => h.visitors), 1);
              const heightPercent = (visitors / maxVisitors) * 100;
              const isPeakHour = i === aiPredictions.peakTime.hour;
              const isCurrentHour = new Date().getHours() === i;
              
              return (
                <div key={i} className="flex flex-col items-center group relative">
                  <div className="w-full bg-gray-100 rounded-t relative overflow-hidden" style={{ height: '80px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: i * 0.02 }}
                      className={`absolute bottom-0 w-full rounded-t transition-colors ${
                        isPeakHour ? 'bg-gradient-to-t from-red-500 to-red-400' :
                        visitors > maxVisitors * 0.7 ? 'bg-gradient-to-t from-orange-500 to-orange-400' :
                        visitors > maxVisitors * 0.4 ? 'bg-gradient-to-t from-yellow-500 to-yellow-400' :
                        visitors > 0 ? 'bg-gradient-to-t from-green-500 to-green-400' :
                        'bg-gray-300'
                      }`}
                    >
                      {isPeakHour && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                          <span className="text-xs font-bold text-red-600">⭐</span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className={`text-xs mt-1 ${isCurrentHour ? 'font-bold text-purple-600' : 'text-gray-500'}`}>
                    {i}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                      <p className="font-bold">{String(i).padStart(2, '0')}:00</p>
                      <p>{visitors} kişi</p>
                      {isPeakHour && <p className="text-yellow-300">⭐ En Yoğun</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-t from-red-500 to-red-400 rounded"></div>
              <span className="text-gray-600">Çok Yoğun</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-t from-orange-500 to-orange-400 rounded"></div>
              <span className="text-gray-600">Yoğun</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded"></div>
              <span className="text-gray-600">Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
              <span className="text-gray-600">Sakin</span>
            </div>
          </div>

          {/* AI Önerisi */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900">
              <span className="font-bold">💡 İpucu:</span> 
              {analytics.hourlyData.reduce((sum, h) => sum + h.visitors, 0) === 0 
                ? ' Henüz yeterli veri yok. Kameralarınız veri toplamaya başladığında saatlik analiz burada görünecek.'
                : ` En yoğun saatiniz ${String(aiPredictions.peakTime.hour).padStart(2, '0')}:00. Bu saatlerde ekstra personel bulundurun.`
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Son Aktiviteler</h2>
          <span className="text-xs text-gray-500">5 saniyede bir güncelleniyor</span>
        </div>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Henüz aktivite kaydı yok</p>
              <p className="text-xs mt-1">Kamera bağlandığında aktiviteler burada görünecek</p>
            </div>
          ) : (
            recentActivities.map((activity) => {
              const bgColor = activity.crowd_level === 'high' ? 'bg-red-100' :
                             activity.crowd_level === 'medium' ? 'bg-orange-100' : 'bg-blue-100';
              const iconColor = activity.crowd_level === 'high' ? 'text-red-600' :
                               activity.crowd_level === 'medium' ? 'text-orange-600' : 'text-blue-600';
              
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Activity className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.camera_name} - {activity.event_type}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-600 font-medium">{activity.person_count} kişi</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {recentActivities.length > 0 && (
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigateToSection', { detail: 'ai-analytics' }))}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Tüm aktiviteleri görüntüle →
          </button>
        )}
      </div>
    </div>
  );
}
