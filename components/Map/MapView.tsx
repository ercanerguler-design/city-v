'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Location, CrowdLevel } from '@/types';
import { useEffect } from 'react';
import WorkingHoursBadge from '../ui/WorkingHoursBadge';
import useCrowdStore from '@/store/crowdStore';
import RealTimeCrowdTracker from '../RealTime/RealTimeCrowdTracker';
import { getCrowdIdForLocation } from '@/lib/locationMapping';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MapViewProps {
  locations: Location[];
  center: LatLngExpression;
  zoom: number;
  onLocationClick?: (location: Location) => void;
  userLocation?: [number, number] | null;
}

// Kalabalık seviyesine göre marker renkleri
const getCrowdColor = (level: CrowdLevel): string => {
  const colors = {
    empty: '#22c55e',      // yeşil
    low: '#84cc16',        // açık yeşil
    moderate: '#eab308',   // sarı
    high: '#f97316',       // turuncu
    very_high: '#ef4444',  // kırmızı
  };
  return colors[level];
};

// Kalabalık seviyesi Türkçe metinleri
const getCrowdLevelText = (level: CrowdLevel): string => {
  const texts = {
    empty: 'Boş',
    low: 'Az Kalabalık',
    moderate: 'Orta',
    high: 'Kalabalık',
    very_high: 'Çok Kalabalık',
  };
  return texts[level];
};

// Özel marker ikonu oluştur
const createCustomIcon = (color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path fill="${color}" stroke="white" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function MapUpdater({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Kullanıcı konumu marker ikonu
const createUserLocationIcon = () => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
        <circle cx="12" cy="12" r="8" fill="#3b82f6" opacity="0.3"/>
        <circle cx="12" cy="12" r="5" fill="#3b82f6"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `)}`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

export default function MapView({ locations, center, zoom, onLocationClick, userLocation }: MapViewProps) {
  const { getCrowdDataForLocation } = useCrowdStore();

  // Log MapView rendering with useEffect
  useEffect(() => {
    console.log('\n🗺️ ============================================');
    console.log('🗺️ MAPVIEW RENDER EDİLİYOR');
    console.log('🗺️ ============================================');
    console.log('📊 Gelen locations sayısı:', locations.length);
    
    if (locations.length > 0) {
      console.log('📍 İlk 3 location:');
      locations.slice(0, 3).forEach((loc, i) => {
        console.log(`   ${i+1}. ${loc.name}`);
        console.log(`      ID: ${loc.id}`);
        console.log(`      Koordinatlar: [${loc.coordinates[0]}, ${loc.coordinates[1]}]`);
        console.log(`      Kalabalık: ${loc.currentCrowdLevel}`);
      });
    } else {
      console.log('⚠️ MAPVIEW\'E HİÇ LOCATION GELMEDİ!');
    }
    console.log('🗺️ ============================================\n');
  }, [locations]);

  // Real-time crowd data ile location'ları zenginleştir
  const enrichedLocations = locations.map(location => {
    // Get crowd ID for this location
    const crowdId = getCrowdIdForLocation(location.name);
    const crowdData = crowdId ? getCrowdDataForLocation(crowdId) : null;
    
    if (crowdData) {
      console.log(`📊 Crowd data found for ${location.name}:`, {
        crowdLevel: crowdData.crowdLevel,
        crowdCount: crowdData.crowdCount,
        trend: crowdData.trend
      });
      
      return {
        ...location,
        currentCrowdLevel: crowdData.crowdLevel as CrowdLevel,
        estimatedWaitTime: crowdData.estimatedWaitTime,
        lastUpdated: new Date(crowdData.lastUpdated)
      };
    }
    return location;
  });

  // Real-time trend ikonu
  const getTrendIcon = (locationId: string) => {
    const crowdData = getCrowdDataForLocation(locationId);
    if (!crowdData) return null;
    
    switch (crowdData.trend) {
      case 'increasing':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-3 h-3 text-green-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };
  
  return (
    <div className="relative w-full h-full">
      {/* 📱 Mobile Touch Controls */}
      <div className="absolute top-4 right-4 z-[1000] md:hidden flex flex-col space-y-2">
        <button 
          onClick={() => {
            // Zoom in functionality will be handled by map instance
            console.log('Zoom in clicked');
          }}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
        >
          +
        </button>
        <button 
          onClick={() => {
            // Zoom out functionality will be handled by map instance
            console.log('Zoom out clicked');
          }}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
        >
          −
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        className="rounded-lg touch-manipulation"
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        dragging={true}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} zoom={zoom} />
      
      {/* Kullanıcı Konumu */}
      {userLocation && (
        <>
          {/* Kullanıcı konumu marker */}
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="p-2">
                <p className="font-bold">Konumunuz</p>
              </div>
            </Popup>
          </Marker>
          {/* 10km yarıçap çemberi */}
          <Circle
            center={userLocation}
            radius={10000}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              opacity: 0.5,
            }}
          />
        </>
      )}
      
      {/* Mekan Marker'ları */}
      {enrichedLocations.map((location) => {
        const distance = userLocation 
          ? calculateDistance(userLocation[0], userLocation[1], location.coordinates[0], location.coordinates[1])
          : null;

        return (
          <Marker
            key={location.id}
            position={location.coordinates}
            icon={createCustomIcon(getCrowdColor(location.currentCrowdLevel))}
            eventHandlers={{
              click: () => onLocationClick?.(location),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                
                {/* Adres */}
                {location.address && (
                  <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                )}

                {/* Google Rating */}
                {location.rating && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold ml-1">{location.rating.toFixed(1)}</span>
                    </div>
                    {location.reviewCount && (
                      <span className="text-xs text-gray-500">({location.reviewCount} değerlendirme)</span>
                    )}
                  </div>
                )}
                
                {/* Kalabalık Durumu */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCrowdColor(location.currentCrowdLevel) }}
                  ></span>
                  <span className="text-sm font-semibold">
                    {getCrowdLevelText(location.currentCrowdLevel)}
                  </span>
                  {getTrendIcon(location.id)}
                </div>
                
                {/* Real-time Crowd Info */}
                <RealTimeCrowdTracker 
                  locationId={location.id} 
                  compact={true} 
                  className="mb-2"
                />

                {/* Mesafe */}
                {distance !== null && (
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {distance.toFixed(2)} km uzaklıkta
                  </p>
                )}

                {/* Çalışma Saatleri */}
                <WorkingHoursBadge location={location} size="small" />

                {/* Tahmini Bekleme Süresi */}
                {location.estimatedWaitTime && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Tahmini Bekleme</p>
                    <p className="text-sm font-semibold">{location.estimatedWaitTime} dk</p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
    </div>
  );
}

// Haversine formülü ile mesafe hesaplama (km cinsinden)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
