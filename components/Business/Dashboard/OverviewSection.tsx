'use client';

import { useState, useEffect } from 'react';
import { Users, Camera, TrendingUp, Clock, Activity, Eye, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const CampaignCreationModal = dynamic(() => import('./CampaignCreationModal'), { ssr: false });

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

export default function OverviewSection({ businessProfile }: { businessProfile: any }) {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
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
    }
  ]);

  useEffect(() => {
    if (businessProfile) {
      loadAnalytics();
      
      // 30 saniyede bir otomatik güncelle
      const interval = setInterval(() => {
        loadAnalytics();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [businessProfile]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/business/analytics?businessId=${businessProfile.id}`);
      const data = await response.json();

      if (data.success) {
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

        // Metrikleri güncelle
        setMetrics(prev => [
          { 
            ...prev[0], 
            value: data.todayVisitors.toString(), 
            change: data.visitorGrowth >= 0 ? `+${data.visitorGrowth}%` : `${data.visitorGrowth}%` 
          },
          { 
            ...prev[1], 
            value: data.activeCameras.toString(), 
            change: `${data.activeCameras}/${data.totalCameras}` 
          },
          { 
            ...prev[2], 
            value: `${Math.round(data.averageOccupancy)}%`, 
            change: getCrowdColor(data.crowdLevel) 
          },
          { 
            ...prev[3], 
            value: `${data.avgStayMinutes}dk`, 
            change: data.stayGrowth ? `+${data.stayGrowth}dk` : '+0dk' 
          }
        ]);
      }
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
            <h3 className="text-lg font-bold text-blue-900">AI Destekli Yoğunluk Takibi</h3>
          </div>
          <p className="text-blue-700 mb-3">Gerçek zamanlı müşteri sayısı ve yoğunluk analizi</p>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Aktif</span>
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
            <h3 className="text-lg font-bold text-purple-900">Akıllı İstatistikler</h3>
          </div>
          <p className="text-purple-700 mb-3">Saatlik, günlük, haftalık detaylı raporlar</p>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
            <span>Güncelleniyor</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-900">Performans Öngörüleri</h3>
          </div>
          <p className="text-green-700 mb-3">Gelecek saatler için tahmin ve öneriler</p>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span>Analiz ediliyor</span>
          </div>
        </motion.div>
      </div>

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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Son Aktiviteler</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Kamera #1 - Yüksek yoğunluk algılandı</p>
                <p className="text-xs text-gray-500">{i} saat önce</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
