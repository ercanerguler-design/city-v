'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AIAnalysis {
  id: number;
  camera_id: number;
  location_zone: string;
  person_count: number;
  crowd_density: number;
  detection_objects: any[];
  heatmap_url: string | null;
  processing_time_ms: number;
  created_at: string;
}

interface RealTimeAIDisplayProps {
  businessId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export default function RealTimeAIDisplay({
  businessId,
  autoRefresh = true,
  refreshInterval = 5000
}: RealTimeAIDisplayProps) {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAnalyses = async () => {
    try {
      const url = businessId
        ? `/api/iot/ai-analysis?camera_id=${businessId}&limit=5`
        : `/api/iot/ai-analysis?limit=10`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAnalyses(data.analyses);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('AI analiz yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAnalyses, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [businessId, autoRefresh, refreshInterval]);

  const getDensityColor = (density: number) => {
    if (density < 5) return 'text-green-500';
    if (density < 15) return 'text-yellow-500';
    if (density < 30) return 'text-orange-500';
    return 'text-red-500';
  };

  const getDensityLabel = (density: number) => {
    if (density < 5) return 'Düşük';
    if (density < 15) return 'Orta-Düşük';
    if (density < 30) return 'Orta';
    if (density < 50) return 'Yüksek';
    return 'Kritik';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-4">🤖</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Henüz AI Analizi Yok
        </h3>
        <p className="text-gray-500">
          ESP32-CAM kameranız fotoğraf göndermeye başladığında analizler burada görünecek.
        </p>
      </div>
    );
  }

  const latestAnalysis = analyses[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🧠 AI Canlı Analiz</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerçek zamanlı kişi tespiti ve yoğunluk analizi
          </p>
        </div>
        {lastUpdate && (
          <div className="text-sm text-gray-500">
            Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
          </div>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Person Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Kişi Sayısı</p>
              <p className="text-4xl font-bold mt-2">{latestAnalysis.person_count}</p>
            </div>
            <div className="text-5xl opacity-50">👥</div>
          </div>
          <div className="mt-4 text-sm text-blue-100">
            📍 {latestAnalysis.location_zone}
          </div>
        </motion.div>

        {/* Crowd Density */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Yoğunluk</p>
              <p className="text-4xl font-bold mt-2">
                {latestAnalysis.crowd_density.toFixed(1)}%
              </p>
            </div>
            <div className="text-5xl opacity-50">🔥</div>
          </div>
          <div className="mt-4 text-sm text-orange-100">
            {getDensityLabel(latestAnalysis.crowd_density)}
          </div>
        </motion.div>

        {/* Processing Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">İşlem Süresi</p>
              <p className="text-4xl font-bold mt-2">
                {latestAnalysis.processing_time_ms}
                <span className="text-lg ml-1">ms</span>
              </p>
            </div>
            <div className="text-5xl opacity-50">⚡</div>
          </div>
          <div className="mt-4 text-sm text-green-100">
            YOLOv8 AI Model
          </div>
        </motion.div>
      </div>

      {/* Heat Map */}
      {latestAnalysis.heatmap_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🗺️ Isı Haritası
            </h3>
            <p className="text-sm text-purple-100 mt-1">
              Kalabalık yoğunluk dağılımı
            </p>
          </div>
          <div className="p-4">
            <img
              src={latestAnalysis.heatmap_url}
              alt="Heat Map"
              className="w-full rounded-lg"
            />
          </div>
        </motion.div>
      )}

      {/* Detection Objects */}
      {latestAnalysis.detection_objects && latestAnalysis.detection_objects.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🎯 Tespit Detayları
          </h3>
          <div className="space-y-2">
            {latestAnalysis.detection_objects.map((obj: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">
                    Kişi #{idx + 1}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Güven: {(obj.confidence * 100).toFixed(0)}%</span>
                  <span className="text-xs text-gray-400">
                    [{obj.bbox[0]}, {obj.bbox[1]}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Analyses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Son Analizler</h3>
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {analysis.person_count} kişi
                  </div>
                  <div className="text-sm text-gray-500">
                    {analysis.location_zone}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${getDensityColor(analysis.crowd_density)}`}>
                  {analysis.crowd_density.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(analysis.created_at).toLocaleTimeString('tr-TR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
