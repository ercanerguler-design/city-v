'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

// Haritayı dynamic import et
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

interface LocationSelectorProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  onCancel: () => void;
  initialPosition?: [number, number];
}

function LocationMarker({ position, setPosition }: { position: [number, number] | null; setPosition: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationSelector({ onLocationSelect, onCancel, initialPosition }: LocationSelectorProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialPosition || [39.9334, 32.8597] // Ankara merkez
  );
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Konumdan adres al (Reverse Geocoding)
  const getAddressFromCoords = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      setAddress(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (error) {
      console.error('Adres alınamadı:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePositionChange = async (pos: [number, number]) => {
    setSelectedPosition(pos);
    await getAddressFromCoords(pos[0], pos[1]);
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect(selectedPosition[0], selectedPosition[1], address);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  ESP32-CAM Konumunu Seç
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Harita üzerinde kameranın konumuna tıklayın
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[500px]">
          <MapContainer
            center={selectedPosition || [39.9334, 32.8597]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker position={selectedPosition} setPosition={handlePositionChange} />
          </MapContainer>

          {/* Info Panel */}
          {selectedPosition && (
            <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seçilen Konum:
                  </span>
                </div>
                <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Lat:</span>{' '}
                  <span className="text-blue-600 dark:text-blue-400">{selectedPosition[0].toFixed(6)}</span>
                  {', '}
                  <span className="text-gray-600 dark:text-gray-400">Lng:</span>{' '}
                  <span className="text-blue-600 dark:text-blue-400">{selectedPosition[1].toFixed(6)}</span>
                </div>
                {address && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    📍 {address}
                  </div>
                )}
                {isLoading && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Adres alınıyor...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPosition}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Konumu Onayla
          </button>
        </div>
      </motion.div>
    </div>
  );
}
