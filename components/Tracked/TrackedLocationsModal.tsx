'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Trash2, Star } from 'lucide-react';
import { Location } from '@/types';
import { useTrackedStore } from '@/lib/stores/trackedStore';
import { getCrowdLevelColor, getCrowdLevelText } from '@/lib/utils';
import { categories } from '@/lib/categories';
import toast from 'react-hot-toast';

interface TrackedLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allLocations: Location[];
  onNavigate: (location: Location) => void;
  userLocation: [number, number] | null;
}

export default function TrackedLocationsModal({
  isOpen,
  onClose,
  allLocations,
  onNavigate,
  userLocation,
}: TrackedLocationsModalProps) {
  const { getTrackedLocations, untrackLocation } = useTrackedStore();
  const trackedLocations = getTrackedLocations(allLocations);

  const handleUntrack = (locationId: string, locationName: string) => {
    untrackLocation(locationId);
    toast.success(`❌ ${locationName} takipten çıkarıldı`);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Group by category
  const groupedLocations = trackedLocations.reduce((acc, location) => {
    const category = location.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(location);
    return acc;
  }, {} as Record<string, Location[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[70] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Takip Edilen Mekanlar</h2>
                  <p className="text-white/80 text-sm">
                    {trackedLocations.length} mekan takip ediliyor
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {trackedLocations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <Star className="w-24 h-24 mb-4 opacity-20" />
                  <p className="text-xl font-semibold mb-2">Henüz takip edilen mekan yok</p>
                  <p className="text-sm text-center max-w-md">
                    Bir mekanın kartındaki "📌 Takip Et" butonuna tıklayarak takibe ekleyebilirsiniz
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedLocations).map(([categoryId, locations]) => {
                    const category = categories.find((c) => c.id === categoryId);
                    return (
                      <div key={categoryId} className="space-y-3">
                        {/* Category Header */}
                        <div className="flex items-center gap-2 px-3">
                          <span className="text-2xl">{category?.icon || '📍'}</span>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {category?.name || categoryId}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({locations.length})
                          </span>
                        </div>

                        {/* Locations */}
                        <div className="grid gap-3">
                          {locations.map((location) => {
                            const distance = userLocation
                              ? calculateDistance(
                                  userLocation[0],
                                  userLocation[1],
                                  location.coordinates[0],
                                  location.coordinates[1]
                                )
                              : null;

                            return (
                              <motion.div
                                key={location.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-slate-600"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                                      {location.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                                      <MapPin className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate">{location.address}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                      {/* Crowd Level */}
                                      <span
                                        className="px-2 py-1 rounded-full font-medium"
                                        style={{
                                          backgroundColor: getCrowdLevelColor(location.currentCrowdLevel),
                                          color: 'white',
                                        }}
                                      >
                                        {getCrowdLevelText(location.currentCrowdLevel)}
                                      </span>

                                      {/* Distance */}
                                      {distance !== null && (
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                                          📏 {distance.toFixed(1)} km
                                        </span>
                                      )}

                                      {/* Wait Time */}
                                      {location.averageWaitTime > 0 && (
                                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full">
                                          ⏱️ {location.averageWaitTime} dk
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col gap-2">
                                    <button
                                      onClick={() => onNavigate(location)}
                                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                      title="Buraya Git"
                                    >
                                      <Navigation className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => handleUntrack(location.id, location.name)}
                                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                      title="Takibi Bırak"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
