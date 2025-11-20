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
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [fps, setFps] = useState(0);
  const [detections, setDetections] = useState<any[]>([]);
  
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
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef(Date.now());
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // TensorFlow.js model yükle
  useEffect(() => {
    loadModel();
  }, []);

  // 💾 DATABASE SAVER - Her 5 saniyede bir analytics kaydet
  const saveAnalyticsToDatabase = async () => {
    if (!camera.id || stats.people === undefined) {
      console.log('⏸️ Analytics save skipped - no data yet');
      return;
    }

    try {
      console.log('💾 Saving analytics to database...', {
        cameraId: camera.id,
        peopleCount: stats.people,
        currentOccupancy: stats.current
      });

      const response = await fetch('/api/business/cameras/save-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraId: camera.id,
          peopleCount: stats.people || 0,
          entriesCount: stats.in || 0,
          exitsCount: stats.out || 0,
          currentOccupancy: stats.current || 0,
          densityLevel: stats.density > 10 ? 'high' : stats.density > 5 ? 'medium' : 'low',
          objectsDetected: stats.totalObjects || 0,
          tablesOccupied: stats.tablesOccupied || 0,
          tablesTotal: stats.tablesTotal || 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Analytics save HTTP error:', response.status, errorText);
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log('✅ Analytics saved to database:', data.timestamp);
      } else {
        console.error('❌ Analytics save failed:', data.error, data.details);
      }
    } catch (error: any) {
      console.error('❌ Database save error:', error.message || error);
    }
  };

  // 🔄 Auto-save her 5 saniyede bir
  useEffect(() => {
    if (!model || !aiEnabled) return;

    // İlk kayıt 5 saniye sonra
    const timer = setTimeout(() => {
      saveAnalyticsToDatabase();
      
      // Sonrasında her 5 saniyede bir
      saveIntervalRef.current = setInterval(() => {
        saveAnalyticsToDatabase();
      }, 5000);
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [model, aiEnabled, stats, camera.id]); // Stats değişince yeni değerleri kaydet

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
    console.log('📹 RAW Camera Object:', camera);
    
    // Base URL (stream_url varsa onu kullan, yoksa IP:PORT/stream)
    let baseUrl = camera.stream_url || `http://${camera.ip_address}:${camera.port}/stream`;
    
    // RTSP URL'ini HTTP'ye çevir (tarayıcılar RTSP desteklemez)
    if (baseUrl.toLowerCase().startsWith('rtsp://')) {
      console.log('🔄 RTSP URL detected, converting to HTTP:', baseUrl);
      // RTSP URL'ini HTTP'ye çevir: rtsp://user:pass@192.168.1.2:80/stream -> http://192.168.1.2:80/stream
      const lastAtIndex = baseUrl.lastIndexOf('@');
      const afterAt = lastAtIndex !== -1
        ? baseUrl.substring(lastAtIndex + 1)
        : baseUrl.replace(/^rtsp:\/\//i, '');
      baseUrl = `http://${afterAt}`;
      console.log('✅ RTSP converted to HTTP:', baseUrl);
    }
    
    // Username/password varsa URL'e ekle (HTTP Basic Auth format)
    if (camera.username && camera.password) {
      // URL'yi parse et
      try {
        const urlObj = new URL(baseUrl);
        // Username ve password'ü encode et ve ekle
        urlObj.username = camera.username;
        urlObj.password = camera.password;
        baseUrl = urlObj.toString();
        console.log('🔐 Auth eklendi (username gizli)');
      } catch (error) {
        console.warn('⚠️ URL parse error for auth, using basic URL');
      }
    }
    
    const finalUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    
    console.log('🚀 DIRECT ESP32 Stream:', finalUrl.replace(/(username|password)=[^&]*/g, '$1=***'));
    console.log('📹 Camera Details:', {
      id: camera.id || camera.device_id,
      name: camera.camera_name,
      ip: camera.ip_address,
      port: camera.port,
      hasAuth: !!(camera.username && camera.password),
      mode: 'DIRECT_24/7_NO_PROXY'
    });
    
    return finalUrl;
  }, [camera.id, camera.device_id, camera.ip_address, camera.port, camera.stream_url, camera.username, camera.password, refreshKey]); // camera ID değişince yeniden oluştur

  // 📡 ENHANCED STREAM LOAD HANDLER WITH HEALTH MONITORING
  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
    setIsStreamHealthy(true);
    setReconnectAttempts(0);
    setLastFrameTime(Date.now());
    
    console.log('✅ Stream loaded successfully - Direct 24/7 connection active!');
    console.log('ℹ️ Health monitoring DISABLED - Direct connection is stable');
    
    // HEALTH CHECK DEVRE DIŞI - Direct connection gereksiz yenileme yapmaz
    // Sadece onError handler çalışır
  };

  // MJPEG stream için otomatik loading kaldır (onLoad event bazen çalışmaz)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !error) {
        console.log('⏱️ Auto-hide loading overlay - Stream başladı');
        setIsLoading(false);
      }
    }, 800); // 0.8 saniye sonra otomatik kaldır (MJPEG hızlıca yüklenir)

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
        error: !!error
      });
      return;
    }

    // Don't start if has error
    if (error) {
      console.log('⏸️ AI Detection paused due to error:', error);
      return;
    }

    const detectFrame = async () => {
      if (!model || !aiEnabled || !imageRef.current || !canvasRef.current) return;

      const img = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // MJPEG stream için: Timeout sonrası çalışmaya başla
      // naturalWidth MJPEG'de güvenilir değil, sabit boyut kullan
      const streamWidth = img.naturalWidth || 1280;
      const streamHeight = img.naturalHeight || 720;
      
      if (!ctx) {
        animationIdRef.current = requestAnimationFrame(detectFrame);
        return;
      }
      
      // Canvas boyutunu ayarla
      if (canvas.width !== streamWidth || canvas.height !== streamHeight) {
        canvas.width = streamWidth;
        canvas.height = streamHeight;
        console.log(`📐 Canvas set to ${streamWidth}x${streamHeight} (MJPEG stream)`);
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

        // Canvas'ı temizle
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 🎯 PROFESSIONAL AI DETECTION - ALL OBJECTS (60%+ confidence)
        const predictions = await model.detect(img);
        
        // Filter all detections with good confidence
        const allDetections = predictions.filter(pred => 
          pred.score > 0.6 && // Good confidence threshold
          pred.bbox[2] > 20 && pred.bbox[3] > 20 // Minimum size filter
        );

        // Count people separately for entry/exit tracking
        const people = allDetections.filter(pred => pred.class === 'person');
        
        // Debug log - her 60 frame'de bir
        if (frameCountRef.current % 60 === 0) {
          console.log('🔍 AI Detection:', { 
            totalDetections: allDetections.length,
            people: people.length,
            objects: allDetections.map(p => `${p.class}(${(p.score*100).toFixed(0)}%)`).join(', ')
          });
        }

        // BATCH STATE UPDATES - reduces re-renders
        const currentCount = people.length;
        const previousCount = previousPeopleCountRef.current;

        // Calculate crowd density (simple: people count normalized)
        const crowdDensity = Math.min((currentCount / 10) * 10, 10); // Max 10
        
        // Count tables/furniture
        const tables = allDetections.filter(d => 
          d.class.includes('table') || d.class.includes('desk') || d.class.includes('dining')
        ).length;
        
        const chairs = allDetections.filter(d => d.class === 'chair').length;

        // Only update if something changed
        if (allDetections.length !== detections.length || currentCount !== previousCount) {
          setDetections(allDetections);
          
          // 📊 INTELLIGENT CROWD ANALYTICS WITH FULL STATS
          if (currentCount > previousCount) {
            const newEntries = currentCount - previousCount;
            setStats(prev => ({ 
              ...prev, 
              in: prev.in + newEntries, 
              current: currentCount,
              totalObjects: allDetections.length,
              people: currentCount,
              density: crowdDensity,
              tablesOccupied: tables,
              tablesTotal: tables + chairs
            }));
            console.log(`📈 +${newEntries} person(s) entered (Total: ${currentCount})`);
          } else if (currentCount < previousCount) {
            const newExits = previousCount - currentCount;
            setStats(prev => ({ 
              ...prev, 
              out: prev.out + newExits, 
              current: currentCount,
              totalObjects: allDetections.length,
              people: currentCount,
              density: crowdDensity,
              tablesOccupied: tables,
              tablesTotal: tables + chairs
            }));
            console.log(`📉 -${newExits} person(s) exited (Total: ${currentCount})`);
          } else {
            // Update stats even if count same (objects might have changed)
            setStats(prev => ({ 
              ...prev, 
              current: currentCount,
              totalObjects: allDetections.length,
              people: currentCount,
              density: crowdDensity,
              tablesOccupied: tables,
              tablesTotal: tables + chairs
            }));
          }

          previousPeopleCountRef.current = currentCount;
        }

        // 🎨 PROFESSIONAL DETECTION VISUALIZATION - ALL OBJECTS
        allDetections.forEach((detection, index) => {
          const [x, y, width, height] = detection.bbox;
          const confidence = detection.score;
          const objectClass = detection.class;
          const isPerson = objectClass === 'person';
          
          // 🎨 Color coding: Green for people, Blue for objects
          const baseColor = isPerson ? '#00ff00' : '#00a8ff';
          
          // 🟢 Dynamic color based on confidence
          const confidenceColor = confidence > 0.9 ? baseColor : 
                                  confidence > 0.8 ? (isPerson ? '#88ff00' : '#4db8ff') : 
                                  confidence > 0.7 ? (isPerson ? '#ffff00' : '#80ccff') : 
                                  (isPerson ? '#ff8800' : '#b3d9ff');
          
          // ✨ Professional bounding box with glow
          ctx.shadowColor = confidenceColor;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = confidenceColor;
          ctx.lineWidth = isPerson ? 4 : 3; // People get thicker lines
          ctx.strokeRect(x, y, width, height);
          ctx.shadowBlur = 0;

          // 🏷️ Professional label with rounded corners
          const labelText = `${objectClass} ${(confidence * 100).toFixed(0)}%`;
          const labelWidth = ctx.measureText(labelText).width + 20;
          
          // Label background (rounded rectangle effect)
          ctx.fillStyle = confidenceColor;
          ctx.fillRect(x, y - 35, labelWidth, 30);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(x, y - 5, labelWidth, 5);
          
          // Label text
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 13px Arial';
          ctx.fillText(labelText, x + 10, y - 12);
          
          // 🎯 Detection index number
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(`${index + 1}`, x + width - 25, y + 25);
        });

        // 📊 PROFESSIONAL STATS OVERLAY
        if (allDetections.length > 0) {
          // Main stats box - now shows both people and objects
          const statsWidth = 280;
          const statsHeight = 80;
          
          // Background with gradient
          const gradient = ctx.createLinearGradient(10, 10, 10, 90);
          gradient.addColorStop(0, 'rgba(0, 255, 0, 0.9)');
          gradient.addColorStop(1, 'rgba(0, 168, 255, 0.7)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(10, 10, statsWidth, statsHeight);
          
          // Border
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, statsWidth, statsHeight);
          
          // Stats text - show both people and objects
          ctx.fillStyle = '#000';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(`👥 People: ${people.length} | 📦 Objects: ${allDetections.length - people.length}`, 20, 35);
          
          ctx.font = 'bold 14px Arial';
          ctx.fillText(`Total Detections: ${allDetections.length}`, 20, 55);
          
          const avgConfidence = allDetections.reduce((sum, p) => sum + p.score, 0) / allDetections.length;
          ctx.fillText(`🎯 Avg Confidence: ${(avgConfidence * 100).toFixed(0)}%`, 20, 72);
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

    // MJPEG stream'in yüklenmesi için 2 saniye bekle, sonra başlat
    console.log('⏳ Waiting 2s for MJPEG stream to initialize...');
    const startDelay = setTimeout(() => {
      console.log('🤖 AI Detection BAŞLADI - MJPEG Stream aktif!');
      detectFrame();
    }, 2000);

    return () => {
      clearTimeout(startDelay);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [model, aiEnabled, error]); // Model ve AI enabled değişince yeniden başlat

  // 🔧 PROFESSIONAL ERROR HANDLING & AUTO-RETRY
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    
    const imageElement = e.currentTarget;
    
    // Structured error logging with details
    console.error('❌ Camera Stream Error:');
    console.error('  Camera:', camera.camera_name);
    console.error('  Stream URL:', camera.stream_url);
    console.error('  IP:', camera.ip_address);
    console.error('  Connection Mode:', connectionMode);
    console.error('  Attempted SRC:', imageElement?.src);
    console.error('  Image Complete:', imageElement?.complete);
    console.error('  Natural Size:', `${imageElement?.naturalWidth}x${imageElement?.naturalHeight}`);
    
    // Profesyonel hata mesajı
    let errorMsg = '';
    
    // RTSP URL kontrolü
    const originalUrl = camera.stream_url || '';
    const isRtspInOriginal = originalUrl.toLowerCase().includes('rtsp://');
    
    if (isRtspInOriginal) {
      errorMsg = `⚠️ RTSP protokolü tarayıcıda çalışmaz - HTTP MJPEG gerekli (${camera.ip_address})`;
    } else if (connectionMode === 'remote') {
      errorMsg = '🌐 Uzaktan erişim başarısız. Kamera yerel ağda çalışıyor olabilir.';
    } else if (connectionMode === 'local') {
      errorMsg = `🏠 Yerel kameraya bağlanılamadı (${camera.ip_address}:${camera.port}) - IP ve port kontrol edin`;
    } else {
      errorMsg = `📹 Kamera bağlantısı başarısız (${camera.ip_address}) - Stream URL kontrol edin`;
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
      
      // If no frame updates for 30 seconds, consider stream unhealthy
      // Proxy rotation ile senkronize (25s proxy timeout + 5s buffer)
      if (timeSinceLastFrame > 30000) {
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
    }, 15000); // Check every 15 seconds (daha sık kontrol)
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
      // Sadece reconnect timeout ve animation cleanup
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

  // Stats güncelleme - GEÇİCİ OLARAK İPTAL (counting API kalibrasyon gerektirir)
  useEffect(() => {
    // Counting API calibration gerektiriyor, şimdilik TensorFlow detection'dan alacağız
    // Stats AI detection'dan otomatik güncellenecek
    console.log('📊 Stats will be updated from AI detections');
  }, [camera.id]);

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
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ 
                  display: 'block',
                  isolation: 'isolate',
                  willChange: 'auto'
                }}
              />
              
              {/* AI Detection Canvas Overlay - ALWAYS RENDER for TensorFlow AI */}
              {aiEnabled && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ zIndex: 10 }}
                />
              )}
            </div>

            {/* TENSORFLOW.JS AI ANALYSIS - DISABLED (RemoteCameraViewer handles detection) */}
            {false && useTensorFlow && !isLoading && !error && (
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

            {/* AI Analysis Sidebar - RIGHT PANEL */}
            {!isLoading && !error && (
              <div className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl border border-gray-700 pointer-events-none" style={{ zIndex: 15, minWidth: '200px' }}>
                <div className="text-white space-y-3">
                  <h3 className="text-sm font-bold text-indigo-400 mb-3">AI Analysis</h3>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Objects:</span>
                      <span className="font-bold">{stats.totalObjects || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">People:</span>
                      <span className="font-bold text-green-400">{stats.people || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tracked:</span>
                      <span className="font-bold">{stats.current || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Density:</span>
                      <span className="font-bold text-yellow-400">{stats.density?.toFixed(1) || '0.0'}/10</span>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entry:</span>
                        <span className="font-bold text-green-400">↓ {stats.in}</span>
                      </div>
                      
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-400">Exit:</span>
                        <span className="font-bold text-red-400">↑ {stats.out}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tables:</span>
                        <span className="font-bold">{stats.tablesOccupied || 0}/{stats.tablesTotal || 0}</span>
                      </div>
                      
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-400">Occupancy:</span>
                        <span className="font-bold text-blue-400">
                          {stats.tablesTotal > 0 ? Math.round((stats.tablesOccupied / stats.tablesTotal) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-700">
                    FPS: {fps || 10} | Frame: {frameCountRef.current}
                  </div>
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
