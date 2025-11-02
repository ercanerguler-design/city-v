'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Armchair, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface SeatingMapProps {
  businessId: string;
}

interface TableData {
  tableId: string;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  occupancyRate: number;
  status: 'empty' | 'partial' | 'full';
}

interface SeatingSummary {
  totalTables: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  avgOccupancy: number;
}

export default function SeatingMap({ businessId }: SeatingMapProps) {
  const [tables, setTables] = useState<TableData[]>([]);
  const [summary, setSummary] = useState<SeatingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeatingData();
    const interval = setInterval(fetchSeatingData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [businessId]);

  const fetchSeatingData = async () => {
    try {
      const response = await fetch(`/api/business/seating?businessId=${businessId}`);
      const data = await response.json();

      if (data.success) {
        setTables(data.tables || []);
        setSummary(data.summary);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch seating data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty':
        return 'bg-green-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'full':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'empty':
        return 'Boş';
      case 'partial':
        return 'Kısmi Dolu';
      case 'full':
        return 'Dolu';
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
              <div key={i} className="h-32 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 bg-opacity-20 rounded-xl">
            <Armchair className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Oturma Haritası</h3>
            <p className="text-sm text-gray-400">Masa doluluk durumu</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Canlı</span>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-400">Toplam Masa</p>
            </div>
            <p className="text-2xl font-bold text-white">{summary.totalTables}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Toplam Koltuk</p>
            <p className="text-2xl font-bold text-blue-400">{summary.totalSeats}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Dolu Koltuk</p>
            <p className="text-2xl font-bold text-red-400">{summary.occupiedSeats}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Boş Koltuk</p>
            <p className="text-2xl font-bold text-green-400">{summary.availableSeats}</p>
          </div>
        </div>
      )}

      {/* Occupancy Bar */}
      {summary && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Doluluk Oranı</span>
            <span className="text-sm font-semibold text-white">{summary.avgOccupancy}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${summary.avgOccupancy}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${
                summary.avgOccupancy >= 80
                  ? 'bg-red-500'
                  : summary.avgOccupancy >= 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {tables.length > 0 ? (
          tables.map((table, index) => (
            <motion.div
              key={table.tableId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
            >
              {/* Table Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Masa {table.tableId}</span>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`}></div>
              </div>

              {/* Seats Visualization */}
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Armchair className="w-8 h-8 text-gray-500" />
                  </div>
                  {/* Seat indicators around table */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center border border-gray-700">
                    <span className="text-xs font-semibold text-white">{table.totalSeats}</span>
                  </div>
                </div>
              </div>

              {/* Occupancy Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Dolu</span>
                  <span className="font-semibold text-red-400">{table.occupiedSeats}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Boş</span>
                  <span className="font-semibold text-green-400">{table.availableSeats}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${table.occupancyRate}%` }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`h-full ${getStatusColor(table.status)}`}
                />
              </div>

              {/* Status Label */}
              <div className="mt-2 text-center">
                <span className={`text-xs font-medium ${
                  table.status === 'empty'
                    ? 'text-green-400'
                    : table.status === 'partial'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {getStatusLabel(table.status)}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-4 text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Henüz masa verisi yok</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-400">Boş</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-gray-400">Kısmi Dolu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-400">Dolu</span>
        </div>
      </div>
    </motion.div>
  );
}
