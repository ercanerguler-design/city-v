'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, RefreshCw, Wifi, WifiOff, Activity, Eye, Zap, Globe, Expand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIDetectionOverlay from './AIDetectionOverlay';
import HeatMapOverlay from './HeatMapOverlay';

interface Camera {
  id: number;
  device_id: string;
  camera_name: string;
  ip_address: string;
  port: number;
  stream_url?: string;
  status: 'active' | 'inactive' | 'offline' | 'error';
  location?: string;
  zones?: any[];
  calibration_line?: any;
}

export default function RemoteCameraViewer({ camera, onClose }: { camera: Camera; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [connectionMode, setConnectionMode] = useState<'local' | 'remote' | 'detecting'>('detecting');
  const [showAI, setShowAI] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [stats, setStats] = useState({ in: 0, out: 0, current: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Remote access kontrolü
  useEffect(() => {
    detectConnectionMode();
  }, [camera.ip_address]);

  const detectConnectionMode = () => {
    const cameraIp = camera.ip_address;
    const localPatterns = [
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^127\./,
      /^localhost$/
    ];
    
    const isLocal = localPatterns.some(pattern => pattern.test(cameraIp));
    
    // Local kamera ise - direk bağlan (Mixed Content uyarısı olacak ama çalışır)
    // Çünkü Vercel sunucuları local network'e erişemez
    if (isLocal) {
      setConnectionMode('local');
      console.log('� Local kamera - Direkt bağlantı (Mixed Content expected)');
    } else {
      // Public IP ise proxy kullan
      setConnectionMode('remote');
      console.log('🌐 Public camera - Proxy kullanılıyor');
    }
  };

  const getStreamUrl = () => {
    // Stream URL'i al (RTSP otomatik HTTP'ye çevrilir)
    const baseUrl = getCameraStreamUrl(camera);
    
    // Remote access ise proxy kullan
    if (connectionMode === 'remote') {
      const encodedUrl = encodeURIComponent(baseUrl);
      return addCacheBusting(`/api/business/cameras/stream-proxy?url=${encodedUrl}`);
    }
    
    // Local access - direkt bağlan
    return addCacheBusting(baseUrl);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
    console.log('✅ Stream yüklendi');
  };

  const handleImageError = (e: any) => {
    setIsLoading(false);
    
    // Hata mesajını daha detaylı yap
    let errorMsg = 'Stream bağlantısı kurulamadı';
    
    if (connectionMode === 'remote') {
      errorMsg = 'Uzaktan erişim başarısız. Kamera local ağda çalışıyor olabilir.';
    } else {
      errorMsg = 'Kamera bağlantısı kurulamadı. IP adresini kontrol edin.';
    }
    
    setError(errorMsg);
    console.error('❌ Stream hatası:', e);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setRefreshKey(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Stats güncelleme (her 2 saniyede)
  useEffect(() => {
    const loadStats = async () => {
      if (!camera?.device_id && !camera?.id) {
        console.log('⚠️ No camera ID for stats');
        return;
      }
      
      try {
        const cameraId = camera.device_id || camera.id;
        const response = await fetch(`/api/business/cameras/${cameraId}/counting`);
        const data = await response.json();
        
        if (data.success && data.counting) {
          setStats({
            in: data.counting.entries || 0,
            out: data.counting.exits || 0,
            current: data.counting.current || 0
          });
        }
      } catch (err) {
        console.error('Stats yükleme hatası:', err);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, [camera.device_id]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[70] flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-7xl w-full h-full sm:h-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-t-xl p-3 sm:p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              camera.status === 'active' 
                ? 'bg-green-600 animate-pulse' 
                : 'bg-red-600'
            }`}>
              {camera.status === 'active' ? (
                <Wifi className="w-5 h-5 text-white" />
              ) : (
                <WifiOff className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Camera Info */}
            <div>
              <h3 className="text-white font-bold text-sm sm:text-lg">{camera.camera_name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  {connectionMode === 'remote' ? (
                    <>
                      <Globe className="w-3 h-3" />
                      <span>Uzaktan Erişim</span>
                    </>
                  ) : connectionMode === 'local' ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span>Yerel Ağ</span>
                    </>
                  ) : (
                    <span className="animate-pulse">Bağlantı kontrol ediliyor...</span>
                  )}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{camera.ip_address}:{camera.port}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* AI Toggle */}
            <button
              onClick={() => setShowAI(!showAI)}
              className={`p-2 rounded-lg transition-colors ${
                showAI 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="AI Algılama"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Heatmap Toggle */}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-2 rounded-lg transition-colors ${
                showHeatmap 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Isı Haritası"
            >
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors hidden sm:block"
              title="Tam Ekran"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Stream Container */}
        <div className="bg-gray-900 flex-1 rounded-b-xl overflow-hidden relative">
          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-20"
              >
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-medium">Stream yükleniyor...</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {connectionMode === 'remote' ? 'Proxy bağlantısı kuruluyor...' : 'Kamera bağlanıyor...'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mixed Content Warning for Local Cameras */}
          {connectionMode === 'local' && typeof window !== 'undefined' && window.location.protocol === 'https:' && !error && (
            <div className="absolute top-4 left-4 right-4 bg-yellow-600/90 backdrop-blur-sm p-3 rounded-lg z-10 text-white text-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-semibold mb-1">Mixed Content Uyarısı</p>
                  <p className="text-xs text-yellow-100">
                    Güvenli HTTPS siteden güvensiz HTTP kamerayı görüntülüyorsunuz. 
                    Tarayıcınız stream'i engelleyebilir. Bu durumda tarayıcı ayarlarından "güvenli olmayan içeriğe izin ver" seçeneğini aktifleştirin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-20"
              >
                <div className="text-center p-6 max-w-md">
                  <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <WifiOff className="w-10 h-10 text-red-500" />
                  </div>
                  <h4 className="text-white font-bold text-xl mb-2">Bağlantı Hatası</h4>
                  <p className="text-gray-300 mb-4">{error}</p>
                  
                  {/* Troubleshooting */}
                  <div className="bg-gray-800 rounded-lg p-4 text-left text-sm text-gray-300 mb-4">
                    <p className="font-semibold mb-2">🔍 Kontrol Edin:</p>
                    <ul className="space-y-1 text-xs">
                      <li>✓ Kamera çalışıyor mu?</li>
                      <li>✓ IP adresi doğru mu? ({camera.ip_address})</li>
                      <li>✓ Port doğru mu? ({camera.port})</li>
                      {connectionMode === 'local' && typeof window !== 'undefined' && window.location.protocol === 'https:' && (
                        <li className="text-yellow-400">⚠️ HTTPS siteden HTTP kamera: Tarayıcınız Mixed Content engelliyor olabilir</li>
                      )}
                      {connectionMode === 'remote' && (
                        <li>✓ Kamera internete açık mı? (Port forwarding)</li>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Tekrar Dene
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Stream */}
          <div className="relative w-full h-full min-h-[300px] sm:min-h-[500px]">
            <img
              ref={imageRef}
              src={getStreamUrl()}
              alt={camera.camera_name}
              className="w-full h-full object-contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* AI Detection Overlay */}
            {showAI && !isLoading && !error && imageRef.current && (
              <AIDetectionOverlay
                cameraId={camera.device_id}
                streamRef={imageRef}
              />
            )}

            {/* Heatmap Overlay */}
            {showHeatmap && !isLoading && !error && camera.zones && (
              <HeatMapOverlay
                cameraId={camera.device_id}
                zones={camera.zones}
                streamRef={imageRef}
              />
            )}

            {/* Calibration Line Overlay */}
            {camera.calibration_line && !isLoading && !error && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 5 }}
              >
                <line
                  x1={`${(camera.calibration_line.x1 / 1280) * 100}%`}
                  y1={`${(camera.calibration_line.y1 / 720) * 100}%`}
                  x2={`${(camera.calibration_line.x2 / 1280) * 100}%`}
                  y2={`${(camera.calibration_line.y2 / 720) * 100}%`}
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeDasharray="10,5"
                />
              </svg>
            )}

            {/* Stats Overlay */}
            {!isLoading && !error && (
              <div className="absolute top-4 left-4 right-4 flex gap-2 z-10">
                <div className="bg-green-600/90 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs sm:text-sm font-bold">
                  ↓ Giriş: {stats.in}
                </div>
                <div className="bg-red-600/90 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs sm:text-sm font-bold">
                  ↑ Çıkış: {stats.out}
                </div>
                <div className="bg-blue-600/90 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs sm:text-sm font-bold">
                  👥 Şu An: {stats.current}
                </div>
              </div>
            )}

            {/* Connection Mode Badge */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                connectionMode === 'remote' 
                  ? 'bg-orange-600/90 text-white' 
                  : connectionMode === 'local'
                  ? 'bg-green-600/90 text-white'
                  : 'bg-gray-600/90 text-white'
              }`}>
                {connectionMode === 'remote' && '🌐 Uzaktan'}
                {connectionMode === 'local' && '🏠 Yerel Ağ'}
                {connectionMode === 'detecting' && '🔍 Tespit ediliyor...'}
              </div>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        {!isLoading && !error && (
          <div className="bg-gray-900 rounded-b-xl p-3 border-t border-gray-700 text-xs text-gray-400">
            <div className="flex items-center justify-between">
              <span>📍 {camera.location || 'Konum belirtilmemiş'}</span>
              <span className="hidden sm:inline">Stream: MJPEG</span>
              <span className="hidden sm:inline">FPS: ~15</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
