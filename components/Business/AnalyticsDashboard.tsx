'use client';

import { useBusinessStore, type Business } from '@/store/businessStore';
import { useState } from 'react';

interface AnalyticsDashboardProps {
  business: Business;
}

export default function AnalyticsDashboard({ business }: AnalyticsDashboardProps) {
  const { analytics } = useBusinessStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const periods = [
    { id: 'day', label: 'Günlük' },
    { id: 'week', label: 'Haftalık' },
    { id: 'month', label: 'Aylık' },
    { id: 'year', label: 'Yıllık' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik Dashboard</h1>
          <p className="text-gray-600">İşletmenizin detaylı performans analizi</p>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === period.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Toplam Ziyaretçi</p>
              <p className="text-2xl font-bold">{analytics.visitors.total.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-blue-100 text-sm">
                  Bu hafta: {analytics.visitors.thisWeek.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-blue-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Toplam Gelir</p>
              <p className="text-2xl font-bold">₺{analytics.revenue.total.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-green-100 text-sm">
                  Bu ay: ₺{analytics.revenue.thisMonth.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-green-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Ortalama Rating</p>
              <p className="text-2xl font-bold">{business.rating.toFixed(1)}/5.0</p>
              <div className="flex items-center mt-2">
                <span className="text-purple-100 text-sm">
                  {business.totalReviews} değerlendirme
                </span>
              </div>
            </div>
            <div className="text-purple-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Ortalama Bekleme</p>
              <p className="text-2xl font-bold">{analytics.crowdLevels.averageWaitTime} dk</p>
              <div className="flex items-center mt-2">
                <span className="text-orange-100 text-sm">
                  Mevcut seviye: {
                    analytics.crowdLevels.current === 'low' ? 'Düşük' :
                    analytics.crowdLevels.current === 'medium' ? 'Orta' :
                    analytics.crowdLevels.current === 'high' ? 'Yüksek' : 'Çok Yüksek'
                  }
                </span>
              </div>
            </div>
            <div className="text-orange-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ziyaretçi Trendleri</h3>
          <div className="h-64">
            <div className="h-full flex items-end justify-between space-x-2">
              {analytics.visitors.weeklyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full bg-gray-100 rounded-t-sm overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${(day.count / Math.max(...analytics.visitors.weeklyData.map(d => d.count))) * 200}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                  <span className="text-sm font-medium text-gray-700">{day.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gelir Analizi</h3>
          <div className="h-64">
            <div className="h-full flex items-end justify-between space-x-2">
              {analytics.revenue.monthlyData.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full bg-gray-100 rounded-t-sm overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-500 hover:from-green-600 hover:to-green-500"
                      style={{ height: `${(month.amount / Math.max(...analytics.revenue.monthlyData.map(m => m.amount))) * 200}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                  <span className="text-xs font-medium text-gray-700">₺{(month.amount / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demographics & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age Demographics */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yaş Demografisi</h3>
          <div className="space-y-4">
            {analytics.demographics.ageGroups.map((group, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{group.range}</span>
                  <span className="text-sm font-medium text-gray-900">{group.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${group.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cinsiyet Dağılımı</h3>
          <div className="flex items-center justify-center h-40">
            <div className="relative">
              {/* Donut Chart Simulation */}
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.demographics.genderRatio.male}%
                  </p>
                  <p className="text-xs text-gray-600">Erkek</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Erkek: {analytics.demographics.genderRatio.male}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
              <span>Kadın: {analytics.demographics.genderRatio.female}%</span>
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yoğun Saatler</h3>
          <div className="space-y-3">
            {analytics.demographics.topVisitingHours.map((hour, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    hour.count > 60 ? 'bg-red-100 text-red-600' :
                    hour.count > 40 ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {hour.hour.toString().padStart(2, '0')}
                  </div>
                  <span className="ml-3 text-sm text-gray-700">
                    {hour.hour}:00 - {hour.hour + 1}:00
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{hour.count}</p>
                  <p className="text-xs text-gray-500">ziyaretçi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export & Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Rapor İşlemleri</h3>
            <p className="text-gray-600 text-sm mt-1">Analitik verilerinizi dışa aktarın</p>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              PDF İndir
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Excel İndir
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Paylaş
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}