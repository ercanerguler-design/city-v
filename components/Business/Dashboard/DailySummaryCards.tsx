'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, LogIn, LogOut, Activity, Calendar, Clock, Zap } from 'lucide-react';

// Günlük özet yoksa gösterilecek live analytics
function LiveAnalyticsSummary({ businessUserId }: { businessUserId: number }) {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 10000); // 10 saniye
    return () => clearInterval(interval);
  }, [businessUserId]);

  async function loadLiveData() {
    try {
      const response = await fetch(`/api/business/analytics?businessId=${businessUserId}`);
      const data = await response.json();
      if (data.success) {
        setLiveData(data);
      }
    } catch (error) {
      console.error('Live analytics error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!liveData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Kamera sistemi veri gönderiyor, lütfen bekleyin...</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
            Canlı Analitik Veriler
          </h2>
          <p className="text-sm text-gray-600">
            Gerçek zamanlı kamera verileri • Her 10 saniyede güncelleniyor
          </p>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bugünkü Ziyaretçiler */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold">Bugünkü Ziyaretçiler</span>
          </div>
          <div className="text-3xl font-bold text-blue-900">{liveData.todayVisitors || 0}</div>
          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            {liveData.visitorGrowth > 0 ? (
              <><TrendingUp className="w-3 h-3" /> +{liveData.visitorGrowth}%</>
            ) : (
              <span>Dünle karşılaştırıldı</span>
            )}
          </div>
        </div>

        {/* Anlık Yoğunluk */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-semibold">Anlık Yoğunluk</span>
          </div>
          <div className="text-3xl font-bold text-green-900">{liveData.averageOccupancy || 0}%</div>
          <div className="text-xs text-green-600 mt-1">{liveData.crowdLevel || 'Normal'}</div>
        </div>

        {/* Aktif Kameralar */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-2 text-purple-700 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-semibold">Aktif Kameralar</span>
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {liveData.activeCameras || 0}/{liveData.totalCameras || 0}
          </div>
          <div className="text-xs text-purple-600 mt-1">Canlı izleniyor</div>
        </div>

        {/* En Yoğun Saat */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
          <div className="flex items-center gap-2 text-orange-700 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">En Yoğun Saat</span>
          </div>
          <div className="text-3xl font-bold text-orange-900">
            {liveData.peakHours?.[0]?.hour || '--'}:00
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {liveData.peakHours?.[0]?.occupancy || 0} kişi
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <Activity className="w-5 h-5 text-blue-600 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">Gerçek Zamanlı Veri Akışı Aktif</p>
          <p className="text-xs text-blue-700 mt-1">
            City-V Kamera cihazlarınızdan gelen canlı veriler gösteriliyor. Günlük özet raporu gün sonunda otomatik oluşturulacak.
          </p>
        </div>
      </div>
    </div>
  );
}

interface DailySummary {
  date: string;
  metrics: {
    totalVisitors: number;
    totalEntries: number;
    totalExits: number;
    currentOccupancy: number;
    avgOccupancy: number;
    maxOccupancy: number;
    avgCrowdDensity: number;
    maxCrowdDensity: number;
  };
  timeAnalysis: {
    peakHour: number;
    peakHourVisitors: number;
    busiestPeriod: string;
  };
  cameraData: {
    totalDetections: number;
    activeCamerasCount: number;
  };
}

interface DailySummaryCardsProps {
  businessUserId: number;
}

export default function DailySummaryCards({ businessUserId }: DailySummaryCardsProps) {
  const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null);
  const [yesterdaySummary, setYesterdaySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDailySummaries();
    
    // Her 5 dakikada bir güncelle
    const interval = setInterval(loadDailySummaries, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [businessUserId]);

  async function loadDailySummaries() {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Bugünün verilerini al
      const todayResponse = await fetch(
        `/api/business/daily-summary?businessUserId=${businessUserId}&date=${today}`
      );
      
      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        setTodaySummary(todayData.summary);
      }

      // Dünün verilerini al
      const yesterdayResponse = await fetch(
        `/api/business/daily-summary?businessUserId=${businessUserId}&date=${yesterday}`
      );
      
      if (yesterdayResponse.ok) {
        const yesterdayData = await yesterdayResponse.json();
        setYesterdaySummary(yesterdayData.summary);
      }

      setError(null);
    } catch (err) {
      console.error('❌ Günlük özet yükleme hatası:', err);
      setError('Günlük özet verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  const formatPeriod = (period: string) => {
    const periods: Record<string, string> = {
      morning: 'Sabah (06:00-12:00)',
      afternoon: 'Öğleden Sonra (12:00-18:00)',
      evening: 'Akşam (18:00-00:00)',
      night: 'Gece (00:00-06:00)'
    };
    return periods[period] || period;
  };

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm">⚠️ {error}</p>
      </div>
    );
  }

  // Günlük özet yoksa, analytics API'den gerçek zamanlı veri göster
  if (!todaySummary && !yesterdaySummary) {
    return <LiveAnalyticsSummary businessUserId={businessUserId} />;
  }

  const today = todaySummary?.metrics;
  const yesterday = yesterdaySummary?.metrics;

  return (
    <div className="space-y-4 mb-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Günlük Özet Veriler</h2>
          <p className="text-sm text-gray-600">
            Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
          </p>
        </div>
        <button
          onClick={loadDailySummaries}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          🔄 Yenile
        </button>
      </div>

      {/* Metrik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Ziyaretçi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            {today && yesterday && (
              <span className={`text-xs font-medium ${
                today.totalVisitors >= yesterday.totalVisitors 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {today.totalVisitors >= yesterday.totalVisitors ? '↑' : '↓'} 
                {Math.abs(parseFloat(calculateChange(today.totalVisitors, yesterday.totalVisitors)))}%
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Toplam Ziyaretçi</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {today?.totalVisitors || 0}
              <span className="text-sm font-normal text-gray-500 ml-2">Bugün</span>
            </p>
            {yesterday && (
              <p className="text-xs text-gray-500">
                Dün: {yesterday.totalVisitors}
              </p>
            )}
          </div>
        </div>

        {/* Giriş/Çıkış */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Giriş & Çıkış</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <LogIn className="w-4 h-4 text-green-600" />
                <span className="text-lg font-bold text-gray-900">
                  {today?.totalEntries || 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <LogOut className="w-4 h-4 text-red-600" />
                <span className="text-lg font-bold text-gray-900">
                  {today?.totalExits || 0}
                </span>
              </div>
            </div>
            {yesterday && (
              <p className="text-xs text-gray-500">
                Dün: {yesterday.totalEntries} / {yesterday.totalExits}
              </p>
            )}
          </div>
        </div>

        {/* Doluluk Oranı */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            {today && yesterday && (
              <span className={`text-xs font-medium ${
                today.avgOccupancy >= yesterday.avgOccupancy 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {today.avgOccupancy >= yesterday.avgOccupancy ? '↑' : '↓'} 
                {Math.abs(parseFloat(calculateChange(today.avgOccupancy, yesterday.avgOccupancy)))}%
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Ortalama Doluluk</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {today?.avgOccupancy.toFixed(1) || 0}
              <span className="text-sm font-normal text-gray-500 ml-1">kişi</span>
            </p>
            {today && (
              <p className="text-xs text-gray-500">
                Maks: {today.maxOccupancy} kişi
              </p>
            )}
          </div>
        </div>

        {/* En Yoğun Saat */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">En Yoğun Saat</h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {todaySummary?.timeAnalysis?.peakHour?.toString().padStart(2, '0') || '--'}:00
            </p>
            {todaySummary?.timeAnalysis && (
              <p className="text-xs text-gray-500">
                {todaySummary.timeAnalysis.peakHourVisitors} ziyaretçi
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ek Bilgiler */}
      {todaySummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-blue-900">En Yoğun Dönem</h4>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {formatPeriod(todaySummary.timeAnalysis.busiestPeriod)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold text-green-900">Yoğunluk Ortalaması</h4>
            </div>
            <p className="text-lg font-bold text-green-900">
              {today?.avgCrowdDensity.toFixed(1)}%
              <span className="text-sm font-normal ml-2">
                (Maks: {today?.maxCrowdDensity.toFixed(1)}%)
              </span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-900">Aktif Kameralar</h4>
            </div>
            <p className="text-lg font-bold text-purple-900">
              {todaySummary.cameraData.activeCamerasCount} kamera
              <span className="text-sm font-normal ml-2">
                ({todaySummary.cameraData.totalDetections} tespit)
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
