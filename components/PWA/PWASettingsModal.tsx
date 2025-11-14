'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Bell, Trash2, RefreshCw, Wifi, Smartphone, Globe } from 'lucide-react';
import { usePWAStore } from '@/lib/stores/pwaStore';
import { useState } from 'react';

interface PWASettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PWASettingsModal({ isOpen, onClose }: PWASettingsModalProps) {
  const {
    isInstalled,
    isOnline,
    canInstall,
    notificationPermission,
    updateAvailable,
    installPWA,
    requestNotificationPermission,
    updateServiceWorker,
    clearCache,
  } = usePWAStore();

  const [clearing, setClearing] = useState(false);

  const handleClearCache = async () => {
    setClearing(true);
    await clearCache();
    setTimeout(() => {
      setClearing(false);
    }, 1000);
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
                       md:w-[600px] md:max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 
                       overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-8 h-8 text-white" />
                <h2 className="text-3xl font-bold text-white">PWA Ayarları</h2>
              </div>
              <p className="text-white/90">Progressive Web App ayarları ve bilgileri</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Status Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  📊 Durum
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Wifi className={`w-5 h-5 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-gray-700 dark:text-gray-300">Bağlantı Durumu</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isOnline
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Download className={`w-5 h-5 ${isInstalled ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-gray-700 dark:text-gray-300">Yükleme Durumu</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isInstalled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {isInstalled ? 'Yüklü' : 'Yüklü Değil'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className={`w-5 h-5 ${notificationPermission === 'granted' ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-gray-700 dark:text-gray-300">Bildirim İzni</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      notificationPermission === 'granted'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : notificationPermission === 'denied'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {notificationPermission === 'granted' ? 'Verildi' : 
                       notificationPermission === 'denied' ? 'Reddedildi' : 'Bekliyor'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  ⚙️ İşlemler
                </h3>
                <div className="space-y-3">
                  {/* Install App */}
                  {canInstall && !isInstalled && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={installPWA}
                      className="w-full p-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                                 text-white rounded-xl flex items-center gap-3 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-semibold">Uygulamayı Yükle</span>
                    </motion.button>
                  )}

                  {/* Enable Notifications */}
                  {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={requestNotificationPermission}
                      className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                                 text-white rounded-xl flex items-center gap-3 transition-all"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="font-semibold">Bildirimleri Etkinleştir</span>
                    </motion.button>
                  )}

                  {/* Update Available */}
                  {updateAvailable && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={updateServiceWorker}
                      className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                                 text-white rounded-xl flex items-center gap-3 transition-all"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span className="font-semibold">Güncellemeyi Yükle</span>
                    </motion.button>
                  )}

                  {/* Clear Cache */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearCache}
                    disabled={clearing}
                    className="w-full p-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 
                               text-white rounded-xl flex items-center gap-3 transition-all disabled:opacity-50"
                  >
                    <Trash2 className={`w-5 h-5 ${clearing ? 'animate-spin' : ''}`} />
                    <span className="font-semibold">
                      {clearing ? 'Temizleniyor...' : 'Önbelleği Temizle'}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      PWA Nedir?
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Progressive Web App, web teknolojileri ile oluşturulmuş, 
                      native uygulama gibi çalışan modern web uygulamalarıdır. 
                      Çevrimdışı çalışabilir, bildirim gönderebilir ve ana ekrana eklenebilir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  ✨ Özellikler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Çevrimdışı çalışma
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Push bildirimleri
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Hızlı yüklenme
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Ana ekrana ekleme
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Otomatik güncelleme
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Tam ekran modu
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
