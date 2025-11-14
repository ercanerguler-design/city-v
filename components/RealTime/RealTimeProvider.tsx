'use client';

import { useEffect, useState } from 'react';
import useSocketStore from '@/store/socketStore';

import ChatFloatingButton from './ChatFloatingButton';
import NotificationsPanel from './NotificationsPanel';
import LiveLocationSharing from './LiveLocationSharing';
import LiveEventTracker from './LiveEventTracker';
import { Bell, MapPin, Calendar, MessageCircle, Menu, X } from 'lucide-react';

interface RealTimeProviderProps {
  children: React.ReactNode;
  currentUserId: string;
  currentUserName: string;
  userLocation?: [number, number];
}

export default function RealTimeProvider({
  children,
  currentUserId,
  currentUserName,
  userLocation
}: RealTimeProviderProps) {
  const [activePanel, setActivePanel] = useState<'none' | 'notifications' | 'location' | 'events'>('none');
  const [showMenu, setShowMenu] = useState(false);
  const { connect, isConnected } = useSocketStore();

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  const closePanel = () => setActivePanel('none');

  return (
    <>
      {children}
      
      {/* Connection Status Indicator kaldırıldı - Header'da gösteriliyor */}

      {/* Real-Time Features Menu */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className={`flex flex-col gap-3 transition-all duration-300 ${showMenu ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2 pointer-events-none'}`}>
          
          {/* Notifications Button */}
          <button
            onClick={() => setActivePanel('notifications')}
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
            title="Bildirimler"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute left-14 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Bildirimler
            </span>
          </button>

          {/* Location Sharing Button */}
          <button
            onClick={() => setActivePanel('location')}
            className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
            title="Konum Paylaşımı"
          >
            <MapPin className="w-5 h-5" />
            <span className="absolute left-14 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Konum Paylaşımı
            </span>
          </button>

          {/* Events Button */}
          <button
            onClick={() => setActivePanel('events')}
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
            title="Canlı Etkinlikler"
          >
            <Calendar className="w-5 h-5" />
            <span className="absolute left-14 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Canlı Etkinlikler
            </span>
          </button>
        </div>

        {/* Menu Toggle Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-14 h-14 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center mt-3"
        >
          {showMenu ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Chat Floating Button - Always visible */}
      <ChatFloatingButton
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />

      {/* Panels */}
      <NotificationsPanel
        isOpen={activePanel === 'notifications'}
        onClose={closePanel}
      />

      <LiveLocationSharing
        isOpen={activePanel === 'location'}
        onClose={closePanel}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />

      <LiveEventTracker
        isOpen={activePanel === 'events'}
        onClose={closePanel}
        userLocation={userLocation}
      />




    </>
  );
}