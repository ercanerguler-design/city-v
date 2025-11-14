'use client';

import React, { useEffect, useState } from 'react';
import useNotificationStore, { BusinessNotification } from '@/store/notificationStore';
import { useLocationStore } from '@/store/locationStore';

const BusinessNotificationsPanel: React.FC = () => {
  const { businessNotifications, getActiveBusinessNotifications, getNearbyBusinessNotifications } = useNotificationStore();
  const { userLocation } = useLocationStore();
  const [displayNotifications, setDisplayNotifications] = useState<BusinessNotification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const active = getActiveBusinessNotifications();
    if (userLocation) {
      const nearby = getNearbyBusinessNotifications(userLocation[0], userLocation[1], 10);
      setDisplayNotifications(nearby.slice(0, showAll ? nearby.length : 3));
    } else {
      setDisplayNotifications(active.slice(0, showAll ? active.length : 3));
    }
  }, [businessNotifications, userLocation, showAll, getActiveBusinessNotifications, getNearbyBusinessNotifications]);

  if (displayNotifications.length === 0) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'restaurant':
        return '🍽️';
      case 'cafe':
        return '☕';
      case 'retail':
        return '🛍️';
      case 'beauty':
        return '💄';
      case 'fitness':
        return '🏋️';
      case 'healthcare':
        return '🏥';
      default:
        return '🏪';
    }
  };

  const getTypeColor = (type: BusinessNotification['type']) => {
    switch (type) {
      case 'campaign':
        return 'bg-red-500';
      case 'offer':
        return 'bg-green-500';
      case 'event':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          📢 Yakınınızdaki Fırsatlar
        </h3>
        {businessNotifications.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? 'Daha Az' : `+${businessNotifications.length - 3} Daha`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayNotifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white/60 rounded-lg p-3 border border-white/30 hover:bg-white/80 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {getCategoryIcon(notification.businessCategory)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-800 text-sm">
                    {notification.businessName}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getTypeColor(notification.type)}`}>
                    {notification.type === 'campaign' ? 'Kampanya' : 
                     notification.type === 'offer' ? 'Teklif' : 'Etkinlik'}
                  </span>
                </div>
                
                <h5 className="font-semibold text-gray-900 text-sm mb-1">
                  {notification.title}
                </h5>
                
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {notification.validUntil && new Date(notification.validUntil).toLocaleDateString('tr-TR')} tarihine kadar
                  </span>
                  {notification.discountCode && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-mono">
                      {notification.discountCode}
                    </span>
                  )}
                </div>
              </div>
              
              {notification.priority === 'high' && (
                <div className="text-red-500 text-sm">
                  ⚡
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {userLocation && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-gray-500 text-center">
            📍 Konumunuza 10 km mesafedeki fırsatlar gösteriliyor
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessNotificationsPanel;