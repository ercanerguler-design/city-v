'use client';

import { useState } from 'react';
import ESP32CamDashboard from './ESP32CamDashboard';

/**
 * 🏢 Multi-Device ESP32-CAM Dashboard
 * 
 * Aynı mağazadaki 4-5 ESP32-CAM cihazını tek sayfada gösterir
 * Grid layout ile responsive tasarım
 * 
 * @author City-V Team
 * @version 1.0.0
 */

interface DeviceConfig {
  id: string;
  name: string;
  ip: string;
  location: string;
  enabled: boolean;
}

const DEFAULT_DEVICES: DeviceConfig[] = [
  { id: 'cam-1', name: 'GİRİŞ KAPISI', ip: '192.168.1.9', location: 'Ana Giriş', enabled: true },
  { id: 'cam-2', name: 'KASA ALANI', ip: '192.168.1.10', location: 'Kasa Önü', enabled: false },
  { id: 'cam-3', name: 'ÜRÜN RAF', ip: '192.168.1.11', location: 'Raf-A', enabled: false },
  { id: 'cam-4', name: 'OTURMA ALANI', ip: '192.168.1.12', location: 'Kafe Köşesi', enabled: false },
];

export default function MultiDeviceDashboard() {
  const [devices, setDevices] = useState<DeviceConfig[]>(DEFAULT_DEVICES);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid'); // grid veya single view
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const enabledDevices = devices.filter(d => d.enabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🏢 Multi-Device Dashboard
            </h1>
            <p className="text-gray-400">
              {enabledDevices.length} cihaz aktif • {devices.length - enabledDevices.length} cihaz pasif
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📊 Grid View
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🖼️ Single View
            </button>
          </div>
        </div>

        {/* Device Quick Select */}
        <div className="flex gap-3 flex-wrap">
          {devices.map(device => (
            <button
              key={device.id}
              onClick={() => {
                setDevices(prev =>
                  prev.map(d =>
                    d.id === device.id ? { ...d, enabled: !d.enabled } : d
                  )
                );
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                device.enabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {device.enabled ? '✅' : '⭕'} {device.name}
              <span className="ml-2 text-xs opacity-70">({device.ip})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      {viewMode === 'grid' ? (
        // Grid View - Tüm aktif cihazları göster
        <div
          className={`grid gap-6 ${
            enabledDevices.length === 1
              ? 'grid-cols-1'
              : enabledDevices.length === 2
              ? 'grid-cols-1 lg:grid-cols-2'
              : enabledDevices.length === 3
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
          }`}
        >
          {enabledDevices.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Hiç cihaz aktif değil
              </h2>
              <p className="text-gray-400">
                Yukarıdaki butonlardan en az bir cihazı aktif hale getirin
              </p>
            </div>
          ) : (
            enabledDevices.map(device => (
              <div
                key={device.id}
                className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all"
              >
                {/* Device Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3">
                  <h3 className="text-white font-bold">{device.name}</h3>
                  <p className="text-blue-100 text-sm">
                    📍 {device.location} • {device.ip}
                  </p>
                </div>

                {/* ESP32 Dashboard */}
                <div className="p-4">
                  <ESP32CamDashboard initialDeviceIp={device.ip} compact />
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Single View - Tek cihaz detaylı
        <div className="max-w-7xl mx-auto">
          {selectedDevice && enabledDevices.find(d => d.id === selectedDevice) ? (
            <ESP32CamDashboard
              initialDeviceIp={
                enabledDevices.find(d => d.id === selectedDevice)!.ip
              }
              compact={false}
            />
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Bir cihaz seçin
              </h2>
              <div className="flex gap-4 justify-center">
                {enabledDevices.map(device => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device.id)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                  >
                    {device.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Toplam Cihaz</div>
          <div className="text-3xl font-bold text-white">{devices.length}</div>
        </div>
        <div className="bg-green-800/30 rounded-lg p-4 border border-green-700">
          <div className="text-green-400 text-sm mb-1">Aktif Cihaz</div>
          <div className="text-3xl font-bold text-green-400">
            {enabledDevices.length}
          </div>
        </div>
        <div className="bg-yellow-800/30 rounded-lg p-4 border border-yellow-700">
          <div className="text-yellow-400 text-sm mb-1">Pasif Cihaz</div>
          <div className="text-3xl font-bold text-yellow-400">
            {devices.length - enabledDevices.length}
          </div>
        </div>
        <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-700">
          <div className="text-blue-400 text-sm mb-1">Görünüm Modu</div>
          <div className="text-2xl font-bold text-blue-400">
            {viewMode === 'grid' ? '📊 Grid' : '🖼️ Single'}
          </div>
        </div>
      </div>
    </div>
  );
}
