'use client';

import { motion } from 'framer-motion';
import { Navigation, MapPin, X, Loader2 } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { cityConfig } from '@/lib/ankaraData';

interface LocationPickerProps {
  onCityChange: (city: 'ankara' | 'istanbul', center: [number, number], zoom: number) => void;
}

export default function LocationPicker({ onCityChange }: LocationPickerProps) {
  const {
    userLocation,
    selectedCity,
    isLoadingLocation,
    locationError,
    setSelectedCity,
    requestUserLocation,
    clearLocationError,
  } = useLocationStore();

  const handleCitySelect = (city: 'ankara' | 'istanbul') => {
    setSelectedCity(city);
    const config = cityConfig[city];
    onCityChange(city, config.center, config.zoom);
  };

  const handleGetLocation = async () => {
    await requestUserLocation();
    
    // Konum alındıktan sonra haritayı kullanıcının konumuna odakla
    const { userLocation: newLocation } = useLocationStore.getState();
    if (newLocation) {
      onCityChange(selectedCity, newLocation, 16); // Daha yakın zoom
    }
  };

  return (
    <div className="absolute top-20 left-4 z-10 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-xs">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <h3 className="font-bold">Konum Seçimi</h3>
        </div>
        <p className="text-xs text-white/80 mt-1">Şehrinizi seçin veya konumunuzu paylaşın</p>
      </div>

      <div className="p-4 space-y-3">
        {/* City Selection */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Şehir Seçin</p>
          <div className="grid grid-cols-1 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCitySelect('ankara')}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                selectedCity === 'ankara'
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <div>
                  <p className={`font-bold text-sm ${selectedCity === 'ankara' ? 'text-indigo-700' : 'text-gray-700'}`}>
                    Ankara
                  </p>
                  <p className="text-xs text-gray-500">Başkent</p>
                </div>
              </div>
              {selectedCity === 'ankara' && (
                <div className="mt-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </motion.button>


          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">veya</span>
          </div>
        </div>

        {/* Get User Location */}
        <div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGetLocation}
            disabled={isLoadingLocation}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Konum alınıyor...</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span>Konumumu Kullan</span>
              </>
            )}
          </motion.button>
        </div>

        {/* User Location Info */}
        {userLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">Konum Alındı</p>
                <p className="text-xs text-green-600 mt-1">
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Location Error */}
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-red-600">{locationError}</p>
              </div>
              <button
                onClick={clearLocationError}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 <strong>İpucu:</strong> Konumunuzu paylaşarak size en yakın mekanları görebilirsiniz!
          </p>
        </div>
      </div>
    </div>
  );
}
