'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, Clock, MapPin, Star, Zap, Target, Brain } from 'lucide-react';
import { useRecommendationStore, SmartRecommendation } from '@/lib/stores/recommendationStore';
import { Location } from '@/types';
import PremiumGuard from '@/components/Premium/PremiumGuard';
import { getCategoryIcon, getCategoryById } from '@/lib/categories';

interface SmartRecommendationsProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  userLocation?: [number, number];
  onLocationSelect?: (location: Location) => void;
}

export default function SmartRecommendations({
  isOpen,
  onClose,
  locations,
  userLocation,
  onLocationSelect,
}: SmartRecommendationsProps) {
  const { generateRecommendations, predictions, predictCrowdLevels } = useRecommendationStore();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && locations.length > 0) {
      setLoading(true);
      
      // Hava durumu simülasyonu (gerçek uygulamada API'den gelecek)
      const mockWeather = {
        temperature: 22,
        condition: 'clear',
      };

      setTimeout(() => {
        const recs = generateRecommendations(locations, userLocation, mockWeather);
        setRecommendations(recs);
        setLoading(false);
      }, 500);
    }
  }, [isOpen, locations, userLocation]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-blue-500 to-cyan-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-gray-400 to-gray-600';
  };

  const getScoreText = (score: number) => {
    if (score >= 85) return 'Mükemmel Eşleşme';
    if (score >= 70) return 'Harika Seçim';
    if (score >= 60) return 'İyi Seçim';
    return 'Uygun';
  };

  const getCrowdLevelColor = (level: string) => {
    const colors = {
      empty: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      low: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
      moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      very_high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[level as keyof typeof colors] || colors.moderate;
  };

  const getCrowdLevelText = (level: string) => {
    const texts = {
      empty: 'Boş',
      low: 'Az Kalabalık',
      moderate: 'Orta',
      high: 'Kalabalık',
      very_high: 'Çok Kalabalık',
    };
    return texts[level as keyof typeof texts] || level;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="w-7 h-7" />
                  🤖 Akıllı Öneriler
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  Size özel kişiselleştirilmiş mekan önerileri
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <PremiumGuard 
              featureName="Akıllı Öneriler" 
              onUpgradeClick={onClose}
            >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Brain className="w-16 h-16 text-purple-600" />
                </motion.div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Yapay zeka tercihlerinizi analiz ediyor...
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Henüz öneri oluşturulamadı
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Daha fazla mekan ziyaret ederek tercihlerinizi geliştirin
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Info Banner */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                        {recommendations.length} Akıllı Öneri Bulundu
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        Ziyaret geçmişiniz, tercihleriniz ve mevcut konumunuza göre özel seçildi
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, index) => {
                    const category = getCategoryById(rec.location.category);
                    const prediction = predictions.find((p) => p.locationId === rec.location.id);

                    return (
                      <motion.div
                        key={rec.location.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-gray-200 dark:border-slate-600 overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        {/* Score Badge */}
                        <div className={`h-2 bg-gradient-to-r ${getScoreColor(rec.score)}`} />

                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-3xl">{getCategoryIcon(rec.location.category)}</span>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                                  {rec.location.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {category?.name}
                                </p>
                              </div>
                            </div>
                            
                            {/* Score */}
                            <div className="text-right">
                              <div className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(rec.score)} bg-clip-text text-transparent`}>
                                {rec.score}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {getScoreText(rec.score)}
                              </div>
                            </div>
                          </div>

                          {/* Current Status */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getCrowdLevelColor(rec.location.currentCrowdLevel)}`}>
                              Şu an: {getCrowdLevelText(rec.location.currentCrowdLevel)}
                            </span>
                            {rec.predictedCrowdLevel && (
                              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getCrowdLevelColor(rec.predictedCrowdLevel)}`}>
                                1 saat sonra: {getCrowdLevelText(rec.predictedCrowdLevel)}
                              </span>
                            )}
                          </div>

                          {/* Reasons */}
                          <div className="space-y-1.5 mb-3">
                            {rec.reasons.slice(0, 3).map((reason, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                              >
                                <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{reason}</span>
                              </div>
                            ))}
                          </div>

                          {/* Best Visit Time */}
                          {rec.bestVisitTime && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 mb-3">
                              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                                <Clock className="w-3 h-3" />
                                <span className="font-semibold">En İyi Zaman:</span>
                                <span>{rec.bestVisitTime}</span>
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <button
                            onClick={() => {
                              onLocationSelect?.(rec.location);
                              onClose();
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Target className="w-4 h-4" />
                            Bu Mekana Git
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
            </PremiumGuard>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
