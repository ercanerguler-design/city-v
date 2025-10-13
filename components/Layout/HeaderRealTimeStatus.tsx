'use client';

import { useState } from 'react';
import useSocketStore from '@/store/socketStore';
import useCrowdStore from '@/store/crowdStore';
import useNotificationStore from '@/store/notificationStore';
import { Activity, Users, Bell, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';

export default function HeaderRealTimeStatus() {
  const { isConnected, connectionStatus } = useSocketStore();
  const { crowdData } = useCrowdStore();
  const { notifications } = useNotificationStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Son 5 dakika içindeki bildirimler
  const recentNotifications = Array.from(notifications.values()).filter(
    (notif) => Date.now() - notif.timestamp < 5 * 60 * 1000
  ).length;

  // Aktif crowd data sayısı
  const activeCrowdLocations = crowdData.size;

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'reconnecting': return 'text-orange-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionText = () => {
    return ''; // Bağlantı durumu yazısını kaldırdık
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all border border-white/20"
      >
        {isConnected ? (
          <Wifi className={`w-4 h-4 ${getConnectionColor()}`} />
        ) : (
          <WifiOff className={`w-4 h-4 ${getConnectionColor()}`} />
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <Activity className={`w-3 h-3 ${isConnected ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
          <span className="hidden sm:inline text-white/90">Canlı</span>
          {activeCrowdLocations > 0 && (
            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
              {activeCrowdLocations}
            </span>
          )}
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 text-white/70" />
        ) : (
          <ChevronDown className="w-3 h-3 text-white/70" />
        )}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bağlantı Durumu:</span>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className={`w-4 h-4 ${getConnectionColor()}`} />
                ) : (
                  <WifiOff className={`w-4 h-4 ${getConnectionColor()}`} />
                )}
                <span className={`text-sm font-medium ${getConnectionColor()}`}>
                  {getConnectionText()}
                </span>
              </div>
            </div>

            {/* Active Crowd Locations */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Aktif Lokasyonlar:</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeCrowdLocations} konum
                </span>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Son Bildirimler:</span>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {recentNotifications} yeni
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-gray-500">
                  Canlı güncellemeler {isConnected ? 'aktif' : 'pasif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}