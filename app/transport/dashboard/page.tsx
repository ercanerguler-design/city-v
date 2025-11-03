'use client';

import { useState } from 'react';
import { Bus, Users, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Import Transport Components
import { StopViewer } from '@/components/Transport/User';
import { FleetOverview, PassengerAnalytics, DelayMonitor } from '@/components/Transport/Admin';

export default function TransportDashboard() {
  const [view, setView] = useState<'user' | 'admin'>('user');
  const [selectedStopId, setSelectedStopId] = useState('1');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-8 border border-indigo-700 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">CityV Transport</h1>
              <p className="text-indigo-200 text-lg">
                Gerçek zamanlı toplu taşıma takip ve analiz sistemi
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setView('user')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  view === 'user'
                    ? 'bg-white text-indigo-900 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bus className="w-5 h-5" />
                  Kullanıcı Görünümü
                </div>
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  view === 'admin'
                    ? 'bg-white text-indigo-900 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Admin Paneli
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* User View */}
        {view === 'user' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stop Selector */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Durak Seçin
              </label>
              <select
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="1">Kızılay Meydanı</option>
                <option value="2">Ulus</option>
                <option value="3">Kocatepe</option>
              </select>
            </div>

            <StopViewer stopId={selectedStopId} />
          </motion.div>
        )}

        {/* Admin View */}
        {view === 'admin' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-4 border border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <Bus className="w-5 h-5 text-blue-300" />
                  <span className="text-xs text-blue-200">Toplam Filo</span>
                </div>
                <p className="text-3xl font-bold text-white">2</p>
                <p className="text-xs text-blue-300 mt-1">Aktif araçlar</p>
              </div>

              <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-4 border border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-300" />
                  <span className="text-xs text-green-200">Toplam Yolcu</span>
                </div>
                <p className="text-3xl font-bold text-white">103</p>
                <p className="text-xs text-green-300 mt-1">Son 1 saat</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-4 border border-purple-700">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-300" />
                  <span className="text-xs text-purple-200">Doluluk Oranı</span>
                </div>
                <p className="text-3xl font-bold text-white">86%</p>
                <p className="text-xs text-purple-300 mt-1">Ortalama</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-4 border border-yellow-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-300" />
                  <span className="text-xs text-yellow-200">Zamanında Varış</span>
                </div>
                <p className="text-3xl font-bold text-white">92%</p>
                <p className="text-xs text-yellow-300 mt-1">Son 24 saat</p>
              </div>
            </div>

            {/* Fleet Overview */}
            <FleetOverview cityId="1" />

            {/* Passenger Analytics */}
            <PassengerAnalytics stopId="1" timeRange="24hours" />

            {/* Delay Monitor */}
            <DelayMonitor stopId="1" timeRange="24hours" />
          </motion.div>
        )}

        {/* Footer Info */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-1">Sistem Durumu</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">Aktif</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Son Güncelleme</p>
              <p className="text-white font-semibold">
                {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">ESP32 Kameralar</p>
              <p className="text-white font-semibold">3 Aktif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
