'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Wifi, WifiOff, Play, Pause, Settings, MapPin, Clock } from 'lucide-react';

interface ESP32Device {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  location: string;
  lastSeen: string;
  crowdLevel: string;
}

export default function ESP32Dashboard() {
  const [devices, setDevices] = useState<ESP32Device[]>([
    {
      id: 'esp32_001',
      name: 'Cafe Kamerası #1',
      ip: '192.168.1.100',
      status: 'online',
      location: 'Kızılay Starbucks',
      lastSeen: new Date().toISOString(),
      crowdLevel: 'moderate'
    }
  ]);

  const [selectedDevice, setSelectedDevice] = useState<ESP32Device | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [newDeviceIp, setNewDeviceIp] = useState('');
  const streamRef = useRef<HTMLImageElement>(null);

  // ESP32-CAM cihazlarını kontrol et
  const checkDeviceStatus = async (device: ESP32Device) => {
    try {
      const response = await fetch(`/api/esp32/status?deviceId=${device.id}`);
      const data = await response.json();
      
      setDevices(prev => prev.map(d => 
        d.id === device.id 
          ? { ...d, status: data.success ? 'online' : 'offline', lastSeen: new Date().toISOString() }
          : d
      ));
    } catch (error) {
      console.error('Cihaz durumu kontrol hatası:', error);
      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: 'offline' } : d
      ));
    }
  };

  // Kamera stream başlat
  const startStream = (device: ESP32Device) => {
    setSelectedDevice(device);
    setIsStreaming(true);
    
    if (streamRef.current) {
      streamRef.current.src = `http://${device.ip}/stream`;
    }
  };

  // Stream durdur
  const stopStream = () => {
    setIsStreaming(false);
    if (streamRef.current) {
      streamRef.current.src = '';
    }
  };

  // Yeni cihaz ekle
  const addDevice = async () => {
    if (!newDeviceIp) return;
    
    const newDevice: ESP32Device = {
      id: `esp32_${Date.now()}`,
      name: `ESP32-CAM ${devices.length + 1}`,
      ip: newDeviceIp,
      status: 'offline',
      location: 'Yeni Lokasyon',
      lastSeen: new Date().toISOString(),
      crowdLevel: 'unknown'
    };
    
    setDevices(prev => [...prev, newDevice]);
    setNewDeviceIp('');
    
    // Cihaz durumunu kontrol et
    await checkDeviceStatus(newDevice);
  };

  // Kalabalık seviyesi rengi
  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'empty': return 'bg-green-500';
      case 'low': return 'bg-yellow-500';
      case 'moderate': return 'bg-orange-500';
      case 'high': return 'bg-red-500';
      case 'very_high': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCrowdText = (level: string) => {
    switch (level) {
      case 'empty': return 'Boş';
      case 'low': return 'Az Kalabalık';
      case 'moderate': return 'Orta';
      case 'high': return 'Kalabalık';
      case 'very_high': return 'Çok Kalabalık';
      default: return 'Bilinmiyor';
    }
  };

  // Periyodik cihaz kontrolü
  useEffect(() => {
    const interval = setInterval(() => {
      devices.forEach(device => {
        if (device.status === 'online') {
          checkDeviceStatus(device);
        }
      });
    }, 30000); // 30 saniyede bir

    return () => clearInterval(interval);
  }, [devices]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            📹 ESP32-CAM Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            IoT kamera cihazlarınızı yönetin ve canlı görüntü izleyin
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="ESP32-CAM IP Adresi"
              value={newDeviceIp}
              onChange={(e) => setNewDeviceIp(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addDevice}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Cihaz Ekle
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cihaz Listesi */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Cihazlar ({devices.length})
            </h2>

            <div className="space-y-3">
              {devices.map((device) => (
                <motion.div
                  key={device.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedDevice?.id === device.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {device.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {device.status === 'online' ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        device.status === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {device.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {device.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      IP: {device.ip}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getCrowdColor(device.crowdLevel)}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {getCrowdText(device.crowdLevel)}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {device.status === 'online' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startStream(device);
                            }}
                            className="text-blue-500 hover:text-blue-600 p-1"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              checkDeviceStatus(device);
                            }}
                            className="text-gray-500 hover:text-gray-600 p-1"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {devices.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz cihaz eklenmemiş</p>
                  <p className="text-sm">Yukarıdan IP adresi girerek cihaz ekleyin</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canlı Stream */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Canlı Görüntü
              </h2>

              {selectedDevice && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDevice.name} - {selectedDevice.ip}
                  </span>
                  <div className="flex space-x-2">
                    {isStreaming ? (
                      <button
                        onClick={stopStream}
                        className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Durdur
                      </button>
                    ) : (
                      <button
                        onClick={() => selectedDevice && startStream(selectedDevice)}
                        className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Başlat
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden" style={{ height: '500px' }}>
              {isStreaming && selectedDevice ? (
                <img
                  ref={streamRef}
                  alt="ESP32-CAM Stream"
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.error('Stream hatası');
                    setIsStreaming(false);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Kamera Stream'i</p>
                    <p className="text-sm">
                      {selectedDevice 
                        ? 'Başlat butonuna tıklayarak stream\'i başlatın' 
                        : 'Bir cihaz seçin ve stream\'i başlatın'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Stream Overlay */}
              {isStreaming && selectedDevice && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedDevice.location}</h3>
                        <p className="text-sm opacity-90">{selectedDevice.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getCrowdColor(selectedDevice.crowdLevel)}`} />
                          <span className="text-sm">{getCrowdText(selectedDevice.crowdLevel)}</span>
                        </div>
                        <p className="text-xs opacity-75">
                          🕒 {new Date().toLocaleTimeString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bağlantı Durumu */}
              <div className="absolute top-4 right-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  isStreaming && selectedDevice
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isStreaming && selectedDevice ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  {isStreaming && selectedDevice ? 'CANLI' : 'OFFLINE'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}