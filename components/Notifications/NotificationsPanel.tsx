'use client';

import React from 'react';
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

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Gerçek bildirimleri API'den yükle (KAMPANYA BİLDİRİMLERİ)
  React.useEffect(() => {
    console.log('🔔 NotificationsPanel isOpen:', isOpen);
    const loadNotifications = async () => {
      try {
        console.log('📡 Fetching campaign notifications from /api/campaigns/active...');
        const response = await fetch('/api/campaigns/active');
        const data = await response.json();
        console.log('📊 Campaign Notifications API response:', data);
        console.log(`🎯 ${data.campaigns?.length || 0} aktif kampanya bulundu`);
        
        if (data.success && data.campaigns) {
          // Kampanya bildirimlerini dönüştür - TÜM KAMPANYALARI MAP ET
          const formattedNotifications: Notification[] = data.campaigns.map((campaign: any, index: number) => {
            console.log(`📢 Kampanya ${index + 1}:`, campaign.title, '|', campaign.businessName);
            return {
              id: campaign.id?.toString() || Math.random().toString(),
              type: 'premium',
              title: `${campaign.businessName} - ${campaign.discount_percent || campaign.discount_amount}% İndirim`,
              message: campaign.description || campaign.title,
              timestamp: new Date(campaign.startDate || campaign.createdAt),
              read: false,
              icon: TrendingUp,
            };
          });
          console.log(`✅ Formatted ${formattedNotifications.length} campaign notifications`);
          setNotifications(formattedNotifications);
        } else {
          console.log('⚠️ No campaign notifications found');
          setNotifications([]);
        }
      } catch (error) {
        console.error('❌ Kampanya bildirimleri yüklenemedi:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

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
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Bildirimler yükleniyor...</p>
                </div>
              ) : notifications.length === 0 ? (
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
                notifications.map((notification) => {
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
            {!loading && notifications.length > 0 && (
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
