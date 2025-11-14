'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface FleetOverviewProps {
  cityId?: string;
}

interface VehicleStatus {
  id: string;
  vehicleCode: string;
  routeName: string;
  currentPassengers: number;
  totalCapacity: number;
  occupancyRate: number;
  status: 'active' | 'idle' | 'maintenance';
  lastUpdate: string;
  nextStop: string;
  eta: number;
}

export default function FleetOverview({ cityId }: FleetOverviewProps) {
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    idle: 0,
    maintenance: 0,
    avgOccupancy: 0
  });

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [cityId]);

  const fetchFleetData = async () => {
    try {
      // This would be a new API endpoint for fleet overview
      // For now, using mock data structure
      const response = await fetch(`/api/transport/fleet${cityId ? `?cityId=${cityId}` : ''}`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.vehicles || []);
        setStats(data.stats || stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch fleet data:', error);
      // Set mock data for demonstration
      const mockVehicles: VehicleStatus[] = [
        {
          id: '1',
          vehicleCode: 'BUS-101',
          routeName: '250 - Kızılay - Eryaman',
          currentPassengers: 45,
          totalCapacity: 60,
          occupancyRate: 75,
          status: 'active',
          lastUpdate: new Date().toISOString(),
          nextStop: 'Ulus',
          eta: 3
        },
        {
          id: '2',
          vehicleCode: 'BUS-102',
          routeName: '250 - Kızılay - Eryaman',
          currentPassengers: 58,
          totalCapacity: 60,
          occupancyRate: 97,
          status: 'active',
          lastUpdate: new Date().toISOString(),
          nextStop: 'Kızılay',
          eta: 7
        }
      ];
      setVehicles(mockVehicles);
      setStats({
        total: 2,
        active: 2,
        idle: 0,
        maintenance: 0,
        avgOccupancy: 86
      });
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-green-400';
      case 'idle':
        return 'bg-yellow-500 text-yellow-400';
      case 'maintenance':
        return 'bg-red-500 text-red-400';
      default:
        return 'bg-gray-500 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'idle':
        return 'Beklemede';
      case 'maintenance':
        return 'Bakımda';
      default:
        return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-5 gap-4"
      >
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl p-4 border border-indigo-700">
          <div className="flex items-center gap-2 mb-2">
            <Bus className="w-5 h-5 text-indigo-300" />
            <span className="text-xs text-indigo-200">Toplam Araç</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-4 border border-green-700">
          <span className="text-xs text-green-200 block mb-2">Aktif</span>
          <p className="text-3xl font-bold text-white">{stats.active}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-4 border border-yellow-700">
          <span className="text-xs text-yellow-200 block mb-2">Beklemede</span>
          <p className="text-3xl font-bold text-white">{stats.idle}</p>
        </div>

        <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-xl p-4 border border-red-700">
          <span className="text-xs text-red-200 block mb-2">Bakımda</span>
          <p className="text-3xl font-bold text-white">{stats.maintenance}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-4 border border-purple-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-300" />
            <span className="text-xs text-purple-200">Ort. Doluluk</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.avgOccupancy}%</p>
        </div>
      </motion.div>

      {/* Vehicle List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Filo Durumu</h3>

        <div className="space-y-3">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 bg-opacity-20 rounded-lg">
                    <Bus className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{vehicle.vehicleCode}</p>
                    <p className="text-xs text-gray-400">{vehicle.routeName}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-opacity-20 ${getStatusColor(vehicle.status)}`}>
                  <div className={`w-2 h-2 rounded-full ${vehicle.status === 'active' ? 'animate-pulse' : ''}`} 
                       style={{ backgroundColor: 'currentColor' }}></div>
                  <span className="text-xs font-medium">{getStatusLabel(vehicle.status)}</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Yolcu</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {vehicle.currentPassengers}/{vehicle.totalCapacity}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block mb-1">Doluluk</span>
                  <p className="text-sm font-semibold text-white">{vehicle.occupancyRate}%</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Sonraki</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{vehicle.nextStop}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">ETA</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{vehicle.eta} dk</p>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${vehicle.occupancyRate}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full ${
                    vehicle.occupancyRate >= 100
                      ? 'bg-red-500'
                      : vehicle.occupancyRate >= 80
                      ? 'bg-orange-500'
                      : vehicle.occupancyRate >= 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
              </div>

              {/* Alert for full vehicles */}
              {vehicle.occupancyRate >= 100 && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Araç tam dolu - Alternatif hat önerilmeli</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
