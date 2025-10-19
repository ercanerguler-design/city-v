'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, X, Loader2 } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { cityConfig } from '@/lib/ankaraData';

interface LocationPickerProps {
  onCityChange: (city: 'ankara' | 'istanbul', center: [number, number], zoom: number) => void;
}

export default function LocationPicker({ onCityChange }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    userLocation,
    userAddress,
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
    
    const { userLocation: newLocation } = useLocationStore.getState();
    if (newLocation) {
      onCityChange(selectedCity, newLocation, 16);
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    }
  };

  // Dinamik konum metni
  const getLocationText = () => {
    if (userAddress?.city) {
      return userAddress.city;
    }
    if (userAddress?.country && userAddress.country !== 'Turkey' && userAddress.country !== 'Türkiye') {
      return userAddress.country;
    }
    return selectedCity === 'ankara' ? 'Ankara' : 'İstanbul';
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-24 left-4 z-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-2 group"
        title={isOpen ? "Menüyü Kapat" : "Konum Menüsü"}
      >
        <MapPin className="w-5 h-5 group-hover:animate-bounce" />
        <span className="font-semibold text-sm">{getLocationText()}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            />

            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-96 bg-white shadow-2xl z-40 overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-lg">Konum Seçimi</h3>
                      <p className="text-xs text-white/80 mt-1">Şehrinizi seçin veya konumunuzu paylaşın</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Şehir Seçin</p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCitySelect('ankara')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCity === 'ankara' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl"></span>
                        <div>
                          <p className={`font-bold ${selectedCity === 'ankara' ? 'text-indigo-700' : 'text-gray-700'}`}>Ankara</p>
                          <p className="text-xs text-gray-500">Başkent</p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">veya</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetLocation}
                  disabled={isLoadingLocation}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

                {userLocation && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800"> Konum Alındı</p>
                        <p className="text-xs text-green-600 mt-1">{userAddress?.city || 'Konum'}: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</p>
                        {userAddress?.fullAddress && (
                          <p className="text-xs text-green-600 mt-2 flex items-start gap-1">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{userAddress.fullAddress}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {locationError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800"> Hata</p>
                        <p className="text-xs text-red-600 mt-1">{locationError}</p>
                      </div>
                      <button onClick={clearLocationError} className="text-red-400 hover:text-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xl"></span>
                    <p className="text-xs text-blue-700 flex-1">
                      <strong>İpucu:</strong> Konumunuzu paylaşarak size en yakın mekanları görebilirsiniz!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
