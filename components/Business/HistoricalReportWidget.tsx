'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Download, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoricalReportProps {
  businessId: string;
}

interface ReportData {
  totalPeople: number;
  avgCrowdLevel: number;
  peakTime: string;
  totalEntries: number;
  totalExits: number;
  hourlyData: Array<{
    hour: number;
    avgPeople: number;
    density: number;
  }>;
}

export default function HistoricalReportWidget({ businessId }: HistoricalReportProps) {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickRange, setQuickRange] = useState<string>('');

  // Quick range seçimi
  const selectQuickRange = (range: string) => {
    const now = new Date();
    const start = new Date();
    
    setQuickRange(range);
    
    switch (range) {
      case '3hours':
        start.setHours(now.getHours() - 3);
        break;
      case '6hours':
        start.setHours(now.getHours() - 6);
        break;
      case '12hours':
        start.setHours(now.getHours() - 12);
        break;
      case '24hours':
        start.setDate(now.getDate() - 1);
        break;
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setStartTime(start.toTimeString().slice(0, 5));
    setEndDate(now.toISOString().split('T')[0]);
    setEndTime(now.toTimeString().slice(0, 5));
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      return;
    }

    setLoading(true);
    try {
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;
      
      const response = await fetch(
        `/api/business/crowd-analytics/historical?businessId=${businessId}&startDate=${startDateTime}&endDate=${endDateTime}`
      );
      
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      }
    } catch (error) {
      console.error('Report fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;
    
    const csv = [
      ['Saat', 'Ortalama Kişi', 'Yoğunluk'],
      ...reportData.hourlyData.map(h => [h.hour, h.avgPeople, h.density])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapor_${startDate}_${endDate}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Geçmiş Dönem Raporu</h3>
      </div>

      {/* Quick Range Buttons */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Hızlı Seçim</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: '3hours', label: 'Son 3 Saat' },
            { value: '6hours', label: 'Son 6 Saat' },
            { value: '12hours', label: 'Son 12 Saat' },
            { value: '24hours', label: 'Son 24 Saat' },
            { value: '7days', label: 'Son 7 Gün' }
          ].map(range => (
            <button
              key={range.value}
              onClick={() => selectQuickRange(range.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                quickRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date/Time Pickers */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-2"
          />
        </div>
      </div>

      {/* Fetch Button */}
      <button
        onClick={fetchReport}
        disabled={loading || !startDate || !endDate}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-5 h-5" />
        {loading ? 'Rapor Hazırlanıyor...' : 'Rapor Getir'}
      </button>

      {/* Report Results */}
      {reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Toplam Ziyaretçi</p>
                <p className="text-2xl font-bold text-blue-700">{reportData.totalEntries}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ortalama Kalabalık</p>
                <p className="text-2xl font-bold text-indigo-700">{reportData.avgCrowdLevel.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">En Yoğun Saat</p>
                <p className="text-lg font-bold text-purple-700">{reportData.peakTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Çıkış Sayısı</p>
                <p className="text-lg font-bold text-green-700">{reportData.totalExits}</p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadCSV}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </button>

          {/* Hourly Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-sm font-semibold text-gray-700 mb-3">Saatlik Dağılım</p>
            <div className="space-y-2">
              {reportData.hourlyData.map((hour, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{hour.hour}:00</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-blue-700">{hour.avgPeople} kişi</span>
                    <span className="text-gray-500">%{hour.density} yoğunluk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
