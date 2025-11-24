'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DailyReportModalProps {
  businessUserId: number;
  onClose: () => void;
}

export default function DailyReportModal({ businessUserId, onClose }: DailyReportModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  // Rapor oluştur
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business/reports/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessUserId,
          reportDate: selectedDate
        })
      });

      const data = await response.json();

      if (data.success) {
        setReport(data.report);
        toast.success('✅ Rapor oluşturuldu!');
      } else {
        toast.error('❌ ' + (data.error || 'Rapor oluşturulamadı'));
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('❌ Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Rapor görüntüle
  const handleViewReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/business/reports/daily?businessUserId=${businessUserId}&date=${selectedDate}`
      );
      const data = await response.json();

      if (data.success && data.reports.length > 0) {
        setReport(data.reports[0]);
        toast.success('✅ Rapor yüklendi!');
      } else {
        toast.error('❌ Bu tarih için rapor bulunamadı');
      }
    } catch (error) {
      console.error('Report fetch error:', error);
      toast.error('❌ Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Rapor indir (PDF/Excel için gelecekte)
  const handleDownloadReport = () => {
    if (!report) return;
    
    // JSON olarak indir (geçici çözüm)
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapor-${selectedDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('✅ Rapor indirildi!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Günlük Rapor</h2>
                <p className="text-blue-100">24 saatlik detaylı analiz</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Tarih Seçimi */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rapor Tarihi Seçin
              </label>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleViewReport}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Görüntüle
              </button>
              
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                Rapor Oluştur
              </button>
            </div>
          </div>

          {/* Rapor İçeriği */}
          {report && (
            <div className="space-y-6">
              {/* Özet Kartlar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-900">
                      {report.totalVisitors}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Toplam Ziyaretçi</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-900">
                      {report.peakHour}:00
                    </span>
                  </div>
                  <p className="text-sm text-green-700 font-medium">En Yoğun Saat</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-900">
                      {report.avgOccupancy}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 font-medium">Ort. Yoğunluk</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-900">
                      {report.activeCameras}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 font-medium">Aktif Kamera</p>
                </div>
              </div>

              {/* Saatlik Dağılım */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Saatlik Dağılım
                </h3>
                <div className="space-y-2">
                  {report.hourlyDistribution?.map((hour: any) => (
                    <div key={hour.hour} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-16">
                        {String(hour.hour).padStart(2, '0')}:00
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center px-3 text-white text-sm font-medium"
                          style={{ width: `${Math.min((hour.visitors / report.totalVisitors) * 100, 100)}%` }}
                        >
                          {hour.visitors > 0 && `${hour.visitors} kişi`}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {hour.density}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kamera Dağılımı */}
              {report.cameraBreakdown && report.cameraBreakdown.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Kamera Bazlı Analiz
                  </h3>
                  <div className="space-y-3">
                    {report.cameraBreakdown.map((cam: any) => (
                      <div key={cam.camera_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{cam.camera_name}</p>
                          <p className="text-sm text-gray-500">{cam.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{cam.max_visitors}</p>
                          <p className="text-xs text-gray-500">max ziyaretçi</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Önerileri */}
              {report.aiRecommendations && report.aiRecommendations.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    AI Önerileri
                  </h3>
                  <div className="space-y-3">
                    {report.aiRecommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {rec.priority === 'high' ? 'Yüksek' : 'Orta'} Öncelik
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <p className="text-sm font-medium text-purple-700">{rec.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* İndir Butonu */}
              <div className="flex justify-end">
                <button
                  onClick={handleDownloadReport}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Raporu İndir (JSON)
                </button>
              </div>
            </div>
          )}

          {!report && !loading && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tarih seçin ve rapor oluşturun veya görüntüleyin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
