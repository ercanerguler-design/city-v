'use client';

import { useState, useEffect } from 'react';
import useNotificationStore, { PushNotification } from '@/store/notificationStore';
import { 
  Bell, 
  BellOff, 
  X, 
  Settings, 
  Check, 
  AlertCircle, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Users,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [filter, setFilter] = useState<'all' | PushNotification['type']>('all');

  const {
    notifications,
    settings,
    permission,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updateSettings,
    toggleNotificationType,
    getUnreadCount
  } = useNotificationStore();

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.type === filter
  );

  const unreadCount = getUnreadCount();

  const getNotificationIcon = (type: PushNotification['type']) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (type) {
      case 'message':
        return <MessageCircle {...iconProps} className="w-5 h-5 text-blue-500" />;
      case 'location':
        return <MapPin {...iconProps} className="w-5 h-5 text-green-500" />;
      case 'event':
        return <Calendar {...iconProps} className="w-5 h-5 text-purple-500" />;
      case 'crowd':
        return <Users {...iconProps} className="w-5 h-5 text-orange-500" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="w-5 h-5 text-red-500" />;
      case 'success':
        return <Check {...iconProps} className="w-5 h-5 text-green-500" />;
      default:
        return <Bell {...iconProps} className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: PushNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}sa önce`;
    const days = Math.floor(hours / 24);
    return `${days}g önce`;
  };

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
      }
    } catch (error) {
      console.error('Notification setup failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-600">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <h2 className="font-bold text-xl">Bildirimler</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm rounded-full px-2 py-1 min-w-[24px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notifications' 
                ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Bildirimler</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Ayarlar</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-4">
              
              {/* Notification Permission Banner */}
              {isSupported && permission !== 'granted' && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-blue-800">Bildirimler Kapalı</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Önemli güncellemeleri kaçırmamak için bildirimleri açın.
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Bildirimleri Aç
                  </button>
                </div>
              )}

              {/* Filter Bar */}
              <div className="flex items-center justify-between mb-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tüm Bildirimler</option>
                  <option value="message">Mesajlar</option>
                  <option value="location">Konum</option>
                  <option value="event">Etkinlikler</option>
                  <option value="crowd">Kalabalık</option>
                  <option value="warning">Uyarılar</option>
                </select>
                
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md
                        ${getPriorityColor(notification.priority)}
                        ${notification.isRead ? 'opacity-60' : ''}
                      `}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-gray-800 ${!notification.isRead ? 'font-bold' : ''}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.isRead && (
                                <span className="text-xs text-purple-600 font-medium">
                                  Yeni
                                </span>
                              )}
                              {notification.priority === 'urgent' && (
                                <span className="text-xs text-red-600 font-medium">
                                  Acil
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {notification.action && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notification.action?.callback) {
                                notification.action.callback();
                              } else if (notification.action?.url) {
                                window.open(notification.action.url, '_blank');
                              }
                            }}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                          >
                            {notification.action.label}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Bildirim Yok
                    </h3>
                    <p className="text-gray-500">
                      {filter === 'all' ? 'Henüz bildirim almadınız' : 'Bu kategoride bildirim yok'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6 space-y-6">
              
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.enabled ? (
                    <Bell className="w-5 h-5 text-green-500" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">Bildirimler</h3>
                    <p className="text-sm text-gray-600">Tüm bildirimleri aç/kapat</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => updateSettings({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Web Push */}
              {isSupported && permission === 'granted' && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Push Bildirimler</h3>
                      <p className="text-sm text-gray-600">Tarayıcı bildirimleri</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.webPushEnabled}
                      onChange={async (e) => {
                        try {
                          if (e.target.checked) {
                            await subscribe();
                          } else {
                            await unsubscribe();
                          }
                        } catch (error) {
                          console.error('Push notification toggle failed:', error);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              )}

              {/* Sound & Vibration */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Ses ve Titreşim</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm">Bildirim Sesi</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Titreşim</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.vibrationEnabled}
                      onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              {/* Notification Types */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Bildirim Türleri</h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'messages', label: 'Mesajlar', icon: MessageCircle },
                    { key: 'crowdUpdates', label: 'Kalabalık Güncellemeleri', icon: Users },
                    { key: 'locationShares', label: 'Konum Paylaşımları', icon: MapPin },
                    { key: 'events', label: 'Etkinlikler', icon: Calendar },
                    { key: 'emergencies', label: 'Acil Durumlar', icon: AlertCircle },
                    { key: 'system', label: 'Sistem Bildirimleri', icon: Bell },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">{label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.types[key as keyof typeof settings.types]}
                          onChange={() => toggleNotificationType(key as keyof typeof settings.types)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Sessiz Saatler</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sessiz saatleri etkinleştir</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.quietHours.enabled}
                      onChange={(e) => updateSettings({ 
                        quietHours: { ...settings.quietHours, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Başlangıç</label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => updateSettings({
                          quietHours: { ...settings.quietHours, start: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => updateSettings({
                          quietHours: { ...settings.quietHours, end: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}