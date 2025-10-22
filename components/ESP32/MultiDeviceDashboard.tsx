'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Video, Monitor, Maximize2, Minimize2, 
  Volume2, VolumeX, Settings, RefreshCw, 
  AlertCircle, CheckCircle, Wifi, Battery,
  Eye, Users, Activity, MapPin, Clock,
  Zap, Signal, RadioIcon as Radio, BarChart3
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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    // Simüle kamera feed'leri - Transport sayfasından gelen demo verileri
    const mockCameras: CameraFeed[] = [
      {
        id: 'ESP32-001',
        name: 'Kızılay Durağı Kamerası',
        location: 'Kızılay Meydanı, Ankara',
        status: 'online',
        resolution: '640x480',
        fps: 15,
        lastUpdate: new Date().toISOString(),
        peopleCount: 12,
        crowdLevel: 'medium',
        streamUrl: '/capture',
        ip: '192.168.1.101',
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
        peopleCount: 7,
        crowdLevel: 'low',
        streamUrl: '/capture',
        ip: '192.168.1.102',
        signalStrength: -52,
        batteryLevel: 93
      },
      {
        id: 'ESP32-003',
        name: 'M1 Metro Kamerası',
        location: 'M1 Metro Aracı',
        status: 'connecting',
        resolution: '640x480', 
        fps: 12,
        lastUpdate: new Date().toISOString(),
        peopleCount: 25,
        crowdLevel: 'high',
        streamUrl: '/capture',
        ip: '192.168.1.103',
        signalStrength: -68,
        batteryLevel: 76
      },
      {
        id: 'ESP32-004',
        name: '405 Otobüs Kamerası',
        location: '405 Hat Otobüsü',
        status: 'online',
        resolution: '640x480',
        fps: 10,
        lastUpdate: new Date().toISOString(),
        peopleCount: 18,
        crowdLevel: 'medium',
        streamUrl: '/capture',
        ip: '192.168.1.104',
        signalStrength: -41,
        batteryLevel: 82
      }
    ];

    setCameras(mockCameras);
    setSelectedCamera(mockCameras[0].id);
    setLoading(false);

    // Her 3 saniyede veri güncelle
    const interval = setInterval(() => {
      if (autoRefresh) {
        setCameras(prev => prev.map(camera => ({
          ...camera,
          peopleCount: Math.max(0, camera.peopleCount + Math.floor(Math.random() * 6) - 3),
          lastUpdate: new Date().toISOString(),
          crowdLevel: calculateCrowdLevel(camera.peopleCount + Math.floor(Math.random() * 6) - 3),
          signalStrength: camera.signalStrength + Math.floor(Math.random() * 6) - 3,
          batteryLevel: Math.max(20, Math.min(100, camera.batteryLevel + Math.floor(Math.random() * 3) - 1))
        })));
      }
    }, 3000);

    return () => clearInterval(interval);
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

  // Camera Video Player Component
  function CameraVideoPlayer({ camera, compact = false }: { camera: CameraFeed, compact?: boolean }) {
    return (
      <div className={`relative bg-gradient-to-br from-blue-900 to-purple-900 ${compact ? 'aspect-video' : 'aspect-video'}`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-500 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-purple-500 rounded-full blur-xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center">
            <Camera className={`${compact ? 'h-8 w-8' : 'h-16 w-16'} text-white/50 mx-auto mb-2`} />
            <div className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-white mb-1`}>
              🔴 {camera.status === 'online' ? 'CANLI' : camera.status === 'connecting' ? 'BAĞLANIYOR' : 'OFFLINE'}
            </div>
            {!compact && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-black/30 rounded-lg p-2">
                  <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-sm font-bold text-white">{camera.peopleCount}</div>
                  <div className="text-xs text-gray-300">Kişi</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2">
                  <Activity className="h-4 w-4 text-green-400 mx-auto mb-1" />
                  <div className="text-sm font-bold text-white">{camera.fps}</div>
                  <div className="text-xs text-gray-300">FPS</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Overlays */}
        <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          <div className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green-400 animate-pulse' : camera.status === 'connecting' ? 'bg-yellow-400 animate-ping' : 'bg-red-400'}`} />
          {camera.status.toUpperCase()}
        </div>

        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          {new Date().toLocaleTimeString('tr-TR')}
        </div>

        {!compact && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <Wifi className="h-3 w-3" />
              <span>{camera.signalStrength} dBm</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="h-3 w-3" />
              <span>%{camera.batteryLevel}</span>
            </div>
          </div>
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
                  ESP32-CAM Multi Dashboard
                </h1>
                <p className="text-sm text-purple-200">
                  Transport IoT Kamera İzleme Sistemi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
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
    </div>
  );
}