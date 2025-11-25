'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, User, Package, AlertCircle } from 'lucide-react';

interface AIDetectionFeedProps {
  businessId: string;
  maxItems?: number;
}

interface Detection {
  id: number;
  type: string;
  object: string;
  confidence: number;
  timestamp: string;
  deviceId: string;
}

interface DetectionStats {
  totalDetections: number;
  byType: Array<{ type: string; count: number; avgConfidence: number }>;
  uniquePersons: number;
}

const detectionTypeIcons: { [key: string]: any } = {
  person: User,
  object: Package,
  face: Eye
};

const detectionTypeColors: { [key: string]: string } = {
  person: 'bg-blue-500',
  object: 'bg-purple-500',
  face: 'bg-green-500'
};

export default function AIDetectionFeed({ businessId, maxItems = 20 }: AIDetectionFeedProps) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [stats, setStats] = useState<DetectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchDetections();
    // 🔥 REAL-TIME: 5 saniyede bir AI algılama verileri güncellenir
    const interval = setInterval(() => {
      console.log('👁️ AI Detection güncelleniyor...');
      fetchDetections();
    }, 5000);
    return () => clearInterval(interval);
  }, [businessId, filter]);

  const fetchDetections = async () => {
    try {
      const response = await fetch(
        `/api/business/ai-recognition?businessUserId=${businessId}&detectionType=${filter}&limit=${maxItems}`
      );
      const data = await response.json();

      if (data.success) {
        setDetections(data.recentDetections || []);
        setStats(data.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 bg-opacity-20 rounded-xl">
            <Eye className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Algılama Akışı</h3>
            <p className="text-sm text-gray-400">Gerçek zamanlı tespit</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Aktif</span>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Toplam Algılama</p>
            <p className="text-2xl font-bold text-white">{stats.totalDetections}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Benzersiz Kişi</p>
            <p className="text-2xl font-bold text-blue-400">{stats.uniquePersons}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Ort. Güven</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.byType.length > 0
                ? Math.round(
                    stats.byType.reduce((sum, t) => sum + t.avgConfidence, 0) / stats.byType.length
                  )
                : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {['all', 'person', 'object', 'face'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === type
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {type === 'all' ? 'Tümü' : type === 'person' ? 'Kişi' : type === 'object' ? 'Nesne' : 'Yüz'}
          </button>
        ))}
      </div>

      {/* Detection Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {detections.length > 0 ? (
            detections.map((detection, index) => {
              const Icon = detectionTypeIcons[detection.type] || AlertCircle;
              const bgColor = detectionTypeColors[detection.type] || 'bg-gray-500';

              return (
                <motion.div
                  key={detection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${bgColor} bg-opacity-20 rounded-lg`}>
                        <Icon className={`w-5 h-5 text-${detection.type === 'person' ? 'blue' : detection.type === 'object' ? 'purple' : 'green'}-400`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white capitalize">
                          {detection.object}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(detection.timestamp).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full ${
                        detection.confidence >= 90
                          ? 'bg-green-500 bg-opacity-20 text-green-400'
                          : detection.confidence >= 70
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                          : 'bg-orange-500 bg-opacity-20 text-orange-400'
                      }`}>
                        <span className="text-xs font-semibold">{detection.confidence}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Güven</p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${detection.confidence}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`h-full ${
                        detection.confidence >= 90
                          ? 'bg-green-500'
                          : detection.confidence >= 70
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Henüz algılama verisi yok</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Type Distribution */}
      {stats && stats.byType.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Algılama Dağılımı</h4>
          <div className="space-y-2">
            {stats.byType.map((type) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${detectionTypeColors[type.type]}`}></div>
                  <span className="text-sm text-gray-300 capitalize">{type.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-white">{type.count}</span>
                  <span className="text-xs text-gray-400">{type.avgConfidence}% güven</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
