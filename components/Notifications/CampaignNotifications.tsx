'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Gift, TrendingUp } from 'lucide-react';

interface Notification {
  id: number;
  businessId: number;
  campaignId?: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

export default function CampaignNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    // 30 saniyede bir yeni bildirimleri kontrol et
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildirim işaretlenemedi:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return <Gift className="w-5 h-5 text-pink-400" />;
      case 'promotion':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-xl border border-white/10 transition-all"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-16 w-96 max-h-[600px] bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              Bildirimler
              {unreadCount > 0 && (
                <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">
                  {unreadCount} yeni
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowPanel(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Henüz bildirim yok</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      notification.read
                        ? 'bg-white/5 border-white/5 hover:bg-white/10'
                        : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.read ? 'bg-white/10' : 'bg-white/20'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-gray-300 text-xs mb-2">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
