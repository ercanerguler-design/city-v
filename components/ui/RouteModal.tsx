'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Clock, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { Location } from '@/types';
import toast from 'react-hot-toast';
import {
  getDirections,
  RouteInfo,
  TravelMode,
  getTravelModeIcon,
  getTravelModeName,
} from '@/lib/directions';

interface RouteModalProps {
  location: Location;
  userLocation: [number, number];
  isOpen: boolean;
  onClose: () => void;
  onRouteCreated?: () => void;
}

export default function RouteModal({ location, userLocation, isOpen, onClose, onRouteCreated }: RouteModalProps) {
  const [selectedMode, setSelectedMode] = useState<TravelMode>('walking');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const travelModes: TravelMode[] = ['walking', 'driving', 'transit', 'bicycling'];

  // Rota bilgisini çek
  useEffect(() => {
    if (isOpen) {
      fetchRoute(selectedMode);
    }
  }, [isOpen, selectedMode]);

  const fetchRoute = async (mode: TravelMode) => {
    setLoading(true);
    setError(null);

    console.log('🗺️ Rota hesaplanıyor:', {
      from: userLocation,
      to: location.coordinates,
      mode,
    });

    const route = await getDirections(userLocation, location.coordinates, mode);

    if (route) {
      setRouteInfo(route);
      console.log('✅ Rota bulundu:', route);
      toast.success(`🗺️ Rota hesaplandı: ${route.duration.text}`);
      
      // Gamification callback
      onRouteCreated?.();
    } else {
      const errorMsg = mode === 'bicycling' 
        ? 'Bu bölgede bisiklet rotası bulunamadı' 
        : 'Rota hesaplanamadı';
      setError(errorMsg);
      console.error('❌ Rota bulunamadı:', mode);
      toast.error(`❌ ${errorMsg}`);
    }

    setLoading(false);
  };

  const openInGoogleMaps = () => {
    const origin = `${userLocation[0]},${userLocation[1]}`;
    const destination = `${location.coordinates[0]},${location.coordinates[1]}`;
    
    console.log('🚗 Google Maps açılıyor:', {
      locationName: location.name,
      userLocation,
      locationCoordinates: location.coordinates,
      origin,
      destination
    });
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${selectedMode}`;
    window.open(url, '_blank');
    toast.success('🗺️ Google Maps açılıyor...');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">🗺️ Rota Tarifi</h2>
                <p className="text-indigo-100 text-sm">
                  {location.name} konumuna nasıl gidilir?
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Seyahat Modları */}
            <div className="grid grid-cols-4 gap-2">
              {travelModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`p-3 rounded-lg transition-all ${
                    selectedMode === mode
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="text-2xl mb-1">{getTravelModeIcon(mode)}</div>
                  <div className="text-xs font-semibold">{getTravelModeName(mode)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600">Rota hesaplanıyor...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😕</div>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : routeInfo ? (
              <>
                {/* Özet Bilgiler */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Navigation className="w-4 h-4" />
                      <span className="text-sm">Mesafe</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {routeInfo.distance.text}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Süre</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {routeInfo.duration.text}
                    </div>
                  </div>
                </div>

                {/* Başlangıç ve Bitiş */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Başlangıç</p>
                      <p className="font-semibold text-gray-900">{routeInfo.startAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Varış</p>
                      <p className="font-semibold text-gray-900">{routeInfo.endAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Adımlar */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    📍 Yol Tarifi ({routeInfo.steps.length} adım)
                  </h3>
                  <div className="space-y-3">
                    {routeInfo.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-gray-900 mb-1"
                            dangerouslySetInnerHTML={{ __html: step.instruction }}
                          />
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{step.distance}</span>
                            <span>•</span>
                            <span>{step.duration}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Kapat
              </button>
              <button
                onClick={openInGoogleMaps}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Google Maps'te Aç
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
