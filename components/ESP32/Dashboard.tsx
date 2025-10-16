'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Wifi, WifiOff, Play, Pause, Settings, MapPin, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationSelector = dynamic(() => import('./LocationSelector'), {
  ssr: false,
});

interface ESP32Device {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline';
  location: string;
  lastSeen: string;
  crowdLevel: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
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
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [deviceToSetLocation, setDeviceToSetLocation] = useState<ESP32Device | null>(null);
  const streamRef = useRef<HTMLImageElement>(null);

  // Yeni cihaz eklendiğinde otomatik olarak son eklenen cihazı seç
  useEffect(() => {
    if (devices.length > 0) {
      setSelectedDevice(devices[devices.length - 1]);
    }
  }, [devices]);

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
    console.log(`🎥 Stream başlatılıyor: ${device.ip}`);
    
    setSelectedDevice(device);
    
    // Önce streamRef var mı kontrol et
    if (!streamRef.current) {
      console.error('❌ streamRef.current null! Lütfen bir saniye bekleyin ve tekrar deneyin.');
      // Bir sonraki render cycle'da tekrar dene
      setTimeout(() => {
        if (streamRef.current) {
          startStream(device);
        } else {
          console.error('❌ streamRef hala null, DOM güncellemesini bekleyin');
        }
      }, 100);
      return;
    }
    
    // Stream'i başlat
    setIsStreaming(true);
    
    // Localhost proxy kullan (CORS sorunu çözümü için)
    const streamUrl = `/api/esp32/proxy?ip=${device.ip}`;
    streamRef.current.src = streamUrl;
    console.log(`✅ Stream proxy URL atandı: ${streamUrl}`);
    console.log(`📡 Hedef ESP32: http://${device.ip}/stream`);
    console.log(`🔗 streamRef durumu:`, streamRef.current ? 'Mevcut' : 'Null');
  };

  // Stream durdur
  const stopStream = () => {
    console.log('⏹️ Stream durduruluyor');
    setIsStreaming(false);
    if (streamRef.current) {
      streamRef.current.src = '';
      console.log('✅ Stream URL temizlendi');
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
      location: 'Konum seçilmedi',
      lastSeen: new Date().toISOString(),
      crowdLevel: 'unknown'
    };

    setDevices(prev => [...prev, newDevice]);
    setNewDeviceIp('');

    // Cihaz durumunu kontrol et
    await checkDeviceStatus(newDevice);
    
    // Konum seçici aç
    setDeviceToSetLocation(newDevice);
    setShowLocationSelector(true);
  };

  // Cihaz konumunu güncelle
  const updateDeviceLocation = (deviceId: string, lat: number, lng: number, address?: string) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId 
        ? { 
            ...d, 
            location: address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            coordinates: { lat, lng }
          }
        : d
    ));
    setShowLocationSelector(false);
    setDeviceToSetLocation(null);
  };

  // ESP32'den otomatik konum al
  const fetchDeviceLocation = async (device: ESP32Device) => {
    try {
      const response = await fetch(`http://${device.ip}/status`);
      const data = await response.json();
      
      if (data.coordinates && data.coordinates.lat && data.coordinates.lng) {
        const { lat, lng } = data.coordinates;
        const address = data.coordinates.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        updateDeviceLocation(device.id, lat, lng, address);
        
        console.log('✅ Konum ESP32\'den alındı:', { lat, lng, address });
        alert(`✅ Konum başarıyla alındı!\n📍 ${address}\n🗺️ ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } else {
        alert('❌ ESP32\'den konum bilgisi alınamadı. Cihazın "getlocation" komutunu çalıştırdığınızdan emin olun.');
      }
    } catch (error) {
      console.error('ESP32 konum alma hatası:', error);
      alert('❌ ESP32\'ye bağlanılamadı. Cihazın çevrimiçi olduğundan emin olun.');
    }
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
                      {/* Konum Ayarla Butonu (Manuel) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeviceToSetLocation(device);
                          setShowLocationSelector(true);
                        }}
                        className="text-purple-500 hover:text-purple-600 p-1"
                        title="Manuel Konum Ayarla"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>

                      {/* Otomatik Konum Al Butonu */}
                      {device.status === 'online' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchDeviceLocation(device);
                          }}
                          className="text-green-500 hover:text-green-600 p-1"
                          title="ESP32'den Otomatik Konum Al"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      )}
                      
                      {device.status === 'online' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startStream(device);
                            }}
                            className="text-blue-500 hover:text-blue-600 p-1"
                            title="Stream Başlat"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              checkDeviceStatus(device);
                            }}
                            className="text-gray-500 hover:text-gray-600 p-1"
                            title="Durumu Kontrol Et"
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
                      <>
                        <button
                          onClick={() => selectedDevice && startStream(selectedDevice)}
                          className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Başlat
                        </button>
                        <button
                          onClick={() => {
                            if (selectedDevice) {
                              const directUrl = `http://${selectedDevice.ip}/stream`;
                              console.log('🧪 Direkt test URL:', directUrl);
                              window.open(directUrl, '_blank');
                            }
                          }}
                          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Test Direct
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden" style={{ height: '500px' }}>
              {/* Stream görüntüsü - her zaman mevcut, sadece göster/gizle */}
              <img
                ref={streamRef}
                alt="ESP32-CAM Stream"
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isStreaming && selectedDevice ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onLoad={() => {
                  console.log('✅ Stream görüntüsü yüklendi');
                }}
                onError={(e) => {
                  console.error('❌ Stream hatası:', e);
                  console.error('❌ Hatalı URL:', streamRef.current?.src);
                  console.error('❌ Cihaz IP:', selectedDevice?.ip);
                  setIsStreaming(false);
                }}
              />
              
              {/* Placeholder - stream aktif değilken göster */}
              <div className={`flex items-center justify-center h-full text-gray-500 dark:text-gray-400 absolute inset-0 transition-opacity duration-300 ${
                isStreaming && selectedDevice ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}>
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

      {/* Location Selector Modal */}
      {showLocationSelector && deviceToSetLocation && (
        <LocationSelector
          onLocationSelect={(lat, lng, address) => {
            updateDeviceLocation(deviceToSetLocation.id, lat, lng, address);
          }}
          onCancel={() => {
            setShowLocationSelector(false);
            setDeviceToSetLocation(null);
          }}
        />
      )}
    </div>
  );
}