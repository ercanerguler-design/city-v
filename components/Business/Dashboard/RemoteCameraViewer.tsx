'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { X, Maximize2, RefreshCw, Wifi, WifiOff, Activity, Eye, Zap, Globe, Expand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCameraStreamUrl, addCacheBusting } from '@/lib/streamUtils';
import HeatMapOverlay from './HeatMapOverlay';
import TensorFlowAIAnalysis from './TensorFlowAIAnalysis';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

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

// Component memoized to prevent unnecessary re-renders
const RemoteCameraViewer = memo(function RemoteCameraViewer({ camera, onClose }: { camera: Camera; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [connectionMode, setConnectionMode] = useState<'local' | 'remote' | 'detecting'>('detecting');
  const [showAI, setShowAI] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true); // Enable heatmap by default
  const [useTensorFlow, setUseTensorFlow] = useState(true); // Use TensorFlow.js analysis
  const [stats, setStats] = useState({ 
    in: 0, 
    out: 0, 
    current: 0,
    totalObjects: 0,
    people: 0,
    density: 0,
    tablesOccupied: 0,
    tablesTotal: 0
  });
  
  // 🔄 PROFESSIONAL STREAM MANAGEMENT
  const [isStreamHealthy, setIsStreamHealthy] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastFrameTime, setLastFrameTime] = useState(Date.now());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const previousPeopleCountRef = useRef(0);
  const animationIdRef = useRef<number>(0);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TensorFlow.js model yükle
  useEffect(() => {
    loadModel();
  }, []);

  // 🧠 PROFESSIONAL AI MODEL MANAGEMENT
  const loadModel = async () => {
    try {
      console.log('🤖 TensorFlow.js Professional AI Loading...');
      console.log('⚙️ Backend:', tf.getBackend());
      
      // Set optimal backend
      if (typeof window !== 'undefined') {
        await tf.setBackend('webgl'); // GPU acceleration
      }
      
      await tf.ready();
      console.log('✅ TensorFlow.js backend ready:', tf.getBackend());
      
      // Load COCO-SSD with retry mechanism
      console.log('📦 Loading COCO-SSD model...');
      const loadedModel = await cocoSsd.load({
        base: 'mobilenet_v2' // More accurate than lite_mobilenet_v2
      });
      
      setModel(loadedModel);
      console.log('✅ COCO-SSD model loaded successfully');
      console.log('🎯 Model ready for person detection (50%+ confidence)');
      
    } catch (err) {
      console.error('❌ AI Model loading failed:', err);
      
      // Retry after 3 seconds
      setTimeout(() => {
        console.log('🔄 Retrying AI model loading...');
        loadModel();
      }, 3000);
    }
  };

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

  // 🎯 INTELLIGENT STREAM URL GENERATION - MEMOIZED TO PREVENT RE-RENDERS
  const streamUrl = useMemo(() => {
    const baseUrl = getCameraStreamUrl(camera);
    
    console.log('📹 Professional Stream Debug:', {
      camera_name: camera.camera_name,
      ip_address: camera.ip_address,
      port: camera.port,
      stream_url: camera.stream_url,
      connectionMode,
      baseUrl,
      refreshKey,
      timestamp: new Date().toLocaleTimeString()
    });
    
    let finalUrl = '';
    
    if (connectionMode === 'remote') {
      // Uzaktan erişim - Proxy kullan
      const encodedUrl = encodeURIComponent(baseUrl);
      finalUrl = `/api/business/cameras/stream-proxy?url=${encodedUrl}`;
    } else if (connectionMode === 'local') {
      // Yerel erişim - Direkt bağlan (ESP32-CAM optimal)
      finalUrl = baseUrl;
    } else {
      // Fallback - Her iki yöntemi dene
      finalUrl = baseUrl;
    }
    
    // Cache busting + refresh key
    const cacheBustedUrl = addCacheBusting(finalUrl);
    const finalUrlWithRefresh = `${cacheBustedUrl}&refresh=${refreshKey}`;
    
    console.log('🚀 Final Stream URL:', finalUrlWithRefresh);
    return finalUrlWithRefresh;
  }, [camera.ip_address, camera.port, connectionMode, refreshKey]); // Sadece bunlar değişince URL yeniden oluştur

  // 📡 ENHANCED STREAM LOAD HANDLER WITH HEALTH MONITORING
  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
    setIsStreamHealthy(true);
    setReconnectAttempts(0);
    setLastFrameTime(Date.now());
    
    console.log('✅ Stream loaded successfully - Health monitoring started');
    
    // Start health monitoring
    startStreamHealthCheck();
  };

  // MJPEG stream için otomatik loading kaldır (onLoad event bazen çalışmaz)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !error) {
        console.log('⏱️ Auto-hide loading overlay after 2s');
        setIsLoading(false);
      }
    }, 2000); // 2 saniye sonra otomatik kaldır

    return () => clearTimeout(timer);
  }, [isLoading, error]);

  // AI Detection loop - MJPEG stream'den frame capture ve detection
  useEffect(() => {
    // Early return conditions
    if (!model || !aiEnabled || !imageRef.current || !canvasRef.current) {
      console.log('🔍 AI Detection waiting:', { 
        hasModel: !!model, 
        aiEnabled, 
        hasImageRef: !!imageRef.current, 
        hasCanvasRef: !!canvasRef.current,
        isLoading,
        error: !!error
      });
      return;
    }

    // Don't start if still loading or has error
    if (isLoading || error) {
      console.log('⏸️ AI Detection paused:', { isLoading, hasError: !!error });
      return;
    }

    console.log('🤖 AI Detection başlatılıyor...');

    const detectFrame = async () => {
      if (!model || !aiEnabled || !imageRef.current || !canvasRef.current) return;

      const img = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || !img.complete || img.naturalWidth === 0) {
        animationIdRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      try {
        // FPS hesapla + frame time tracking
        frameCountRef.current++;
        const now = Date.now();
        
        // Update frame time for health monitoring
        setLastFrameTime(now);
        
        if (now - lastFrameTimeRef.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;
        }

        // Canvas boyutlarını stream boyutuna ayarla - SADECE DEĞİŞİRSE
        // Bu sayede canvas sürekli resize olup image'ı tetiklemez
        const needsResize = canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight;
        if (needsResize && img.naturalWidth > 0 && img.naturalHeight > 0) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          console.log(`📐 Canvas resized to ${canvas.width}x${canvas.height}`);
        }

        // Canvas'ı temizle - sadece boyut hazırsa
        if (canvas.width > 0 && canvas.height > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          // Canvas henüz hazır değil, tekrar dene
          animationIdRef.current = requestAnimationFrame(detectFrame);
          return;
        }

        // 🎯 PROFESSIONAL PERSON DETECTION (70%+ confidence)
        const predictions = await model.detect(img);
        
        // Debug log - her 60 frame'de bir
        if (frameCountRef.current % 60 === 0) {
          console.log('🔍 AI Detection:', { 
            totalPredictions: predictions.length,
            detectedClasses: predictions.map(p => `${p.class}(${(p.score*100).toFixed(0)}%)`).join(', ')
          });
        }
        
        const people = predictions.filter(pred => 
          pred.class === 'person' && 
          pred.score > 0.7 && // Higher confidence for less false positives
          pred.bbox[2] > 30 && pred.bbox[3] > 30 // Minimum size filter
        );

        if (people.length > 0 && frameCountRef.current % 60 === 0) {
          console.log('👥 People detected:', people.length, 'persons');
        }

        // BATCH STATE UPDATES - reduces re-renders
        const currentCount = people.length;
        const previousCount = previousPeopleCountRef.current;

        // Only update if something changed
        if (people.length !== detections.length || currentCount !== previousCount) {
          setDetections(people);
          
          // 📊 INTELLIGENT CROWD ANALYTICS
          if (currentCount > previousCount) {
            const newEntries = currentCount - previousCount;
            setStats(prev => ({ 
              ...prev, 
              in: prev.in + newEntries, 
              current: currentCount 
            }));
            console.log(`📈 +${newEntries} person(s) entered (Total: ${currentCount})`);
          } else if (currentCount < previousCount) {
            const newExits = previousCount - currentCount;
            setStats(prev => ({ 
              ...prev, 
              out: prev.out + newExits, 
              current: currentCount 
            }));
            console.log(`📉 -${newExits} person(s) exited (Total: ${currentCount})`);
          } else if (currentCount !== previousCount) {
            setStats(prev => ({ ...prev, current: currentCount }));
          }

          previousPeopleCountRef.current = currentCount;
        }

        // 🎨 PROFESSIONAL DETECTION VISUALIZATION
        people.forEach((person, index) => {
          const [x, y, width, height] = person.bbox;
          const confidence = person.score;
          
          // 🟢 Dynamic color based on confidence
          const confidenceColor = confidence > 0.9 ? '#00ff00' : 
                                  confidence > 0.8 ? '#88ff00' : 
                                  confidence > 0.7 ? '#ffff00' : '#ff8800';
          
          // ✨ Professional bounding box with glow
          ctx.shadowColor = confidenceColor;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = confidenceColor;
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, width, height);
          ctx.shadowBlur = 0;

          // 🏷️ Professional label with rounded corners
          const labelText = `Person ${(confidence * 100).toFixed(0)}%`;
          const labelWidth = ctx.measureText(labelText).width + 20;
          
          // Label background (rounded rectangle effect)
          ctx.fillStyle = confidenceColor;
          ctx.fillRect(x, y - 35, labelWidth, 30);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(x, y - 5, labelWidth, 5);
          
          // Label text
          ctx.fillStyle = '#000';
          ctx.font = 'bold 14px Arial';
          ctx.fillText(labelText, x + 10, y - 12);
          
          // 🎯 Person index number
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 18px Arial';
          ctx.fillText(`${index + 1}`, x + width - 25, y + 25);
        });

        // 📊 PROFESSIONAL STATS OVERLAY
        if (people.length > 0) {
          // Main stats box
          const statsWidth = 240;
          const statsHeight = 60;
          
          // Background with gradient
          const gradient = ctx.createLinearGradient(10, 10, 10, 70);
          gradient.addColorStop(0, 'rgba(0, 255, 0, 0.9)');
          gradient.addColorStop(1, 'rgba(0, 200, 0, 0.7)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(10, 10, statsWidth, statsHeight);
          
          // Border
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, statsWidth, statsHeight);
          
          // Stats text
          ctx.fillStyle = '#000';
          ctx.font = 'bold 18px Arial';
          ctx.fillText(`👥 Detected: ${people.length} person${people.length > 1 ? 's' : ''}`, 20, 35);
          
          ctx.font = 'bold 14px Arial';
          const avgConfidence = people.reduce((sum, p) => sum + p.score, 0) / people.length;
          ctx.fillText(`🎯 Avg Confidence: ${(avgConfidence * 100).toFixed(0)}%`, 20, 55);
        }

      } catch (err) {
        console.error('❌ Detection error:', err);
      }

      // 60 FPS detection loop (optimize edilmiş - 30 FPS yeterli)
      // 30 FPS = 33ms delay (60 FPS = 16ms ama gereksiz yüksek)
      setTimeout(() => {
        animationIdRef.current = requestAnimationFrame(detectFrame);
      }, 33); // 30 FPS için delay
    };

    // İlk frame'i başlat
    detectFrame();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [model, aiEnabled, isLoading, error]); // isLoading ve error değişince yeniden başlat

  // 🔧 PROFESSIONAL ERROR HANDLING & AUTO-RETRY
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    
    const imageElement = e.currentTarget;
    const errorDetails = {
      camera_name: camera.camera_name,
      stream_url: camera.stream_url,
      ip_address: camera.ip_address,
      port: camera.port,
      connectionMode,
      refreshKey,
      attempted_src: imageElement?.src || 'No src',
      natural_width: imageElement?.naturalWidth || 0,
      natural_height: imageElement?.naturalHeight || 0,
      complete: imageElement?.complete || false,
      timestamp: new Date().toLocaleTimeString(),
      error_type: 'Image Load Failed'
    };
    
    // Structured error logging
    console.error('❌ Camera Stream Error:', errorDetails);
    
    // Profesyonel hata mesajı
    let errorMsg = '';
    
    if (connectionMode === 'remote') {
      errorMsg = '🌐 Uzaktan erişim başarısız. Kamera yerel ağda çalışıyor olabilir.';
    } else if (connectionMode === 'local') {
      errorMsg = `🏠 Yerel kameraya bağlanılamadı (${camera.ip_address}:${camera.port})`;
    } else {
      errorMsg = '🔍 Bağlantı türü tespit edilemiyor...';
    }
    
    setError(errorMsg);
    
    setIsStreamHealthy(false);
    
    // 🔄 INTELLIGENT RECONNECTION SYSTEM
    const maxAttempts = 5;
    const nextAttempt = reconnectAttempts + 1;
    
    if (nextAttempt <= maxAttempts) {
      const delay = Math.min(2000 * Math.pow(1.5, nextAttempt - 1), 15000); // Exponential backoff: 2s, 3s, 4.5s, 6.75s, 10s, max 15s
      
      setReconnectAttempts(nextAttempt);
      console.log(`🔄 Reconnection attempt ${nextAttempt}/${maxAttempts} in ${delay/1000}s...`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 Executing reconnection attempt ${nextAttempt}`);
        setError(null);
        setIsLoading(true);
        setRefreshKey(prev => prev + 1);
      }, delay);
      
    } else {
      console.log('❌ Maximum reconnection attempts reached. Manual refresh required.');
      setError(`❌ Bağlantı başarısız (${maxAttempts} deneme). Manuel yenileme gerekli.`);
    }
  };

  // 🔄 PROFESSIONAL REFRESH WITH RESET
  const handleRefresh = () => {
    console.log('🔄 Manual refresh initiated');
    
    // Reset all states
    setIsLoading(true);
    setError(null);
    setStats({ in: 0, out: 0, current: 0 });
    setDetections([]);
    setFps(0);
    
    // Reset AI counters
    previousPeopleCountRef.current = 0;
    frameCountRef.current = 0;
    
    // Cancel any ongoing detection
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    
    // Trigger fresh connection
    setRefreshKey(prev => prev + 1);
    
    console.log('✅ Stream refresh completed - Fresh connection starting');
  };

  // 🏥 STREAM HEALTH MONITORING SYSTEM
  const startStreamHealthCheck = () => {
    // Clear existing interval
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }
    
    healthCheckIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastFrame = now - lastFrameTime;
      
      // If no frame updates for 10 seconds, consider stream unhealthy
      if (timeSinceLastFrame > 10000) {
        console.log(`⚠️ Stream health check failed: No frames for ${timeSinceLastFrame/1000}s`);
        setIsStreamHealthy(false);
        
        // Trigger reconnection by refreshing stream
        console.log('🔄 Health check triggering stream refresh...');
        setRefreshKey(prev => prev + 1);
      } else {
        // Stream is healthy
        if (!isStreamHealthy) {
          console.log('✅ Stream health restored');
          setIsStreamHealthy(true);
        }
      }
    }, 5000); // Check every 5 seconds
  };

  const stopStreamHealthCheck = () => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
  };

  // 🔄 CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      stopStreamHealthCheck();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

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
            {/* TensorFlow AI Toggle */}
            <button
              onClick={() => setUseTensorFlow(!useTensorFlow)}
              className={`p-2 rounded-lg transition-colors ${
                useTensorFlow 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={useTensorFlow ? 'TensorFlow.js AI Aktif (80 nesne)' : 'TensorFlow.js AI Kapalı'}
            >
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {/* Heatmap Toggle */}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-2 rounded-lg transition-colors ${
                showHeatmap 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={showHeatmap ? 'Isı Haritası Aktif' : 'Isı Haritası Kapalı'}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* FPS Counter */}
            {aiEnabled && fps > 0 && (
              <div className="px-2 py-1 rounded-lg bg-blue-600/20 text-blue-300 text-xs sm:text-sm font-semibold">
                {fps} FPS
              </div>
            )}

            {/* Detection Count */}
            {aiEnabled && detections.length > 0 && (
              <div className="px-2 py-1 rounded-lg bg-green-600/20 text-green-300 text-xs sm:text-sm font-semibold">
                {detections.length} kişi
              </div>
            )}

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
                className="absolute inset-0 bg-gray-900/95 backdrop-blur-md flex items-center justify-center z-20"
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
            {/* Hidden video for AI processing */}
            <video
              ref={videoRef}
              className="hidden"
              autoPlay
              playsInline
              muted
            />
            
            {/* MJPEG Stream Display - ISOLATED FROM RE-RENDERS */}
            <div className="absolute inset-0 w-full h-full">
              <img
                key={`camera-stream-${camera.id || camera.device_id}`}
                ref={imageRef}
                src={streamUrl}
                alt={camera.camera_name}
                className="w-full h-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ 
                  display: 'block',
                  isolation: 'isolate',
                  willChange: 'auto'
                }}
              />
            </div>

            {/* TENSORFLOW.JS AI ANALYSIS - FULL PROFESSIONAL SYSTEM */}
            {useTensorFlow && !isLoading && !error && (
              <TensorFlowAIAnalysis
                streamUrl={streamUrl}
                width={1280}
                height={720}
                fps={10}
                enableHeatmap={showHeatmap}
                enableTracking={true}
                enableAlerts={true}
                onStatsUpdate={(newStats) => {
                  setStats({
                    in: newStats.entryCount,
                    out: newStats.exitCount,
                    current: newStats.currentPeople,
                    totalObjects: newStats.totalObjects,
                    people: newStats.totalPeople,
                    density: newStats.crowdDensity,
                    tablesOccupied: newStats.tablesOccupied,
                    tablesTotal: newStats.tablesTotal
                  });
                }}
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

            {/* Stats Overlay - ISOLATED LAYER */}
            {!isLoading && !error && (
              <div className="absolute top-4 left-4 right-4 flex gap-2 pointer-events-none" style={{ zIndex: 15 }}>
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

            {/* Stream Health & Connection Badges */}
            <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
              {/* Connection Mode Badge */}
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

              {/* Stream Health Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                isStreamHealthy 
                  ? 'bg-green-600/90 text-white' 
                  : 'bg-red-600/90 text-white'
              }`}>
                {isStreamHealthy ? '💚 Stabil' : '⚠️ Sorunlu'}
              </div>

              {/* Reconnection Attempts */}
              {reconnectAttempts > 0 && (
                <div className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-yellow-600/90 text-white">
                  🔄 Deneme: {reconnectAttempts}/5
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Info Bar */}
        {!isLoading && !error && (
          <div className="bg-gray-900 rounded-b-xl p-3 border-t border-gray-700 text-xs text-gray-400">
            <div className="flex items-center justify-between">
              <span>📍 {camera.location || 'Konum belirtilmemiş'}</span>
              <span className="hidden sm:inline">Protocol: MJPEG</span>
              <span className="hidden sm:inline">
                {isStreamHealthy ? 
                  `✅ Healthy (${fps > 0 ? fps : '~20'} FPS)` : 
                  '⚠️ Unstable'
                }
              </span>
              <span className="hidden md:inline">
                Uptime: {Math.floor((Date.now() - lastFrameTime) / 1000)}s
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});

export default RemoteCameraViewer;
