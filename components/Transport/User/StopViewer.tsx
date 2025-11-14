'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Clock, Users, TrendingDown, MapPin, AlertCircle } from 'lucide-react';

interface StopViewerProps {
  stopId: string;
}

interface Vehicle {
  vehicleCode: string;
  eta: number;
  occupancy: {
    current: number;
    capacity: number;
    percentage: number;
  };
  crowdLevel: string;
  routeName: string;
}

interface StopInfo {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface CurrentCrowd {
  peopleWaiting: number;
  crowdLevel: string;
  queueLength: number;
  avgWaitTime: number;
}

const crowdLevelColors: { [key: string]: string } = {
  very_low: 'text-green-400 bg-green-500',
  low: 'text-blue-400 bg-blue-500',
  medium: 'text-yellow-400 bg-yellow-500',
  high: 'text-orange-400 bg-orange-500',
  very_high: 'text-red-400 bg-red-500',
  full: 'text-red-600 bg-red-600'
};

const crowdLevelLabels: { [key: string]: string } = {
  very_low: 'Çok Rahat',
  low: 'Rahat',
  medium: 'Normal',
  high: 'Kalabalık',
  very_high: 'Çok Kalabalık',
  full: 'Tam Dolu'
};

export default function StopViewer({ stopId }: StopViewerProps) {
  const [stopInfo, setStopInfo] = useState<StopInfo | null>(null);
  const [currentCrowd, setCurrentCrowd] = useState<CurrentCrowd | null>(null);
  const [incomingVehicles, setIncomingVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStopData();
    const interval = setInterval(fetchStopData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [stopId]);

  const fetchStopData = async () => {
    try {
      const response = await fetch(`/api/transport/live?stopId=${stopId}`);
      const data = await response.json();

      if (data.success) {
        setStopInfo(data.stop);
        setCurrentCrowd(data.currentCrowd);
        setIncomingVehicles(data.incomingVehicles || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stop data:', error);
      setLoading(false);
    }
  };

  const formatETA = (minutes: number) => {
    if (minutes < 1) return 'Yaklaşıyor';
    if (minutes === 1) return '1 dakika';
    return `${minutes} dakika`;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/2"></div>
          <div className="h-24 bg-gray-800 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const crowdColor = currentCrowd ? crowdLevelColors[currentCrowd.crowdLevel] || 'text-gray-400 bg-gray-500' : 'text-gray-400 bg-gray-500';
  const crowdLabel = currentCrowd ? crowdLevelLabels[currentCrowd.crowdLevel] || 'Bilinmiyor' : 'Bilinmiyor';

  return (
    <div className="space-y-6">
      {/* Stop Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 border border-indigo-700 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-white bg-opacity-10 rounded-xl">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{stopInfo?.name}</h2>
            <p className="text-indigo-200 text-sm">Durak Bilgileri</p>
          </div>
        </div>

        {/* Current Crowd Status */}
        {currentCrowd && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-indigo-200" />
                <span className="text-xs text-indigo-200">Bekleyen</span>
              </div>
              <p className="text-2xl font-bold text-white">{currentCrowd.peopleWaiting}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-indigo-200" />
                <span className="text-xs text-indigo-200">Ort. Bekleme</span>
              </div>
              <p className="text-2xl font-bold text-white">{currentCrowd.avgWaitTime} dk</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <span className="text-xs text-indigo-200 block mb-2">Durum</span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${crowdColor} bg-opacity-20`}>
                {crowdLabel}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Incoming Vehicles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Gelen Araçlar</h3>

        <AnimatePresence mode="popLayout">
          {incomingVehicles.length > 0 ? (
            <div className="space-y-3">
              {incomingVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.vehicleCode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    {/* Vehicle Info */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 bg-opacity-20 rounded-xl">
                        <Bus className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{vehicle.routeName}</p>
                        <p className="text-sm text-gray-400">Araç: {vehicle.vehicleCode}</p>
                      </div>
                    </div>

                    {/* ETA */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        <span className="text-2xl font-bold text-white">{formatETA(vehicle.eta)}</span>
                      </div>
                      <p className="text-xs text-gray-400">Tahmini varış</p>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Doluluk</span>
                      <span className="text-xs font-semibold text-white">
                        {vehicle.occupancy.current}/{vehicle.occupancy.capacity} kişi
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${vehicle.occupancy.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-full ${
                          vehicle.occupancy.percentage >= 100
                            ? 'bg-red-500'
                            : vehicle.occupancy.percentage >= 80
                            ? 'bg-orange-500'
                            : vehicle.occupancy.percentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Crowd Level Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      crowdLevelColors[vehicle.crowdLevel]
                    } bg-opacity-20`}>
                      {crowdLevelLabels[vehicle.crowdLevel] || 'Bilinmiyor'}
                    </span>
                    {vehicle.occupancy.percentage >= 100 && (
                      <div className="flex items-center gap-1 text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Tam Dolu</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bus className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">Şu anda gelen araç bulunmuyor</p>
              <p className="text-sm text-gray-500 mt-2">Araçlar yaklaştığında burada görünecek</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
