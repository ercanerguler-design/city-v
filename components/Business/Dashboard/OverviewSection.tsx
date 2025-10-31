'use client';

import { useState, useEffect } from 'react';
import { Users, Camera, TrendingUp, Clock, Activity, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

export default function OverviewSection({ businessProfile }: { businessProfile: any }) {
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
    }
  }, [businessProfile]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/business/analytics?businessId=${businessProfile.id}`);
      const data = await response.json();

      if (data.success) {
        // Metrikleri güncelle
        setMetrics(prev => [
          { ...prev[0], value: data.todayVisitors.toString(), change: `+${data.visitorGrowth}%` },
          { ...prev[1], value: data.activeCameras.toString(), change: `${data.activeCameras}/${data.totalCameras}` },
          { ...prev[2], value: `${data.averageOccupancy}%`, change: data.crowdLevel },
          { ...prev[3], value: `${data.avgStayMinutes}dk`, change: `+${data.stayGrowth}dk` }
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
            <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 group-hover:text-blue-600">Kamera Ekle</p>
              <p className="text-sm text-gray-500">Yeni AI kamera bağlayın</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group">
            <Eye className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 group-hover:text-purple-600">Canlı İzle</p>
              <p className="text-sm text-gray-500">Kameraları görüntüleyin</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group">
            <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 group-hover:text-green-600">Raporlar</p>
              <p className="text-sm text-gray-500">Detaylı analiz görün</p>
            </div>
          </button>
        </div>
      </div>

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
