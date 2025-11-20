'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, Circle, Polyline, useMapEvents } from 'react-leaflet';
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
import { Users } from 'lucide-react';
import dynamic from 'next/dynamic';

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
        const heatData = (locations || []).map(loc => {
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
    updateStats,
    setViewMode,
    setHeatmapIntensity
  } = useMapStore();
  
  const [showHeatmapControls, setShowHeatmapControls] = useState(false);

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
    <div className="relative w-full h-full">
      {/* Isı Haritası Kontrol Butonu */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => {
            const newMode = viewMode === 'heatmap' ? 'standard' : 'heatmap';
            setViewMode(newMode);
            setShowHeatmapControls(newMode === 'heatmap');
            toast.success(newMode === 'heatmap' ? '🔥 Isı haritası aktif' : '📍 Marker görünümü aktif');
          }}
          className={`px-4 py-2 rounded-lg shadow-lg font-semibold transition-all ${
            viewMode === 'heatmap'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {viewMode === 'heatmap' ? '🔥 Isı Haritası' : '📊 Yoğunluk Analizi'}
        </button>
        
        {showHeatmapControls && viewMode === 'heatmap' && (
          <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Yoğunluk Hassasiyeti
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={heatmapIntensity}
              onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Düşük</span>
              <span className="font-bold">{heatmapIntensity.toFixed(1)}</span>
              <span>Yüksek</span>
            </div>
          </div>
        )}
      </div>

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
              {(locations || []).map((location) => {
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
                    <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                      <div className="text-sm">
                        <div className="font-bold text-gray-900">{location.name}</div>
                        <div className="text-gray-600 text-xs">{location.address}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700">
                            {location.category === 'restaurant' && '🍴'}
                            {location.category === 'cafe' && '☕'}
                            {location.category === 'shopping' && '🛍️'}
                            {location.category === 'entertainment' && '🎭'}
                            {location.category === 'transport' && '🚌'}
                            {location.category === 'health' && '🏥'}
                            {location.category === 'education' && '🎓'}
                            {' '}
                            {location.category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            location.currentCrowdLevel === 'empty' ? 'bg-green-100 text-green-700' :
                            location.currentCrowdLevel === 'low' ? 'bg-blue-100 text-blue-700' :
                            location.currentCrowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            location.currentCrowdLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {location.currentCrowdLevel === 'empty' && '🟢 Boş'}
                            {location.currentCrowdLevel === 'low' && '🔵 Az Kalabalık'}
                            {location.currentCrowdLevel === 'medium' && '🟡 Orta'}
                            {location.currentCrowdLevel === 'high' && '🟠 Kalabalık'}
                            {location.currentCrowdLevel === 'very_high' && '🔴 Çok Kalabalık'}
                          </span>
                        </div>
                      </div>
                    </Tooltip>
                    <Popup>
                      <LocationPopupContent 
                        location={location} 
                        distance={distance}
                        onLocationClick={onLocationClick}
                      />
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          ) : (
            // Standart mod - cluster yok
            (locations || []).map((location) => {
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
                  <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
                    <div className="text-sm">
                      <div className="font-bold text-gray-900">{location.name}</div>
                      <div className="text-gray-600 text-xs">{location.address}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">
                          {location.category === 'restaurant' && '🍴'}
                          {location.category === 'cafe' && '☕'}
                          {location.category === 'shopping' && '🛍️'}
                          {location.category === 'entertainment' && '🎭'}
                          {location.category === 'transport' && '🚌'}
                          {location.category === 'health' && '🏥'}
                          {location.category === 'education' && '🎓'}
                          {' '}
                          {location.category}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          location.currentCrowdLevel === 'empty' ? 'bg-green-100 text-green-700' :
                          location.currentCrowdLevel === 'low' ? 'bg-blue-100 text-blue-700' :
                          location.currentCrowdLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          location.currentCrowdLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {location.currentCrowdLevel === 'empty' && '🟢 Boş'}
                          {location.currentCrowdLevel === 'low' && '🔵 Az Kalabalık'}
                          {location.currentCrowdLevel === 'medium' && '🟡 Orta'}
                          {location.currentCrowdLevel === 'high' && '🟠 Kalabalık'}
                          {location.currentCrowdLevel === 'very_high' && '🔴 Çok Kalabalık'}
                        </span>
                      </div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <LocationPopupContent 
                      location={location} 
                      distance={distance}
                      onLocationClick={onLocationClick}
                    />
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
    </div>
  );
}

// Location popup içeriği
function LocationPopupContent({ location, distance, onLocationClick }: { location: Location; distance: number | null; onLocationClick?: (loc: Location) => void }) {
  return (
    <div className="p-2 min-w-[250px]">
      <h3 className="font-bold text-lg mb-2">{location.name}</h3>
      
      {/* Mesafe Bilgisi */}
      {distance !== null && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 mb-2 border border-green-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <div>
              <p className="text-xs text-gray-600">Konumunuza Uzaklık</p>
              <p className="text-sm font-bold text-green-700">
                {distance < 1 ? `${Math.round(distance * 1000)} metre` : `${distance.toFixed(2)} km`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Adres */}
      {location.address && (
        <p className="text-sm text-gray-600 mb-2">{location.address}</p>
      )}

      {/* Working Hours Badge */}
      <div className="mb-2">
        <WorkingHoursBadge location={location} size="medium" />
      </div>

      {/* Google Rating & Price Level */}
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        {location.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold ml-1">{location.rating.toFixed(1)}</span>
            </div>
            {location.reviewCount && (
              <span className="text-xs text-gray-500">({location.reviewCount})</span>
            )}
          </div>
        )}
        
        {/* Fiyat Seviyesi */}
        {location.priceLevel && (
          <div className="flex items-center gap-1">
            <span className="text-green-600">{'₺'.repeat(location.priceLevel)}</span>
            <span className="text-gray-400">{'₺'.repeat(4 - location.priceLevel)}</span>
          </div>
        )}
      </div>
      
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

      {/* Çalışma Saatleri */}
      <WorkingHoursBadge location={location} size="small" />

      {/* Real-time People Count (Business IoT) */}
      {location.source === 'business' && location.currentPeopleCount !== undefined && location.currentPeopleCount > 0 && (
        <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border-2 border-blue-300 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-700">Canlı Analiz</p>
                <p className="text-[10px] text-blue-500">📡 Gerçek Zamanlı</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-900">{location.currentPeopleCount}</p>
              <p className="text-[10px] text-blue-600 font-medium">KİŞİ</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/70 rounded-lg px-2 py-1 text-center">
              <p className="text-blue-900 font-bold">{location.currentCrowdLevel || 'moderate'}</p>
              <p className="text-blue-600 text-[10px]">Yoğunluk</p>
            </div>
            <div className="bg-white/70 rounded-lg px-2 py-1 text-center">
              <p className="text-blue-900 font-bold">{location.estimatedWaitTime || '-'}</p>
              <p className="text-blue-600 text-[10px]">Bekleme (dk)</p>
            </div>
          </div>
        </div>
      )}

      {/* Tahmini Bekleme Süresi */}
      {location.estimatedWaitTime && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">Tahmini Bekleme</p>
          <p className="text-sm font-semibold">{location.estimatedWaitTime} dk</p>
        </div>
      )}

      {/* İletişim Bilgileri */}
      {(location.phone || location.website) && (
        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
          {location.phone && (
            <a 
              href={`tel:${location.phone}`}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>📞</span>
              <span>{location.phone}</span>
            </a>
          )}
          {location.website && (
            <a 
              href={location.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>🌐</span>
              <span className="truncate">Web sitesi</span>
            </a>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 flex flex-col gap-2">
        {/* Yorum Yap - AddReviewModal'ı tetikle */}
        <button
          onClick={() => {
            // Custom event dispatch et - AddReviewModal bunu dinleyecek
            window.dispatchEvent(new CustomEvent('cityv:open-review-modal', {
              detail: { location }
            }));
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl"
        >
          <span>💬</span>
          <span>Yorum Yap</span>
        </button>

        {/* Duygu Bildir - Emoji Seçimi */}
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs font-semibold text-gray-700 mb-2 text-center">Duygunu Paylaş</p>
          <div className="flex items-center justify-center gap-2">
            {[
              { emoji: '😊', sentiment: 'happy', label: 'Mutlu' },
              { emoji: '😐', sentiment: 'neutral', label: 'Normal' },
              { emoji: '😞', sentiment: 'sad', label: 'Üzgün' },
              { emoji: '😡', sentiment: 'angry', label: 'Kızgın' }
            ].map((mood) => (
              <button
                key={mood.sentiment}
                onClick={async () => {
                  console.log('😊 Duygu bildirimi tıklandı:', {
                    locationId: location.id,
                    locationName: location.name,
                    sentiment: mood.sentiment,
                    emoji: mood.emoji
                  });
                  
                  try {
                    const response = await fetch('/api/locations/sentiment', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        locationId: location.id,
                        sentiment: mood.sentiment,
                        timestamp: new Date().toISOString()
                      })
                    });
                    
                    console.log('📡 API Response Status:', response.status);
                    
                    const data = await response.json();
                    console.log('📦 API Response Data:', data);
                    
                    if (response.ok) {
                      toast.success(`${mood.emoji} Duygunuz paylaşıldı!`);
                      console.log('✅ Duygu başarıyla kaydedildi');
                    } else {
                      console.error('❌ API Error:', data);
                      toast.error(data.error || 'Duygu bildirimi gönderilemedi');
                    }
                  } catch (error) {
                    console.error('❌ Sentiment error:', error);
                    toast.error('Bir hata oluştu');
                  }
                }}
                className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                title={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
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
