'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, TrendingUp, MapPin, Crown, Users, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'crowd' | 'location' | 'premium' | 'social' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: any;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'crowd',
    title: 'Kalabalık Uyarısı',
    message: 'Starbucks Kızılay şu anda çok kalabalık. Bekleme süresi: 15 dk',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 dakika önce
    read: false,
    icon: TrendingUp,
  },
  {
    id: '2',
    type: 'location',
    title: 'Yeni Mekan',
    message: 'Yakınınıza yeni bir kafe eklendi: Espresso Lab Çankaya',
    timestamp: new Date(Date.now() - 2 * 3600000), // 2 saat önce
    read: false,
    icon: MapPin,
  },
  {
    id: '3',
    type: 'premium',
    title: 'Premium Avantaj',
    message: 'Premium üyeliğinizle tüm analitik özellikler aktif!',
    timestamp: new Date(Date.now() - 24 * 3600000), // 1 gün önce
    read: true,
    icon: Crown,
  },
  {
    id: '4',
    type: 'social',
    title: 'Yeni Takipçi',
    message: 'Ahmet K. sizi takip etmeye başladı',
    timestamp: new Date(Date.now() - 3 * 24 * 3600000), // 3 gün önce
    read: true,
    icon: Users,
  },
  {
    id: '5',
    type: 'achievement',
    title: 'Başarı Kazanıldı! 🎉',
    message: 'İlk 10 check-in rozetini kazandınız!',
    timestamp: new Date(Date.now() - 7 * 24 * 3600000), // 1 hafta önce
    read: true,
    icon: CheckCircle,
  },
];

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'crowd':
        return 'from-red-500 to-orange-500';
      case 'location':
        return 'from-blue-500 to-cyan-500';
      case 'premium':
        return 'from-yellow-500 to-amber-500';
      case 'social':
        return 'from-purple-500 to-pink-500';
      case 'achievement':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
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

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Bildirimler</h2>
                    <p className="text-white/80 text-sm">
                      {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="p-4 space-y-3">
              {mockNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Henüz bildirim yok
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Yeni bildirimler burada görünecek
                  </p>
                </div>
              ) : (
                mockNotifications.map((notification) => {
                  const Icon = notification.icon || Info;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl transition-all ${
                        notification.read
                          ? 'bg-gray-50 dark:bg-slate-700/50'
                          : 'bg-white dark:bg-slate-700 shadow-lg border-2 border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 p-2 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-semibold ${
                              notification.read
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-1.5" />
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.read
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            {mockNotifications.length > 0 && (
              <div className="sticky bottom-0 p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                    Tümünü Okundu İşaretle
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-semibold">
                    Temizle
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
