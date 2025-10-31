'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, RefreshCw, Wifi, Activity, Eye, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DetectedObject {
  class: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export default function CameraLiveView({ camera, onClose }: { camera: any; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [showDetections, setShowDetections] = useState(true);
  const [counting, setCounting] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // RTSP'yi HTTP'ye çevir - Browser RTSP desteklemiyor
  const getHttpStreamUrl = () => {
    let url = camera.stream_url || `http://${camera.ip_address}:${camera.port}/stream`;
    
    // RTSP URL'ini parse et ve HTTP'ye çevir
    if (url.startsWith('rtsp://')) {
      try {
        // rtsp://user:pass@192.168.1.2:80/stream formatını parse et
        const rtspRegex = /rtsp:\/\/(?:([^:]+):([^@]+)@)?(.+)/;
        const match = url.match(rtspRegex);
        
        if (match) {
          const [, username, password, hostPath] = match;
          // HTTP URL'e çevir - ESP32-CAM için genelde /stream endpoint'i
          url = `http://${hostPath}`;
          
          // Eğer credentials varsa basic auth header ile proxy kullan
          if (username && password) {
            // Camera proxy API'sine yönlendir
            url = `/api/camera-proxy?url=${encodeURIComponent(url)}&auth=${btoa(`${username}:${password}`)}`;
          }
        }
      } catch (e) {
        console.error('RTSP URL parse error:', e);
        // Fallback: IP:port/stream
        url = `http://${camera.ip_address}:${camera.port}/stream`;
      }
    }
    
    return url;
  };
  
  const streamUrl = getHttpStreamUrl();
  const finalStreamUrl = `${streamUrl}${streamUrl.includes('?') ? '&' : '?'}t=${refreshKey}`;

  // Otomatik refresh (her 5 saniyede bir)
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // AI Object Detection - her 3 saniyede bir
  useEffect(() => {
    loadDetections();
    loadCounting();
    
    const detectionInterval = setInterval(() => {
      loadDetections();
    }, 3000);

    const countingInterval = setInterval(() => {
      loadCounting();
    }, 2000);

    const heatmapInterval = setInterval(() => {
      loadHeatmap();
    }, 4000);

    return () => {
      clearInterval(detectionInterval);
      clearInterval(countingInterval);
      clearInterval(heatmapInterval);
    };
  }, [camera.device_id]);

  const loadDetections = async () => {
    try {
      const response = await fetch(`/api/business/cameras/${camera.device_id}/detect`);
      const data = await response.json();
      
      if (data.success && data.detections?.objects) {
        setDetections(data.detections.objects);
      }
    } catch (error) {
      console.error('Detection load error:', error);
    }
  };

  const loadCounting = async () => {
    try {
      const response = await fetch(`/api/business/cameras/${camera.device_id}/counting`);
      const data = await response.json();
      
      if (data.success && data.counting) {
        setCounting(data.counting);
      }
    } catch (error) {
      console.error('Counting load error:', error);
    }
  };

  const loadHeatmap = async () => {
    try {
      const response = await fetch(`/api/business/cameras/${camera.device_id}/heatmap`);
      const data = await response.json();
      
      if (data.success && data.heatmap) {
        setHeatmap(data);
      }
    } catch (error) {
      console.error('Heatmap load error:', error);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(false);
    setRefreshKey(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-6xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 rounded-t-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              {camera.status === 'active' ? (
                <Wifi className="w-5 h-5 text-white" />
              ) : (
                <Activity className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white">{camera.camera_name}</h3>
              <p className="text-sm text-gray-400">{camera.location_description || `${camera.ip_address}:${camera.port}`}</p>
            </div>
            <div className="ml-2 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${camera.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className={`text-xs font-medium ${camera.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                {camera.status === 'active' ? 'CANLI' : 'OFFLINE'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowDetections(!showDetections)}
              className={`p-2 rounded-lg transition-colors ${showDetections ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-800'}`}
              title={showDetections ? 'AI Detection Aktif' : 'AI Detection Kapalı'}
            >
              <Eye className={`w-5 h-5 ${showDetections ? 'text-white' : 'text-gray-300'}`} />
            </button>
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-2 rounded-lg transition-colors ${showHeatmap ? 'bg-orange-600 hover:bg-orange-700' : 'hover:bg-gray-800'}`}
              title={showHeatmap ? 'Heatmap Aktif' : 'Heatmap Kapalı'}
            >
              <Activity className={`w-5 h-5 ${showHeatmap ? 'text-white' : 'text-gray-300'}`} />
            </button>
            <button 
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw className={`w-5 h-5 text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Tam Ekran"
            >
              <Maximize2 className="w-5 h-5 text-gray-300" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Video Stream */}
        <div className="bg-black rounded-b-xl overflow-hidden relative" style={{ minHeight: '500px' }}>
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Kamera akışı yükleniyor...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Activity className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
                <p className="text-white font-medium mb-2">Kamera Bağlantısı Kurulamadı</p>
                <p className="text-gray-400 text-sm mb-4">
                  {streamUrl}
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          )}

          <div className="relative w-full h-full">
            <img
              ref={imageRef}
              src={finalStreamUrl}
              alt={`${camera.camera_name} canlı görüntü`}
              className={`w-full h-auto ${isLoading || error ? 'hidden' : 'block'}`}
              style={{ maxHeight: '80vh', minHeight: '500px', objectFit: 'contain' }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* AI Detection Overlay + Calibration Line */}
            {!isLoading && !error && imageRef.current && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                  maxHeight: '80vh',
                  minHeight: '500px'
                }}
                viewBox={`0 0 ${imageRef.current.naturalWidth || 1920} ${imageRef.current.naturalHeight || 1080}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Heatmap Zones */}
                {showHeatmap && heatmap?.zones && heatmap.zones.length > 0 && (
                  <g>
                    {heatmap.zones.map((zone: any, index: number) => {
                      const heatmapData = heatmap.heatmap?.find((h: any) => h.zone_id === zone.id);
                      const fillColor = heatmapData?.color || '#3B82F6';
                      const opacity = showDetections ? 0.3 : 0.5;

                      return (
                        <g key={zone.id}>
                          {/* Zone Polygon */}
                          <polygon
                            points={zone.points.map((p: any) => `${p.x},${p.y}`).join(' ')}
                            fill={fillColor}
                            fillOpacity={opacity}
                            stroke={fillColor}
                            strokeWidth="3"
                          />
                          
                          {/* Zone Info */}
                          {heatmapData && (
                            <g>
                              {/* Zone Name + Count */}
                              <text
                                x={zone.points.reduce((sum: number, p: any) => sum + p.x, 0) / zone.points.length}
                                y={zone.points.reduce((sum: number, p: any) => sum + p.y, 0) / zone.points.length - 10}
                                fill="white"
                                fontSize="18"
                                fontWeight="700"
                                fontFamily="system-ui"
                                textAnchor="middle"
                                stroke="black"
                                strokeWidth="3"
                                paintOrder="stroke"
                              >
                                {zone.name}
                              </text>
                              <text
                                x={zone.points.reduce((sum: number, p: any) => sum + p.x, 0) / zone.points.length}
                                y={zone.points.reduce((sum: number, p: any) => sum + p.y, 0) / zone.points.length + 20}
                                fill="white"
                                fontSize="24"
                                fontWeight="900"
                                fontFamily="system-ui"
                                textAnchor="middle"
                                stroke="black"
                                strokeWidth="3"
                                paintOrder="stroke"
                              >
                                {heatmapData.people_count} kişi
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Calibration Line */}
                {counting?.calibration_line && counting.calibration_line.x1 && (
                  <g>
                    <line
                      x1={counting.calibration_line.x1}
                      y1={counting.calibration_line.y1}
                      x2={counting.calibration_line.x2}
                      y2={counting.calibration_line.y2}
                      stroke="#EF4444"
                      strokeWidth="4"
                      strokeDasharray="10,5"
                    />
                    {/* Entry/Exit Labels */}
                    <text
                      x={counting.calibration_line.x1}
                      y={counting.calibration_line.y1 - 10}
                      fill="#EF4444"
                      fontSize="16"
                      fontWeight="700"
                      fontFamily="system-ui"
                    >
                      {counting.entry_direction === 'up_to_down' || counting.entry_direction === 'left_to_right' ? '↓ GİRİŞ' : '↑ ÇIKIŞ'}
                    </text>
                    <text
                      x={counting.calibration_line.x2}
                      y={counting.calibration_line.y2 + 25}
                      fill="#EF4444"
                      fontSize="16"
                      fontWeight="700"
                      fontFamily="system-ui"
                    >
                      {counting.entry_direction === 'up_to_down' || counting.entry_direction === 'left_to_right' ? '↑ ÇIKIŞ' : '↓ GİRİŞ'}
                    </text>
                  </g>
                )}

                {/* AI Detection Boxes */}
                {showDetections && (
                  <AnimatePresence>
                    {detections.map((obj, index) => {
                      const color = obj.class === 'person' ? '#3B82F6' : '#10B981';
                      const label = `${obj.class} ${Math.round(obj.confidence * 100)}%`;
                      
                      return (
                        <motion.g
                          key={`${obj.class}-${index}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Bounding Box */}
                          <rect
                            x={obj.bbox.x}
                            y={obj.bbox.y}
                            width={obj.bbox.width}
                            height={obj.bbox.height}
                            fill="none"
                            stroke={color}
                            strokeWidth="3"
                            rx="4"
                          />
                          
                          {/* Label Background */}
                          <rect
                            x={obj.bbox.x}
                            y={obj.bbox.y - 25}
                            width={label.length * 8 + 10}
                            height="22"
                            fill={color}
                            rx="4"
                          />
                          
                          {/* Label Text */}
                          <text
                            x={obj.bbox.x + 5}
                            y={obj.bbox.y - 9}
                            fill="white"
                            fontSize="14"
                            fontWeight="600"
                            fontFamily="system-ui"
                          >
                            {label}
                          </text>
                        </motion.g>
                      );
                    })}
                  </AnimatePresence>
                )}
              </svg>
            )}
          </div>

          {/* Info Overlay */}
          {!isLoading && !error && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">
                    {detections.filter(d => d.class === 'person').length} kişi
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-600"></div>
                {showDetections && (
                  <>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">
                        {detections.length} nesne
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gray-600"></div>
                  </>
                )}
                <div className="text-sm text-gray-300">
                  {camera.resolution || '1920x1080'} • {camera.fps || 30}fps
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                {showDetections && detections.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-blue-600 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-xs font-medium text-white">AI</span>
                  </motion.div>
                )}
                {showHeatmap && heatmap?.zones && heatmap.zones.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-orange-600 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4 text-white" />
                    <span className="text-xs font-medium text-white">HEATMAP</span>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Camera Info */}
        <div className="bg-gray-900 rounded-b-xl p-4 mt-px">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400">Giriş</p>
              <p className="text-lg font-bold text-green-400">
                {counting?.total_entries || camera.total_entries || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Çıkış</p>
              <p className="text-lg font-bold text-red-400">
                {counting?.total_exits || camera.total_exits || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">İçeride</p>
              <p className="text-lg font-bold text-blue-400">
                {counting?.current_occupancy || camera.current_occupancy || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Kapasite</p>
              <p className="text-lg font-bold text-white">
                {counting?.max_capacity || camera.max_capacity || '∞'}
              </p>
            </div>
          </div>

          {/* Calibration Warning */}
          {counting && !counting.calibrated && (
            <div className="mt-3 p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
              <p className="text-xs text-yellow-300 text-center">
                ⚠️ Kamera kalibre edilmemiş - Giriş/Çıkış sayımı yapılmıyor
              </p>
            </div>
          )}

          {/* Occupancy Progress */}
          {counting?.occupancy_percent && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Doluluk</span>
                <span className="text-xs font-bold text-white">{counting.occupancy_percent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${counting.occupancy_percent}%` }}
                  className={`h-full ${
                    counting.occupancy_percent < 50 ? 'bg-green-500' :
                    counting.occupancy_percent < 75 ? 'bg-yellow-500' :
                    counting.occupancy_percent < 90 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
