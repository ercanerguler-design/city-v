'use client';

import { useState } from 'react';
import { Camera, MonitorDot } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * 🎛️ ESP32-CAM Cihaz Seçici
 * 
 * Ana sayfada veya header'da tüm cihazları gösterir ve seçim yapılmasını sağlar
 * 
 * @author City-V Team
 * @version 1.0.0
 */

interface Device {
  id: string;
  name: string;
  ip: string;
  location: string;
  status: 'online' | 'offline' | 'unknown';
}

const DEFAULT_DEVICES: Device[] = [
  { id: 'cam-1', name: 'GİRİŞ KAPISI', ip: '192.168.1.9', location: 'Ana Giriş', status: 'online' },
  { id: 'cam-2', name: 'KASA ALANI', ip: '192.168.1.10', location: 'Kasa Önü', status: 'offline' },
  { id: 'cam-3', name: 'ÜRÜN RAF', ip: '192.168.1.11', location: 'Raf-A', status: 'offline' },
  { id: 'cam-4', name: 'OTURMA ALANI', ip: '192.168.1.12', location: 'Kafe Köşesi', status: 'offline' },
];

export default function DeviceSelector() {
  const router = useRouter();
  const [devices] = useState<Device[]>(DEFAULT_DEVICES);

  const handleDeviceSelect = (device: Device) => {
    if (device.status === 'online') {
      // Tek cihaz görünümüne git
      router.push(`/esp32?device=${device.ip}`);
    }
  };

  const handleMultiView = () => {
    // Multi-device görünümüne git
    router.push('/esp32/multi');
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Camera className="w-7 h-7 text-blue-400" />
            ESP32-CAM Cihazları
          </h2>
          <p className="text-gray-400 mt-1">
            {onlineCount} cihaz aktif • {devices.length - onlineCount} cihaz çevrimdışı
          </p>
        </div>

        <button
          onClick={handleMultiView}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <MonitorDot className="w-5 h-5" />
          Tümünü Göster
        </button>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map(device => (
          <button
            key={device.id}
            onClick={() => handleDeviceSelect(device)}
            disabled={device.status !== 'online'}
            className={`relative p-5 rounded-lg border-2 transition-all text-left ${
              device.status === 'online'
                ? 'border-green-500 bg-green-900/20 hover:bg-green-900/30 hover:scale-105 cursor-pointer'
                : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Status Indicator */}
            <div className="absolute top-3 right-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  device.status === 'online'
                    ? 'bg-green-400 animate-pulse'
                    : 'bg-gray-600'
                }`}
              />
            </div>

            {/* Device Icon */}
            <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                device.status === 'online' ? 'bg-green-600/30' : 'bg-gray-700'
              }`}
            >
              <Camera
                className={`w-6 h-6 ${
                  device.status === 'online' ? 'text-green-400' : 'text-gray-500'
                }`}
              />
            </div>

            {/* Device Info */}
            <h3 className="text-white font-bold mb-1">{device.name}</h3>
            <p className="text-gray-400 text-sm mb-2">📍 {device.location}</p>
            <p className="text-gray-500 text-xs font-mono">{device.ip}</p>

            {/* Status Badge */}
            <div className="mt-3">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  device.status === 'online'
                    ? 'bg-green-600/30 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {device.status === 'online' ? '✅ Aktif' : '⭕ Çevrimdışı'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Info Text */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <p className="text-blue-300 text-sm">
          💡 <strong>İpucu:</strong> Aktif bir cihaza tıklayarak detaylı görünümü açabilir veya 
          "Tümünü Göster" butonuyla tüm cihazları aynı anda izleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}
