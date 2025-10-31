'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Video, Monitor, Maximize2, Minimize2, 
  Volume2, VolumeX, Settings, RefreshCw, 
  AlertCircle, CheckCircle, Wifi, Battery,
  Eye, Users, Activity, MapPin, Clock,
  Zap, Signal, RadioIcon as Radio, BarChart3,
  X, Save
} from 'lucide-react';

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'connecting';
  resolution: string;
  fps: number;
  lastUpdate: string;
  peopleCount: number;
  crowdLevel: 'empty' | 'low' | 'medium' | 'high' | 'overcrowded';
  streamUrl: string;
  ip: string;
  signalStrength: number;
  batteryLevel: number;
}

/**
 * 🏢 Multi-Device ESP32-CAM Dashboard
 * 
 * Profesyonel çoklu kamera izleme sistemi
 * Gerçek zamanlı yoğunluk analizi ve video akışı
 * 
 * @author City-V Team
 * @version 2.0.0 - Professional Edition
 */

export default function MultiDeviceDashboard() {
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single' | 'quad'>('quad');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disable auto refresh to prevent memory issues
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  
  // IP adresi ayarları için state
  const [showSettings, setShowSettings] = useState(false);
  const [cameraIPs, setCameraIPs] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cameraIPs');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      'ESP32-001': '192.168.1.9',
      'ESP32-002': '192.168.1.10', 
      'ESP32-003': '192.168.1.11',
      'ESP32-004': '192.168.1.12',
      // Test URLs for debugging
      'TEST-001': 'test.com/sample.jpg'
    };
  });

  // API'den gerçek cihaz verilerini çek
  useEffect(() => {
    const fetchRealDeviceData = async () => {
      try {
        console.log('🔍 Fetching device data from API...');
        const response = await fetch('/api/iot/devices');
        if (response.ok) {
          const data = await response.json();
          const devices = data.devices || data; // API response formatını destekle
          console.log('📡 API devices:', devices);
          
          // API'den gelen cihazları kamera feed'lerine dönüştür
          const realCameras: CameraFeed[] = devices.slice(0, 4).map((device: any, index: number) => {
            const cameraId = device.device_id || `ESP32-${String(index + 1).padStart(3, '0')}`;
            const ipAddress = device.ip_address || cameraIPs[cameraId] || `192.168.1.${9 + index}`;
            // Geçici: IP varsa online kabul et (ESP32 gerçekten çalışıyorsa stream yüklenir, yoksa error gösterir)
            const cameraStatus = ipAddress ? 'online' : (device.is_currently_online ? 'online' : 'offline');
            
            console.log(`📹 Camera ${index + 1}: ${cameraId} at ${ipAddress}`);
            console.log(`   Status: ${cameraStatus} (is_currently_online: ${device.is_currently_online})`);
            console.log(`   Stream URL: http://${ipAddress}/stream`);
            
            return {
              id: cameraId,
              name: device.device_name || `Kamera ${index + 1}`,
              location: device.stop_name || device.location_type || 'Bilinmeyen Konum',
              status: cameraStatus,
              resolution: '640x480',
              fps: 15,
              lastUpdate: device.last_heartbeat || new Date().toISOString(),
              peopleCount: 0, // Bu değer crowd-analysis'ten gelecek
              crowdLevel: 'empty',
              streamUrl: `http://${ipAddress}/stream`,
              ip: ipAddress,
              signalStrength: device.signal_strength || -50,
              batteryLevel: device.battery_level || 100
            };
          });
          
          if (realCameras.length > 0) {
            setCameras(realCameras);
            setSelectedCamera(realCameras[0].id);
          } else {
            // Eğer API'den cihaz gelmezse mock data kullan
            initializeMockCameras();
          }
        } else {
          // API hatası durumunda mock data kullan
          console.warn('API hatası, mock data kullanılıyor');
          initializeMockCameras();
        }
      } catch (error) {
        console.error('Cihaz verileri alınamadı:', error);
        initializeMockCameras();
      } finally {
        setLoading(false);
      }
    };

    const initializeMockCameras = () => {
      console.log('🎭 Using mock camera data');
      console.log('📌 Camera IPs:', cameraIPs);
      
      const mockCameras: CameraFeed[] = [
        {
          id: 'ESP32-001',
          name: 'Kızılay Durağı Kamerası (TEST)',
          location: 'Kızılay Meydanı, Ankara',
          status: 'online',
          resolution: '640x480',
          fps: 15,
          lastUpdate: new Date().toISOString(),
          peopleCount: 0,
          crowdLevel: 'empty',
          // Test with working image URL first
          streamUrl: 'https://picsum.photos/640/480?random=1',
          ip: cameraIPs['ESP32-001'],
          signalStrength: -45,
          batteryLevel: 87
        },
        {
          id: 'ESP32-002', 
          name: 'Batıkent İstasyonu Kamerası',
          location: 'Batıkent Metro İstasyonu',
          status: 'online',
          resolution: '640x480',
          fps: 15,
          lastUpdate: new Date().toISOString(),
          peopleCount: 0,
          crowdLevel: 'empty',
          streamUrl: `http://${cameraIPs['ESP32-002']}/stream`,
          ip: cameraIPs['ESP32-002'],
          signalStrength: -52,
          batteryLevel: 93
        },
        {
          id: 'ESP32-003',
          name: 'M1 Metro Kamerası',
          location: 'M1 Metro Aracı',
          status: 'online',
          resolution: '640x480', 
          fps: 12,
          lastUpdate: new Date().toISOString(),
          peopleCount: 0,
          crowdLevel: 'empty',
          streamUrl: `http://${cameraIPs['ESP32-003']}/stream`,
          ip: cameraIPs['ESP32-003'],
          signalStrength: -68,
          batteryLevel: 76
        },
        {
          id: 'ESP32-004',
          name: '405 Otobüs Kamerası',
          location: '405 Hat Otobüsü',
          status: 'online',
          resolution: '640x480',
          fps: 15,
          lastUpdate: new Date().toISOString(),
          peopleCount: 0,
          crowdLevel: 'empty',
          streamUrl: `http://${cameraIPs['ESP32-004']}/stream`,
          ip: cameraIPs['ESP32-004'],
          signalStrength: -55,
          batteryLevel: 82
        }
      ];

      console.log('✅ Mock cameras created:', mockCameras.map(c => `${c.name} (${c.ip})`));
      setCameras(mockCameras);
      setSelectedCamera(mockCameras[0].id);
    };

    fetchRealDeviceData();
  }, [cameraIPs]);

  // Test ESP32 connectivity
  const testESP32Connection = async (ip: string) => {
    try {
      console.log(`🔍 Testing ESP32 connection: ${ip}`);
      const response = await fetch(`http://${ip}/status`, { 
        method: 'GET',
        mode: 'no-cors',
        signal: AbortSignal.timeout(3000) 
      });
      console.log(`✅ ESP32 ${ip} is reachable`);
      return true;
    } catch (error) {
      console.error(`❌ ESP32 ${ip} connection failed:`, error);
      return false;
    }
  };

  // Gerçek yoğunluk verilerini sürekli güncelle
  useEffect(() => {
    const fetchCrowdData = async () => {
      try {
        const response = await fetch('/api/iot/crowd-analysis?hours=1&limit=10');
        if (response.ok) {
          const data = await response.json();
          const crowdData = data.analyses || data;
          
          // Her cihaz için en son analiz verisini bul
          setCameras(prev => prev.map(camera => {
            const deviceAnalysis = crowdData.find((data: any) => 
              data.device_id === camera.id || 
              data.device_id?.includes(camera.id.split('-')[1])
            );
            
            if (deviceAnalysis) {
              // Yoğunluk seviyesini belirle
              let crowdLevel: 'empty' | 'low' | 'medium' | 'high' | 'overcrowded' = 'empty';
              const density = deviceAnalysis.crowd_density?.toLowerCase();
              
              if (density === 'low') crowdLevel = 'low';
              else if (density === 'medium') crowdLevel = 'medium';
              else if (density === 'high') crowdLevel = 'high';
              else if (density === 'overcrowded') crowdLevel = 'overcrowded';
              
              return {
                ...camera,
                peopleCount: deviceAnalysis.people_count || 0,
                crowdLevel: crowdLevel,
                lastUpdate: deviceAnalysis.analysis_timestamp || deviceAnalysis.timestamp || camera.lastUpdate
              };
            }
            return camera;
          }));
        }
      } catch (error) {
        console.error('Yoğunluk verileri alınamadı:', error);
      }
    };

    // İlk yükleme
    fetchCrowdData();

    // Memory dostu refresh - sadece autoRefresh true olduğunda ve 30 saniyede bir
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchCrowdData();
      }, 30000); // 30 saniye - memory tasarrufu için
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  const calculateCrowdLevel = (count: number): CameraFeed['crowdLevel'] => {
    if (count <= 0) return 'empty';
    if (count <= 5) return 'low';
    if (count <= 15) return 'medium';
    if (count <= 25) return 'high';
    return 'overcrowded';
  };

  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'empty': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'overcrowded': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connecting': return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'offline': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const selectedCameraData = cameras.find(c => c.id === selectedCamera);
  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const totalPeople = cameras.reduce((sum, c) => sum + c.peopleCount, 0);

  // Single Camera View Component
  function SingleCameraView({ camera }: { camera: CameraFeed }) {
    return (
      <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(camera.status)}
            <div>
              <h3 className="text-white font-semibold">{camera.name}</h3>
              <p className="text-gray-400 text-sm">
                {camera.location} • {camera.resolution} • {camera.fps}fps
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getCrowdLevelColor(camera.crowdLevel)}`}>
              {camera.peopleCount} kişi
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <CameraVideoPlayer camera={camera} />
      </div>
    );
  }

  // Quad Camera View Component
  function QuadCameraView({ cameras }: { cameras: CameraFeed[] }) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {cameras.map((camera) => (
          <div key={camera.id} className="bg-black rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(camera.status)}
                <h4 className="text-white font-medium text-sm">{camera.name}</h4>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCrowdLevelColor(camera.crowdLevel)}`}>
                {camera.peopleCount}
              </div>
            </div>
            <CameraVideoPlayer camera={camera} compact />
          </div>
        ))}
      </div>
    );
  }

  // Grid Camera View Component
  function GridCameraView({ cameras, onSelectCamera }: { cameras: CameraFeed[], onSelectCamera: (id: string) => void }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map((camera) => (
          <motion.div
            key={camera.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectCamera(camera.id)}
            className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all hover:bg-white/20"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(camera.status)}
                  <h4 className="text-white font-semibold">{camera.name}</h4>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCrowdLevelColor(camera.crowdLevel)}`}>
                  {camera.crowdLevel}
                </div>
              </div>
              
              <CameraVideoPlayer camera={camera} compact />
              
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Konum:</span>
                  <span className="text-white">{camera.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kişi Sayısı:</span>
                  <span className="text-white font-bold">{camera.peopleCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>FPS:</span>
                  <span className="text-white">{camera.fps}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sinyal:</span>
                  <span className="text-white">{camera.signalStrength} dBm</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Memory-optimized Camera Video Player Component
  function CameraVideoPlayer({ camera, compact = false }: { camera: CameraFeed, compact?: boolean }) {
    const [streamStatus, setStreamStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 2; // Limit retries to prevent memory overflow
    
    return (
      <div className={`relative bg-black ${compact ? 'aspect-video' : 'aspect-video'}`}>
        {/* Real ESP32-CAM Stream - Memory Optimized */}
        {camera.status === 'online' && (
          <>
            <img
              src={`${camera.streamUrl}?v=1`} // Simple versioning, no random cache busting
              alt={camera.name}
              className="w-full h-full object-cover"
              loading="lazy" // Lazy loading for performance
              onLoad={() => {
                setStreamStatus('success');
                setRetryCount(0); // Reset retry count on success
              }}
              onError={(e) => {
                console.warn(`Stream error for ${camera.name}`);
                setStreamStatus('error');
                // Limited retry mechanism to prevent memory issues
                if (retryCount < maxRetries) {
                  setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    if (e.currentTarget) {
                      e.currentTarget.src = `${camera.streamUrl}?v=${retryCount + 2}`;
                    }
                  }, 5000); // Longer delay between retries
                }
              }}
            />
            {streamStatus === 'loading' && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-white text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Yükleniyor...</p>
                </div>
              </div>
            )}
            {streamStatus === 'error' && (
              <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                  <p className="font-bold mb-2">Stream Hatası</p>
                  <p className="text-xs mb-2">{camera.streamUrl}</p>
                  <p className="text-xs opacity-75">ESP32 cihazı açık mı kontrol edin</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Fallback for offline/connecting - Memory Efficient */}
        {camera.status !== 'online' && streamStatus === 'error' && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center p-4">
              <Camera className={`${compact ? 'h-8 w-8' : 'h-16 w-16'} text-white/50 mx-auto mb-2`} />
              <div className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-white mb-1`}>
                {camera.status === 'connecting' ? '🟡 CONNECTING...' : '🔴 OFFLINE'}
              </div>
              <div className="text-xs text-white/70 mt-2">
                ESP32: {camera.streamUrl.split('//')[1]?.split('/')[0]}
              </div>
              {retryCount >= maxRetries && (
                <div className="text-xs text-red-300 mt-1">
                  Max retries reached
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Overlays */}
        <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs z-20">
          <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green-400 animate-pulse' : camera.status === 'connecting' ? 'bg-yellow-400 animate-ping' : 'bg-red-400'}`} />
          {camera.status.toUpperCase()}
        </div>

        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs z-20">
          🔴 LIVE
        </div>

        {!compact && camera.status === 'online' && (
          <>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs z-20">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-blue-400" />
                <span className="font-bold">{camera.peopleCount}</span>
                <span className="text-gray-300">kişi</span>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 flex items-center gap-3 bg-black/70 text-white px-3 py-1 rounded-lg text-xs z-20">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-400" />
                <span>{camera.fps} FPS</span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                <span>{camera.signalStrength} dBm</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Multi Kamera Dashboard
                </h1>
                <p className="text-sm text-purple-200">
                  Transport IoT Kamera İzleme Sistemi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Settings Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">IP Ayarları</span>
              </motion.button>

              {/* View Mode */}
              <div className="flex bg-black/30 rounded-lg p-1">
                {[
                  { mode: 'quad', label: '2x2', icon: BarChart3 },
                  { mode: 'grid', label: 'Grid', icon: Monitor },
                  { mode: 'single', label: 'Tek', icon: Maximize2 }
                ].map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      viewMode === mode 
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                <Radio className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">
                  {autoRefresh ? 'Canlı' : 'Duraklatıldı'}
                </span>
              </button>
              
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-purple-200 text-lg">Kamera akışları yükleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Aktif Kameralar</p>
                    <p className="text-3xl font-bold">{onlineCameras}/{cameras.length}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-emerald-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Toplam Tespit</p>
                    <p className="text-3xl font-bold">{totalPeople}</p>
                    <p className="text-blue-200 text-sm">kişi</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Ortalama FPS</p>
                    <p className="text-3xl font-bold">{Math.round(cameras.reduce((sum, c) => sum + c.fps, 0) / cameras.length)}</p>
                  </div>
                  <Activity className="h-12 w-12 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Sistem Durumu</p>
                    <p className="text-lg font-bold">%{Math.round((onlineCameras / cameras.length) * 100)}</p>
                    <p className="text-orange-200 text-sm">uptime</p>
                  </div>
                  <Signal className="h-12 w-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Camera Views */}
            {viewMode === 'single' && selectedCameraData && (
              <SingleCameraView camera={selectedCameraData} />
            )}

            {viewMode === 'quad' && (
              <QuadCameraView cameras={cameras.slice(0, 4)} />
            )}

            {viewMode === 'grid' && (
              <GridCameraView cameras={cameras} onSelectCamera={setSelectedCamera} />
            )}
          </>
        )}
      </div>

      {/* IP Settings Modal */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Kamera IP Ayarları</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {cameras.map((camera) => (
                <div key={camera.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {camera.name} - IP Adresi
                  </label>
                  <input
                    type="text"
                    value={cameraIPs[camera.id]}
                    onChange={(e) => {
                      const newIPs = { ...cameraIPs, [camera.id]: e.target.value };
                      setCameraIPs(newIPs);
                      // Update camera stream URL
                      const cameraIndex = cameras.findIndex(c => c.id === camera.id);
                      if (cameraIndex !== -1) {
                        const newCameras = [...cameras];
                        newCameras[cameraIndex] = {
                          ...newCameras[cameraIndex],
                          streamUrl: `http://${e.target.value}/stream`
                        };
                        // You might want to add state management here to persist changes
                      }
                    }}
                    placeholder="192.168.1.x"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Stream URL: http://{cameraIPs[camera.id]}/stream
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  // Save IP settings and refresh streams
                  localStorage.setItem('cameraIPs', JSON.stringify(cameraIPs));
                  setShowSettings(false);
                  // Force refresh by updating camera URLs
                  window.location.reload();
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Kaydet ve Uygula
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}