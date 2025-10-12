'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Lock, Check, Crown } from 'lucide-react';
import { usePremiumStore } from '@/lib/stores/premiumStore';

interface PremiumThemesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumThemesModal({ isOpen, onClose }: PremiumThemesModalProps) {
  const { 
    themes, 
    selectedTheme, 
    selectTheme,
    checkSubscriptionStatus,
  } = usePremiumStore();

  const isPremium = checkSubscriptionStatus();

  const handleThemeSelect = (themeId: string) => {
    selectTheme(themeId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:w-[800px] md:max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 
                       overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <Palette className="w-8 h-8 text-white" />
                <h2 className="text-3xl font-bold text-white">Premium Temalar</h2>
              </div>
              <p className="text-white/90">
                Uygulamanızı kişiselleştirin • {themes.length} tema mevcut
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Info Banner */}
              {!isPremium && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 
                             rounded-xl border-2 border-purple-300 dark:border-purple-700 flex items-start gap-3"
                >
                  <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      Premium Temaları Kilidini Açın
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Premium üyelik satın alarak 6+ özel temaya erişin
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Themes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((theme, index) => {
                  const isSelected = selectedTheme === theme.id;
                  const isLocked = theme.isPremium && !isPremium;

                  return (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={!isLocked ? { scale: 1.02 } : {}}
                      onClick={() => !isLocked && handleThemeSelect(theme.id)}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-500 shadow-xl shadow-purple-200 dark:shadow-purple-900/50'
                          : isLocked
                          ? 'border-gray-200 dark:border-slate-600 opacity-60'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                      }`}
                    >
                      {/* Lock overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-[2px] rounded-2xl 
                                        flex items-center justify-center z-10">
                          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Lock className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-semibold text-purple-500">Premium</span>
                          </div>
                        </div>
                      )}

                      {/* Premium Badge */}
                      {theme.isPremium && (
                        <div className="absolute top-2 right-2 z-20">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            PREMIUM
                          </div>
                        </div>
                      )}

                      {/* Selected indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center z-20"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}

                      {/* Theme Preview */}
                      <div 
                        className="w-full h-32 rounded-xl mb-3 shadow-lg"
                        style={{ background: theme.preview }}
                      >
                        <div className="h-full flex items-center justify-center text-white font-bold text-2xl">
                          {theme.name.split(' ')[0]}
                        </div>
                      </div>

                      {/* Theme Info */}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {theme.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {theme.description}
                        </p>

                        {/* Color Palette */}
                        <div className="flex gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
                            style={{ backgroundColor: theme.colors.primary }}
                            title="Primary"
                          />
                          <div 
                            className="w-8 h-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
                            style={{ backgroundColor: theme.colors.secondary }}
                            title="Secondary"
                          />
                          <div 
                            className="w-8 h-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
                            style={{ backgroundColor: theme.colors.accent }}
                            title="Accent"
                          />
                        </div>
                      </div>

                      {/* Select Button */}
                      {!isLocked && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleThemeSelect(theme.id);
                          }}
                          className={`mt-4 w-full py-2 rounded-lg font-semibold transition-colors ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {isSelected ? '✓ Seçili' : 'Seç'}
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Note */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  💡 Temalar gerçek zamanlı olarak uygulanır. İstediğiniz zaman değiştirebilirsiniz!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
