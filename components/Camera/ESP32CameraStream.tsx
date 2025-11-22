'use client';

import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Camera, Activity, Users, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  currentPeople: number;
  entriesCount: number;
  exitsCount: number;
  densityLevel: 'low' | 'medium' | 'high' | 'critical';
  heatmapData: { x: number; y: number; intensity: number }[];
  zones: { [key: string]: number };
  averageDwellTime: number;
}

interface ESP32CameraStreamProps {
  cameraIp: string;
  cameraName: string;
  location: string;
  businessId: number;
  onAnalyticsUpdate?: (data: AnalyticsData) => void;
}

export default function ESP32CameraStream({
  cameraIp,
  cameraName,
  location,
  businessId,
  onAnalyticsUpdate
}: ESP32CameraStreamProps) {
  console.log('🎥 ESP32CameraStream rendered - location type:', typeof location, location);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    currentPeople: 0,
    entriesCount: 0,
    exitsCount: 0,
    densityLevel: 'low',
    heatmapData: [],
    zones: {},
    averageDwellTime: 0
  });
  const [error, setError] = useState('');
  const [fps, setFps] = useState(0);
  
  const previousPeopleCountRef = useRef(0);
  const peopleHistoryRef = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());

  // TensorFlow model yükle
  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      await tf.ready();
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      console.log('✅ TensorFlow.js model yüklendi');
    } catch (err) {
      console.error('Model yüklenemedi:', err);
      setError('AI modeli yüklenemedi');
    }
  };

  // ESP32-CAM stream başlat - HTTPS PROXY İLE
  useEffect(() => {
    if (!model) return;

    // Mixed Content sorununu proxy ile çöz
    const originalStreamUrl = `http://${cameraIp}/stream`;
    const streamUrl = `/api/camera-proxy?url=${encodeURIComponent(originalStreamUrl)}`;
    const video = videoRef.current;
    
    if (!video) return;

    console.log(`📹 Kamera stream başlatılıyor: ${streamUrl}`);

    // MJPEG stream için img element kullan
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.style.display = 'none';
    document.body.appendChild(img);

    let animationId: number;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      console.log('✅ Stream bağlantısı başarılı');
      setIsStreaming(true);
      setError('');
      
      // Canvas ve video boyutlarını ayarla
      canvas.width = img.naturalWidth || 640;
      canvas.height = img.naturalHeight || 480;
      video.width = canvas.width;
      video.height = canvas.height;

      // Image'i canvas'a sürekli çiz ve video'ya aktar
      const updateFrame = () => {
        if (ctx && img.complete) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Canvas'ı video'ya aktar
          canvas.toBlob((blob) => {
            if (blob && video.src !== URL.createObjectURL(blob)) {
              const url = URL.createObjectURL(blob);
              video.src = url;
            }
          });
        }
        animationId = requestAnimationFrame(updateFrame);
      };
      
      updateFrame();
      startDetection();
    };

    img.onerror = (event) => {
      console.error(`❌ Stream hatası:`, event);
      
      // Proxy endpoint'ine test çağrısı yap
      fetch(streamUrl)
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              console.error('❌ Proxy hatası:', errorData);
              
              // Specific error messages
              switch (errorData.code) {
                case 'TIMEOUT':
                  setError(`Kamera zaman aşımı: ${cameraName} (${cameraIp}) 10 saniye içinde yanıt vermedi`);
                  break;
                case 'CONNECTION_REFUSED':
                  setError(`Kamera bağlantısı reddedildi: ${cameraName} (${cameraIp}) çevrimdışı olabilir`);
                  break;
                case 'NOT_FOUND':
                  setError(`Kamera bulunamadı: ${cameraIp} IP adresi geçersiz`);
                  break;
                default:
                  setError(`Kamera hatası: ${errorData.details || 'Bilinmeyen hata'}`);
              }
            });
          }
        })
        .catch(fetchError => {
          console.error('❌ Proxy fetch hatası:', fetchError);
          setError(`Kameraya bağlanılamadı: ${cameraName} (${cameraIp})`);
        });
      
      setIsStreaming(false);
    };

    img.src = streamUrl;

    return () => {
      setIsStreaming(false);
      cancelAnimationFrame(animationId);
      document.body.removeChild(img);
    };
  }, [model, cameraIp]);

  const startDetection = () => {
    if (!model || !videoRef.current || !canvasRef.current) return;

    const detectFrame = async () => {
      if (!isStreaming || !model || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      try {
        // FPS hesapla
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastFrameTimeRef.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;
        }

        // Video frame'ini canvas'a çiz
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Object detection - sadece insanları tespit et
        const predictions = await model.detect(video);
        const people = predictions.filter(pred => pred.class === 'person');

        // Analitiği güncelle
        const currentCount = people.length;
        const previousCount = previousPeopleCountRef.current;

        // Giriş/Çıkış sayımı (basit mantık)
        let newEntries = analytics.entriesCount;
        let newExits = analytics.exitsCount;

        if (currentCount > previousCount) {
          newEntries += (currentCount - previousCount);
        } else if (currentCount < previousCount) {
          newExits += (previousCount - currentCount);
        }

        // Heatmap verisi oluştur
        const heatmapData = people.map(person => ({
          x: person.bbox[0] + person.bbox[2] / 2,
          y: person.bbox[1] + person.bbox[3] / 2,
          intensity: person.score
        }));

        // Bölge analizi (kamerayı 4 bölgeye böl)
        const zones = {
          'Sol Üst': 0,
          'Sağ Üst': 0,
          'Sol Alt': 0,
          'Sağ Alt': 0
        };

        people.forEach(person => {
          const centerX = person.bbox[0] + person.bbox[2] / 2;
          const centerY = person.bbox[1] + person.bbox[3] / 2;
          const midX = canvas.width / 2;
          const midY = canvas.height / 2;

          if (centerX < midX && centerY < midY) zones['Sol Üst']++;
          else if (centerX >= midX && centerY < midY) zones['Sağ Üst']++;
          else if (centerX < midX && centerY >= midY) zones['Sol Alt']++;
          else zones['Sağ Alt']++;
        });

        // Yoğunluk seviyesi
        let densityLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (currentCount > 20) densityLevel = 'critical';
        else if (currentCount > 10) densityLevel = 'high';
        else if (currentCount > 5) densityLevel = 'medium';

        const newAnalytics: AnalyticsData = {
          currentPeople: currentCount,
          entriesCount: newEntries,
          exitsCount: newExits,
          densityLevel,
          heatmapData,
          zones,
          averageDwellTime: analytics.averageDwellTime // Daha gelişmiş tracking gerekli
        };

        setAnalytics(newAnalytics);
        previousPeopleCountRef.current = currentCount;

        if (onAnalyticsUpdate) {
          onAnalyticsUpdate(newAnalytics);
        }

        // Veritabanına kaydet (her 5 saniyede bir)
        if (frameCountRef.current % (fps * 5) === 0) {
          saveAnalytics(newAnalytics);
        }

        // Detection sonuçlarını çiz
        people.forEach(person => {
          const [x, y, width, height] = person.bbox;
          
          // Bounding box
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          // Label
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(x, y - 25, 150, 25);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(
            `Person ${(person.score * 100).toFixed(0)}%`,
            x + 5,
            y - 7
          );
        });

        // Heatmap overlay
        heatmapData.forEach(point => {
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, 50
          );
          gradient.addColorStop(0, `rgba(255, 0, 0, ${point.intensity})`);
          gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(point.x - 50, point.y - 50, 100, 100);
        });

      } catch (detectionErr: any) {
        console.error('❌ AI Detection hatası:', detectionErr);
        
        // Detection hatası varsa stream'i durdurmayı önle
        if (detectionErr.message?.includes('Input tensor')) {
          console.log('🔄 Video frame henüz hazır değil, bekleniyor...');
        } else if (detectionErr.message?.includes('disposed')) {
          console.log('🔄 Model dispose edilmiş, yeniden yükleniyor...');
          setError('AI modeli yeniden yükleniyor...');
          loadModel();
        } else {
          // Ciddi hata - error göster ama stream'i sürdür
          setError(`AI Analiz Hatası: ${detectionErr.message}`);
        }
      }

      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  const saveAnalytics = async (data: AnalyticsData) => {
    try {
      await fetch('/api/business/cameras/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          cameraIp,
          ...data
        })
      });
    } catch (err) {
      console.error('Analytics kaydetme hatası:', err);
    }
  };

  const getDensityColor = () => {
    switch (analytics.densityLevel) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getDensityText = () => {
    switch (analytics.densityLevel) {
      case 'critical': return 'KRİTİK';
      case 'high': return 'YOĞUN';
      case 'medium': return 'ORTA';
      default: return 'DÜŞÜK';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{cameraName}</h3>
            <p className="text-gray-400 text-sm">
              {typeof location === 'string' 
                ? location 
                : typeof location === 'object' && location !== null && 'address' in location
                  ? location.address 
                  : 'Konum bilgisi yok'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-300 text-sm font-semibold">CANLI</span>
            </div>
          )}
          {fps > 0 && (
            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold">
              {fps} FPS
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Video Stream with Canvas Overlay */}
      <div className="relative bg-black rounded-xl overflow-hidden mb-4">
        {/* Hidden video for AI processing */}
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          playsInline
          muted
        />
        {/* Direct MJPEG stream display */}
        <img
          src={`http://${cameraIp}/stream`}
          alt="Camera Stream"
          className="w-full h-auto"
          crossOrigin="anonymous"
          onError={() => setError('Kamera stream bağlantısı kurulamadı')}
          onLoad={() => {
            setIsStreaming(true);
            setError('');
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Real-time Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">İçerideki</span>
          </div>
          <p className="text-3xl font-bold text-white">{analytics.currentPeople}</p>
        </div>

        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm">Giriş</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{analytics.entriesCount}</p>
        </div>

        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-orange-400" />
            <span className="text-gray-400 text-sm">Çıkış</span>
          </div>
          <p className="text-3xl font-bold text-orange-400">{analytics.exitsCount}</p>
        </div>

        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Yoğunluk</span>
          </div>
          <p className={`text-xl font-bold ${getDensityColor()}`}>{getDensityText()}</p>
        </div>
      </div>

      {/* Zone Analysis */}
      {Object.keys(analytics.zones).length > 0 && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl">
          <h4 className="text-white font-semibold mb-3">Bölge Analizi</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(analytics.zones).map(([zone, count]) => (
              <div key={zone} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-gray-300 text-sm">{zone}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
