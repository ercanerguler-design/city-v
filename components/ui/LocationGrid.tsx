'use client';

import React, { useState } from 'react';
import { Location } from '@/types';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LocationGridProps {
  locations: Location[];
  userLocation: { lat: number; lng: number } | null;
  showDistance?: boolean;
  showRoute?: boolean;
}

export default function LocationGrid({
  locations,
  userLocation,
  showDistance = true,
  showRoute = true
}: LocationGridProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Crowd level renkleri
  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'empty':
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'very_high':
      case 'very_crowded':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCrowdText = (level: string) => {
    switch (level) {
      case 'empty':
        return '🟢 Boş';
      case 'low':
        return '🟢 Az Kalabalık';
      case 'moderate':
        return '🟡 Normal';
      case 'high':
        return '🟠 Kalabalık';
      case 'very_high':
      case 'very_crowded':
        return '🔴 Çok Kalabalık';
      default:
        return '⚪ Bilinmiyor';
    }
  };

  // Google Maps rota açma
  const openRoute = (location: Location) => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${location.coordinates[1]},${location.coordinates[0]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedLocation(location)}
          >
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
              {(location as any).logo || location.imageUrl ? (
                <Image
                  src={(location as any).logo || location.imageUrl || ''}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white text-6xl">
                  🏪
                </div>
              )}
              
              {/* Verified Badge */}
              <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                ✓ Doğrulanmış
              </div>

              {/* Crowd Level */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border-2 ${getCrowdColor((location as any).crowdLevel || location.currentCrowdLevel || 'empty')}`}>
                {getCrowdText((location as any).crowdLevel || location.currentCrowdLevel || 'empty')}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title & Category */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                  {location.name}
                </h3>
                <p className="text-sm text-gray-500">{location.category}</p>
              </div>

              {/* Address */}
              {location.address && (
                <p className="text-xs text-gray-600 line-clamp-2 flex items-start gap-1">
                  <span>📍</span>
                  <span>{location.address}</span>
                </p>
              )}

              {/* Current People */}
              {(location as any).currentPeople !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">👥 Anlık Kişi:</span>
                  <span className={`font-semibold ${
                    ((location as any).crowdLevel === 'empty' || (location as any).crowdLevel === 'low') ? 'text-green-600' :
                    (location as any).crowdLevel === 'moderate' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(location as any).currentPeople}
                  </span>
                </div>
              )}

              {/* Business Data */}
              {location.businessData && (
                <div className="space-y-2">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {location.businessData.hasMenu && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        📋 Menü
                      </span>
                    )}
                    {location.businessData.hasCampaign && location.businessData.activeCampaigns > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded animate-pulse">
                        🔥 {location.businessData.activeCampaigns} Kampanya
                      </span>
                    )}
                    {location.businessData.features?.realTimeData && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        📡 Canlı Veri
                      </span>
                    )}
                  </div>

                  {/* Opening Hours */}
                  {location.workingHours && (
                    <p className="text-xs text-gray-500">
                      🕐 {location.workingHours.weekday}
                    </p>
                  )}

                  {/* Last Update */}
                  {location.lastUpdated && (
                    <p className="text-xs text-gray-400">
                      ⏱️ Güncelleme: {new Date(location.lastUpdated).toLocaleTimeString('tr-TR')}
                    </p>
                  )}
                </div>
              )}

              {/* Distance & Route */}
              {showDistance && location.distance !== undefined && (
                <div className="pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🚗</span>
                    <span className="font-medium">{location.distance.toFixed(1)} km</span>
                  </div>
                  
                  {showRoute && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRoute(location);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      🧭 Yol Tarifi
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {locations.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">📍 Yakınınızda kayıtlı işletme bulunamadı</p>
          <p className="text-gray-400 text-sm mt-2">Business sistemine kayıtlı işletmeler burada görünecek</p>
        </div>
      )}
    </div>
  );
}
