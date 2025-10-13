'use client';

import { useBusinessStore, type Business } from '@/store/businessStore';
import { useEffect } from 'react';

interface DashboardOverviewProps {
  business: Business;
}

export default function DashboardOverview({ business }: DashboardOverviewProps) {
  const { analytics, fetchAnalytics, reservations, staff, campaigns, feedback, setActiveView } = useBusinessStore();

  useEffect(() => {
    if (!analytics) {
      fetchAnalytics();
    }
  }, [analytics, fetchAnalytics]);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Bugünkü Ziyaretçi',
      value: analytics.visitors.today.toLocaleString(),
      change: analytics.visitors.trend === 'up' ? '+12%' : analytics.visitors.trend === 'down' ? '-5%' : '0%',
      changeType: analytics.visitors.trend,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      title: 'Bu Ay Gelir',
      value: `₺${analytics.revenue.thisMonth.toLocaleString()}`,
      change: analytics.revenue.trend === 'up' ? '+18%' : analytics.revenue.trend === 'down' ? '-8%' : '0%',
      changeType: analytics.revenue.trend,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: 'Aktif Rezervasyon',
      value: reservations.filter(r => r.status === 'confirmed').length.toString(),
      change: '+3',
      changeType: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Ortalama Rating',
      value: business.rating.toFixed(1),
      change: '+0.2',
      changeType: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hoş Geldiniz! 👋</h1>
            <p className="text-blue-100 mt-1">
              İşletmenizin güncel durumunu buradan takip edebilirsiniz.
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Bugün</p>
            <p className="text-xl font-semibold">
              {new Date().toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'long',
                weekday: 'long'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'up' 
                      ? 'text-green-600' 
                      : stat.changeType === 'down' 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}>
                    {stat.changeType === 'up' && '↗'}
                    {stat.changeType === 'down' && '↘'}
                    {stat.changeType === 'stable' && '→'}
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">bu hafta</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                stat.changeType === 'up' 
                  ? 'bg-green-100 text-green-600' 
                  : stat.changeType === 'down' 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Visitors Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Haftalık Ziyaretçi</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.visitors.weeklyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                  style={{ height: `${(day.count / Math.max(...analytics.visitors.weeklyData.map(d => d.count))) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                <span className="text-xs font-medium text-gray-700">{day.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Crowd Level */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Anlık Kalabalık Durumu</h3>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold mb-4 ${
              analytics.crowdLevels.current === 'low' ? 'bg-green-100 text-green-600' :
              analytics.crowdLevels.current === 'medium' ? 'bg-yellow-100 text-yellow-600' :
              analytics.crowdLevels.current === 'high' ? 'bg-orange-100 text-orange-600' :
              'bg-red-100 text-red-600'
            }`}>
              {analytics.crowdLevels.current === 'low' ? '🟢' :
               analytics.crowdLevels.current === 'medium' ? '🟡' :
               analytics.crowdLevels.current === 'high' ? '🟠' : '🔴'}
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {analytics.crowdLevels.current === 'low' ? 'Az Kalabalık' :
               analytics.crowdLevels.current === 'medium' ? 'Orta Kalabalık' :
               analytics.crowdLevels.current === 'high' ? 'Kalabalık' : 'Çok Kalabalık'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Ortalama bekleme: {analytics.crowdLevels.averageWaitTime} dakika
            </p>
          </div>

          {/* Peak Hours */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Yoğun Saatler</h4>
            <div className="space-y-2">
              {analytics.crowdLevels.peakHours.slice(0, 3).map((peak, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {peak.hour.toString().padStart(2, '0')}:00
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    peak.level === 'high' ? 'bg-orange-100 text-orange-600' :
                    peak.level === 'very_high' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {peak.level === 'high' ? 'Yoğun' :
                     peak.level === 'very_high' ? 'Çok Yoğun' : 'Orta'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                console.log('🔵 Kampanya Ekle tıklandı - campaigns sayfasına yönlendiriliyor');
                setActiveView('campaigns');
              }}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Kampanya Ekle</h4>
              <p className="text-sm text-gray-600">Yeni promosyon oluştur</p>
            </button>

            <button 
              onClick={() => {
                console.log('🟢 Personel Ekle tıklandı - staff sayfasına yönlendiriliyor');
                setActiveView('staff');
              }}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
            >
              <div className="text-green-600 mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Personel Ekle</h4>
              <p className="text-sm text-gray-600">Yeni çalışan kaydet</p>
            </button>

            <button 
              onClick={() => {
                console.log('🟣 Rapor Görüntüle tıklandı - analytics sayfasına yönlendiriliyor');
                setActiveView('analytics');
              }}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
            >
              <div className="text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Rapor Görüntüle</h4>
              <p className="text-sm text-gray-600">Detaylı analiz</p>
            </button>

            <button 
              onClick={() => {
                console.log('🟠 Rezervasyon tıklandı - reservations sayfasına yönlendiriliyor');
                setActiveView('reservations');
              }}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <div className="text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Rezervasyon</h4>
              <p className="text-sm text-gray-600">Masa ayarlamaları</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Yeni rezervasyon alındı</p>
                <p className="text-xs text-gray-500">Mehmet Özkan - 4 kişi, 19:00</p>
                <p className="text-xs text-gray-400">2 dakika önce</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Kampanya başlatıldı</p>
                <p className="text-xs text-gray-500">Mutlu Saatler - %20 indirim</p>
                <p className="text-xs text-gray-400">1 saat önce</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Müşteri geri bildirimi</p>
                <p className="text-xs text-gray-500">5 yıldız - "Harika deneyim!"</p>
                <p className="text-xs text-gray-400">3 saat önce</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Personel vardiya güncellendi</p>
                <p className="text-xs text-gray-500">Ayşe K. - Akşam vardiyası</p>
                <p className="text-xs text-gray-400">5 saat önce</p>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Tüm aktiviteleri görüntüle →
          </button>
        </div>
      </div>
    </div>
  );
}