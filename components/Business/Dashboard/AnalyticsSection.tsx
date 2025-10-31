'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, Clock, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  todayVisitors: number;
  visitorGrowth: number;
  activeCameras: number;
  totalCameras: number;
  averageOccupancy: number;
  crowdLevel: string;
  avgStayMinutes: number;
}

export default function AnalyticsSection({ businessProfile }: { businessProfile: any }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessProfile) {
      loadAnalytics();
      
      // 30 saniyede bir güncelle
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
        setAnalytics(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Analytics load error:', error);
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

  return (
    <div className="space-y-6">
      {/* Genel Durum */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Gerçek Zamanlı Durum</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bugünkü Ziyaretçi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-3">
              <div className="p-4 bg-blue-50 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analytics.todayVisitors}</p>
            <p className="text-sm text-gray-500 mb-2">Bugünkü Ziyaretçi</p>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              analytics.visitorGrowth >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {analytics.visitorGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(analytics.visitorGrowth)}% Dünden
            </div>
          </motion.div>

          {/* Ortalama Yoğunluk */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-3">
              <div className={`p-4 ${crowdColor.bg} rounded-full`}>
                <Activity className={`w-8 h-8 ${crowdColor.text}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{Math.round(analytics.averageOccupancy)}%</p>
            <p className="text-sm text-gray-500 mb-2">Doluluk Oranı</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${crowdColor.bg} ${crowdColor.text}`}>
              {crowdColor.label}
            </span>
          </motion.div>

          {/* Ortalama Kalış */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="flex justify-center mb-3">
              <div className="p-4 bg-purple-50 rounded-full">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analytics.avgStayMinutes}</p>
            <p className="text-sm text-gray-500 mb-2">Ortalama Kalış (dk)</p>
            <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
              Son 1 Saat
            </span>
          </motion.div>
        </div>
      </div>

      {/* Kamera Durumu */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Kamera Durumu</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Aktif Kameralar</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.activeCameras} / {analytics.totalCameras}</p>
          </div>
          <div className="w-24 h-24">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="12"
                strokeDasharray={`${(analytics.activeCameras / analytics.totalCameras) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500">Çevrimiçi</p>
            <p className="text-xl font-bold text-green-600">{analytics.activeCameras}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Çevrimdışı</p>
            <p className="text-xl font-bold text-gray-400">{analytics.totalCameras - analytics.activeCameras}</p>
          </div>
        </div>
      </div>

      {/* Bilgilendirme */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <Calendar className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Gerçek Zamanlı Veri</h3>
            <p className="text-sm text-blue-700">
              Veriler 30 saniyede bir otomatik olarak güncellenir. 
              IoT cihazlarınızdan gelen anlık sayım ve analiz verileri burada görüntülenir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
