'use client';

import { useState } from 'react';
import { Calendar, Download, FileText, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface DateRangeReportProps {
  businessUserId: number;
}

export default function DateRangeReport({ businessUserId }: DateRangeReportProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Başlangıç tarihi bitiş tarihinden sonra olamaz');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/business/report?businessUserId=${businessUserId}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();

      if (data.success) {
        setReportData(data);
        toast.success(`✅ Rapor oluşturuldu! ${data.analytics.length} kayıt bulundu.`);
      } else {
        toast.error(data.error || 'Rapor oluşturulamadı');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.analytics) {
      toast.error('İndirilecek veri yok');
      return;
    }

    // CSV formatı
    const headers = ['Tarih', 'Saat', 'Kamera', 'Lokasyon', 'Kişi Sayısı', 'Giriş', 'Çıkış', 'Mevcut', 'Yoğunluk %'];
    const rows = reportData.analytics.map((row: any) => [
      row.date,
      row.time,
      row.camera_name || 'N/A',
      row.camera_location || 'N/A',
      row.people_count,
      row.entries_count,
      row.exits_count,
      row.current_occupancy,
      row.crowd_density
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.join(','))
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cityv-rapor-${startDate}-${endDate}.csv`;
    link.click();

    toast.success('📥 Rapor indirildi!');
  };

  const downloadExcel = () => {
    if (!reportData || !reportData.analytics) {
      toast.error('İndirilecek veri yok');
      return;
    }

    // Excel uyumlu HTML tablosu (Excel bu formatı anlayabilir)
    const headers = ['Tarih', 'Saat', 'Kamera', 'Lokasyon', 'Kişi Sayısı', 'Giriş', 'Çıkış', 'Mevcut', 'Yoğunluk %'];
    const rows = reportData.analytics.map((row: any) => [
      row.date,
      row.time,
      row.camera_name || 'N/A',
      row.camera_location || 'N/A',
      row.people_count,
      row.entries_count,
      row.exits_count,
      row.current_occupancy,
      row.crowd_density
    ]);

    // Excel uyumlu HTML tablo formatı
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>City-V Rapor</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml></head>
      <body>
        <table border="1">
          <thead>
            <tr style="background-color: #4F46E5; color: white; font-weight: bold;">
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row: any) => `<tr>${row.map((cell: any) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #F3F4F6; font-weight: bold;">
              <td colspan="4">ÖZET</td>
              <td>${reportData.summary.totalPeople}</td>
              <td>${reportData.summary.totalEntries}</td>
              <td>${reportData.summary.totalExits}</td>
              <td>${reportData.summary.avgPeople}</td>
              <td>${reportData.summary.avgDensity}%</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    // Excel dosyası olarak indir
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cityv-rapor-${startDate}-${endDate}.xls`;
    link.click();

    toast.success('📊 Excel raporu indirildi!');
  };

  const downloadJSON = () => {
    if (!reportData) {
      toast.error('İndirilecek veri yok');
      return;
    }

    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cityv-rapor-${startDate}-${endDate}.json`;
    link.click();

    toast.success('📥 JSON raporu indirildi!');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tarih Bazlı Rapor</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Belirli tarih aralığında analitik verileri</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={generateReport}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-5 h-5" />
        {loading ? 'Rapor Oluşturuluyor...' : 'Rapor Oluştur'}
      </motion.button>

      {/* Report Data */}
      {reportData && reportData.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          {/* Summary Stats */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">📊 Özet İstatistikler</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Toplam Kayıt</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.summary.totalRecords}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Toplam Kişi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.summary.totalPeople}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Ort. Kişi Sayısı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.summary.avgPeople}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Maks. Kişi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.summary.maxPeople}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Toplam Giriş</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{reportData.summary.totalEntries}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Toplam Çıkış</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{reportData.summary.totalExits}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Ort. Yoğunluk</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{reportData.summary.avgDensity}%</p>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadCSV}
              className="py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              CSV İndir
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadExcel}
              className="py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              📊 Excel İndir
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadJSON}
              className="py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              JSON İndir
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
