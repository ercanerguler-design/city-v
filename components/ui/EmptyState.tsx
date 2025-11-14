'use client';

import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Heart, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-results' | 'no-location' | 'no-favorites' | 'error';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  type = 'no-results',
  title,
  description,
  action,
}: EmptyStateProps) {
  const configs = {
    'no-results': {
      icon: Search,
      defaultTitle: 'Sonuç Bulunamadı',
      defaultDescription: 'Arama kriterlerinizle eşleşen mekan bulamadık. Filtreleri değiştirmeyi deneyin.',
      color: 'from-indigo-500 to-purple-500',
      emoji: '🔍',
    },
    'no-location': {
      icon: MapPin,
      defaultTitle: 'Konum Gerekli',
      defaultDescription: 'Yakınınızdaki mekanları görmek için konum izni verin.',
      color: 'from-green-500 to-emerald-500',
      emoji: '📍',
    },
    'no-favorites': {
      icon: Heart,
      defaultTitle: 'Favori Yok',
      defaultDescription: 'Henüz favori mekan eklemediniz. Kalp ikonuna tıklayarak mekanları favorilerinize ekleyin.',
      color: 'from-red-500 to-pink-500',
      emoji: '❤️',
    },
    'error': {
      icon: Sparkles,
      defaultTitle: 'Bir Hata Oluştu',
      defaultDescription: 'Mekanlar yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.',
      color: 'from-orange-500 to-red-500',
      emoji: '⚠️',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px] px-4"
    >
      <div className="text-center max-w-md">
        {/* Icon Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}
        >
          <span className="text-5xl">{config.emoji}</span>
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-800 dark:text-white mb-3"
        >
          {title || config.defaultTitle}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
        >
          {description || config.defaultDescription}
        </motion.p>

        {/* Action Button */}
        {action && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={action.onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 bg-gradient-to-r ${config.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all`}
          >
            {action.label}
          </motion.button>
        )}

        {/* Decorative Elements */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent rounded-full" />
          <Icon className="w-4 h-4" />
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
