'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { Location, CrowdLevel } from '@/types';
import { useEffect, useState, useRef } from 'react';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useMapStore } from '@/lib/stores/mapStore';
import { 
  createCustomMarker, 
  createUserLocationIcon,
  createRoutePointIcon,
  crowdLevelColors 
} from './CustomMarkers';
import toast from 'react-hot-toast';
import WorkingHoursBadge from '../ui/WorkingHoursBadge';

interface MapViewProps {
  locations: Location[];
  center: LatLngExpression;
  zoom: number;
  onLocationClick?: (location: Location) => void;
  userLocation?: [number, number] | null;
}

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

function MapUpdater({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Isı haritası layer component
function HeatmapLayer({ locations, intensity }: { locations: Location[]; intensity: number }) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    // Dinamik import ile leaflet.heat yükle
    const loadHeatmap = async () => {
      if (typeof window !== 'undefined') {
        const L = (await import('leaflet')).default;
        const heat = (await import('leaflet.heat')).default;

        // Önceki layer'ı temizle
        if (heatLayerRef.current) {
          map.removeLayer(heatLayerRef.current);
        }

        // Isı haritası verisi hazırla
        const heatData = locations.map(loc => {
          // Yoğunluğa göre ağırlık
          const intensityMap: Record<CrowdLevel, number> = {
            empty: 0.1,
            low: 0.3,
            moderate: 0.5,
            high: 0.7,
            very_high: 1.0,
          };
          const weight = intensityMap[loc.currentCrowdLevel];
          return [loc.coordinates[0], loc.coordinates[1], weight] as [number, number, number];
        });

        // Yeni heat layer oluştur
        heatLayerRef.current = (L as any).heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          max: intensity,
          gradient: {
            0.0: '#0000ff',
            0.2: '#00ffff',
            0.4: '#00ff00',
            0.6: '#ffff00',
            0.8: '#ff9900',
            1.0: '#ff0000'
          }
        }).addTo(map);
      }
    };

    loadHeatmap();

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [locations, intensity, map]);

  return null;
}

// Rota çizimi için tıklama handler
function RouteClickHandler() {
  const { route, setRouteStart, setRouteEnd } = useMapStore();

  useMapEvents({
    click(e) {
      if (route.mode === 'none') return;

      const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];

      if (!route.startPoint) {
        setRouteStart(latlng);
        toast.success('Başlangıç noktası belirlendi', { icon: '🟢' });
      } else if (!route.endPoint) {
        setRouteEnd(latlng);
        toast.success('Bitiş noktası belirlendi', { icon: '🔴' });
      } else {
        // Yeni rota başlat
        setRouteStart(latlng);
        setRouteEnd([0, 0]); // Reset
        toast.success('Yeni rota başlatıldı', { icon: '🔄' });
      }
    },
  });

  return null;
}

export default function MapView({ locations, center, zoom, onLocationClick, userLocation }: MapViewProps) {
  const { 
    viewMode, 
    route, 
    heatmapIntensity, 
    clusteringEnabled,
    updateStats 
  } = useMapStore();

  // İstatistikleri güncelle
  useEffect(() => {
    updateStats({ totalMarkersShown: locations.length });
  }, [locations.length, updateStats]);

  // Log MapView rendering
  useEffect(() => {
    console.log('\n🗺️ ============================================');
    console.log('🗺️ MAPVIEW RENDER EDİLİYOR');
    console.log('🗺️ ============================================');
    console.log('📊 Gelen locations sayısı:', locations.length);
    console.log('🎨 Görünüm modu:', viewMode);
    console.log('🔥 Isı haritası yoğunluğu:', heatmapIntensity);
    console.log('📍 Kümeleme aktif:', clusteringEnabled);
    
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
  }, [locations, viewMode, heatmapIntensity, clusteringEnabled]);

  // Rota polyline noktaları
  const routePolyline = route.startPoint && route.endPoint 
    ? [route.startPoint, ...route.waypoints, route.endPoint] 
    : [];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} zoom={zoom} />
      <RouteClickHandler />
      
      {/* Kullanıcı Konumu */}
      {userLocation && (
        <>
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

      {/* Isı Haritası Modu */}
      {viewMode === 'heatmap' && (
        <HeatmapLayer locations={locations} intensity={heatmapIntensity} />
      )}

      {/* Standart ve Cluster Modu - Marker'lar */}
      {viewMode !== 'heatmap' && (
        <>
          {viewMode === 'cluster' && clusteringEnabled ? (
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={80}
              spiderfyOnMaxZoom
              showCoverageOnHover
              zoomToBoundsOnClick
              iconCreateFunction={(cluster: any) => {
                const count = cluster.getChildCount();
                return createCustomMarker('default', 'empty', 40 + Math.min(count / 5, 20));
              }}
            >
              {locations.map((location) => {
                const distance = userLocation 
                  ? calculateDistance(userLocation[0], userLocation[1], location.coordinates[0], location.coordinates[1])
                  : null;

                return (
                  <Marker
                    key={location.id}
                    position={location.coordinates}
                    icon={createCustomMarker(location.category, location.currentCrowdLevel)}
                    eventHandlers={{
                      click: () => onLocationClick?.(location),
                    }}
                  >
                    <Popup>
                      <LocationPopupContent location={location} distance={distance} />
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          ) : (
            // Standart mod - cluster yok
            locations.map((location) => {
              const distance = userLocation 
                ? calculateDistance(userLocation[0], userLocation[1], location.coordinates[0], location.coordinates[1])
                : null;

              return (
                <Marker
                  key={location.id}
                  position={location.coordinates}
                  icon={createCustomMarker(location.category, location.currentCrowdLevel)}
                  eventHandlers={{
                    click: () => onLocationClick?.(location),
                  }}
                >
                  <Popup>
                    <LocationPopupContent location={location} distance={distance} />
                  </Popup>
                </Marker>
              );
            })
          )}
        </>
      )}

      {/* Rota Çizimi */}
      {route.mode !== 'none' && (
        <>
          {/* Başlangıç noktası */}
          {route.startPoint && (
            <Marker
              position={route.startPoint}
              icon={createRoutePointIcon('start')}
              zIndexOffset={500}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-bold text-green-600">Başlangıç Noktası</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Bitiş noktası */}
          {route.endPoint && (
            <Marker
              position={route.endPoint}
              icon={createRoutePointIcon('end')}
              zIndexOffset={500}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-bold text-red-600">Bitiş Noktası</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Rota çizgisi */}
          {routePolyline.length > 1 && (
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: route.mode === 'walking' ? '#10B981' : route.mode === 'driving' ? '#3B82F6' : '#F59E0B',
                weight: 4,
                opacity: 0.8,
                dashArray: route.mode === 'walking' ? '5, 10' : undefined,
              }}
            />
          )}
        </>
      )}
    </MapContainer>
  );
}

// Location popup içeriği
function LocationPopupContent({ location, distance }: { location: Location; distance: number | null }) {
  return (
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
          style={{ backgroundColor: crowdLevelColors[location.currentCrowdLevel] }}
        ></span>
        <span className="text-sm font-semibold">
          {getCrowdLevelText(location.currentCrowdLevel)}
        </span>
      </div>

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
