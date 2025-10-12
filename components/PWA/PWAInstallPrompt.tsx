'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Zap, Wifi, Bell } from 'lucide-react';
import { usePWAStore } from '@/lib/stores/pwaStore';
import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const { canInstall, isInstalled, installPWA } = usePWAStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user dismissed the prompt before
    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after 5 seconds if can install and not installed
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || dismissed || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-50"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Ana Ekrana Ekle</h3>
                <p className="text-white/80 text-sm">CityView uygulamasını yükle</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Uygulamayı ana ekranınıza ekleyin ve hızlı erişim sağlayın
            </p>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Daha hızlı yüklenme</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Wifi className="w-4 h-4 text-blue-500" />
                <span>Çevrimdışı çalışma</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Bell className="w-4 h-4 text-red-500" />
                <span>Anlık bildirimler</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Download className="w-4 h-4 text-green-500" />
                <span>Tam ekran deneyim</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstall}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                           text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Yükle
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDismiss}
                className="px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 
                           text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
              >
                Sonra
              </motion.button>
            </div>

            {/* Note */}
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              Tekrar görmek için ayarlardan etkinleştirebilirsiniz
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
