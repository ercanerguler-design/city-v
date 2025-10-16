'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Wifi, Activity, Users, Zap, Play, Square, RefreshCw, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTensorFlowDetection } from '@/lib/hooks/useTensorFlowDetection';

interface ESP32Status {
  status: string;
  device_id: string;
  location: string;
  ip: string;
  uptime: number;
  wifi_rssi: number;
  last_analysis: {
    crowd_level: string;
    score: number;
    occupied_zones: number;
  };
}

interface DetectedObject {
  type: 'person' | 'table' | 'chair' | 'object';
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

interface AnalysisData {
  objects: DetectedObject[];
  crowdLevel: string;
  personCount: number;
  tableCount: number;
  occupancyRate: number;
  timestamp: number;
}

interface ESP32CamDashboardProps {
  initialDeviceIp?: string;
  compact?: boolean; // Multi-device view için küçük mod
}

export default function ESP32CamDashboard({ 
  initialDeviceIp = '192.168.1.9',
  compact = false 
}: ESP32CamDashboardProps) {
  // State Management
  const [deviceIp, setDeviceIp] = useState(initialDeviceIp);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showDetections, setShowDetections] = useState(true);
  const [status, setStatus] = useState<ESP32Status | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // 🚪 GİREN/ÇIKAN SAYAÇ STATE'LERİ
  const [totalEntry, setTotalEntry] = useState(0);
  const [totalExit, setTotalExit] = useState(0);
  const [previousPersonCount, setPreviousPersonCount] = useState(0);
  
  // 📏 SANAL GİRİŞ ÇİZGİSİ & TRACKING
  const ENTRY_LINE_Y = 240; // Frame ortası (480px / 2)
  
  // ✅ FIX: State yerine useRef kullan (anında güncellenir, render beklemez!)
  const trackedPersonsRef = useRef<Map<string, {
    y: number; 
    timestamp: number; 
    lastCrossing?: number; // Son geçiş zamanı (cooldown için)
  }>>(new Map());
  
  // Refs
  const streamRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🤖 TensorFlow.js Detection Hook
  const { isModelLoaded, isDetecting, detect, drawDetections } = useTensorFlowDetection();

  // Utility Functions
  const log = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : '📋';
    console.log(`${emoji} [City-V IoT] ${message}`);
  };

  const formatUptime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}sa ${minutes % 60}dk` : `${minutes}dk`;
  };

  const getCrowdColor = (level: string) => {
    const colors = {
      'very_high': 'bg-red-500',
      'high': 'bg-orange-500', 
      'moderate': 'bg-yellow-500',
      'low': 'bg-green-500',
      'empty': 'bg-gray-400'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-400';
  };

  const getCrowdLabel = (level: string) => {
    const labels = {
      'very_high': 'Çok Yoğun',
      'high': 'Yoğun',
      'moderate': 'Orta',
      'low': 'Az Yoğun', 
      'empty': 'Boş'
    };
    return labels[level as keyof typeof labels] || 'Bilinmiyor';
  };

  // API Functions
  const fetchStatus = async () => {
    if (!deviceIp.trim()) return;
    
    try {
      log(`Durum sorgulanıyor: ${deviceIp}`, 'info');
      const response = await fetch(`http://${deviceIp}/status`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setIsConnected(true);
        log('ESP32 bağlantısı başarılı!', 'success');
        return true;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      log(`Bağlantı hatası: ${error}`, 'error');
      setIsConnected(false);
      return false;
    }
  };

  // 🤖 TensorFlow.js ile GERÇEK AI Analizi
  const runAnalysis = async () => {
    if (!deviceIp.trim()) {
      console.warn('⚠️ runAnalysis: deviceIp boş!');
      return;
    }
    
    if (!isModelLoaded) {
      console.warn('⚠️ TensorFlow model henüz yüklenmedi, bekleniyor...');
      return;
    }
    
    if (isDetecting) {
      console.warn('⚠️ Tespit zaten devam ediyor, atlanıyor...');
      return;
    }
    
    const imgElement = streamRef.current;
    if (!imgElement || !imgElement.complete) {
      console.warn('⚠️ Stream görüntüsü henüz hazır değil');
      return;
    }
    
    try {
      setLoading(true);
      log('🤖 TensorFlow.js ile gerçek AI analizi başlatılıyor...', 'info');
      
      // TensorFlow.js ile tespit yap
      const detectionResult = await detect(imgElement);
      
      if (!detectionResult) {
        console.warn('⚠️ Tespit sonucu alınamadı');
        return;
      }
      
      console.log(`🎯 [TENSORFLOW] ${detectionResult.objects.length} nesne tespit edildi!`, detectionResult);
      
      const newPersonCount = detectionResult.personCount;
      console.log(`👥 Gerçek tespit: ${newPersonCount} kişi`);
      
      // 📏 SANAL ÇİZGİ GEÇİŞ TESPİTİ
      const currentTime = Date.now();
      const trackedPersons = trackedPersonsRef.current;
      
      // Timeout olan kişileri temizle (10sn)
      trackedPersons.forEach((data, id) => {
        if ((currentTime - data.timestamp) >= 10000) {
          trackedPersons.delete(id);
        }
      });
      
      let entryCount = 0;
      let exitCount = 0;
      
      const detectedPeople = detectionResult.objects.filter(o => o.class === 'person');
      console.log(`🎯 [TRACKING] ${detectedPeople.length} kişi analiz ediliyor...`);
      
      // Her kişi için tracking
      detectedPeople.forEach((obj, index) => {
        const [x, y, width, height] = obj.bbox;
        const centerY = y + (height / 2);
        const personId = `person_${index}`;
        
        console.log(`👤 [TRACKING] Person ${index}: Y=${centerY.toFixed(0)}, Line=${ENTRY_LINE_Y}`);
        
        const prevData = trackedPersons.get(personId);
        
        if (prevData && (currentTime - prevData.timestamp) < 10000) {
          const prevY = prevData.y;
          const yDiff = Math.abs(centerY - prevY);
          
          console.log(`📊 [TRACKING] Önceki: ${prevY.toFixed(0)} → Şimdi: ${centerY.toFixed(0)} (Fark: ${yDiff.toFixed(0)}px)`);
          
          // ÇİZGİ GEÇİŞ TESPİTİ
          const crossedLineDown = (prevY < ENTRY_LINE_Y && centerY > ENTRY_LINE_Y);
          const crossedLineUp = (prevY > ENTRY_LINE_Y && centerY < ENTRY_LINE_Y);
          
          // Cooldown kontrolü (3sn)
          const lastCrossing = prevData.lastCrossing || 0;
          const canCross = (currentTime - lastCrossing) >= 3000;
          
          if (canCross) {
            if (crossedLineDown) {
              entryCount++;
              console.log(`✅ [TRACKING] 📥 GİRİŞ! Person ${index}`);
              log(`📥 GİRİŞ ALGILANDI! Kişi #${index}`, 'success');
              
              trackedPersons.set(personId, {
                y: centerY,
                timestamp: currentTime,
                lastCrossing: currentTime
              });
              return;
            } else if (crossedLineUp) {
              exitCount++;
              console.log(`✅ [TRACKING] 📤 ÇIKIŞ! Person ${index}`);
              log(`📤 ÇIKIŞ ALGILANDI! Kişi #${index}`, 'info');
              
              trackedPersons.set(personId, {
                y: centerY,
                timestamp: currentTime,
                lastCrossing: currentTime
              });
              return;
            }
          } else {
            console.log(`⏳ [TRACKING] Cooldown aktif (${((currentTime - lastCrossing)/1000).toFixed(1)}s/3s)`);
          }
        } else {
          console.log(`⚠️ [TRACKING] İlk görülme: Person ${index}`);
        }
        
        trackedPersons.set(personId, {
          y: centerY,
          timestamp: currentTime,
          lastCrossing: prevData?.lastCrossing || 0
        });
      });
      
      // Sayaçları güncelle
      if (entryCount > 0) setTotalEntry(prev => prev + entryCount);
      if (exitCount > 0) setTotalExit(prev => prev + exitCount);
      
      console.log(`📊 [TRACKING] Özet: ${entryCount} giriş, ${exitCount} çıkış`);
      
      // AnalysisData'yı TensorFlow.js sonuçlarından oluştur
      const analysisData: AnalysisData = {
        objects: detectionResult.objects.map(obj => ({
          type: obj.class as any,
          confidence: obj.score,
          bbox: {
            x: obj.bbox[0],
            y: obj.bbox[1],
            width: obj.bbox[2],
            height: obj.bbox[3]
          }
        })),
        crowdLevel: newPersonCount >= 5 ? 'Yoğun' : newPersonCount >= 2 ? 'Orta' : 'Boş',
        personCount: newPersonCount,
        tableCount: detectionResult.tableCount,
        occupancyRate: Math.min(100, (newPersonCount / 10) * 100),
        timestamp: detectionResult.timestamp
      };
      
      setPreviousPersonCount(newPersonCount);
      setAnalysisData(analysisData);
      setLastUpdate(new Date());
      log(`✅ [TENSORFLOW] Analiz tamamlandı: ${newPersonCount} kişi`, 'success');
      
    } catch (error) {
      log(`❌ Analiz hatası: ${error}`, 'error');
      console.error('[TENSORFLOW] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stream Functions
  const startStream = async () => {
    if (!deviceIp) {
      alert('❌ Lütfen önce cihaz IP adresini girin!');
      return;
    }

    // Önce bağlantıyı test et
    const connected = await fetchStatus();
    if (!connected) {
      alert('❌ Cihaza bağlanılamıyor! IP adresini ve cihazı kontrol edin.');
      return;
    }

    log('🎬 GERÇEK City-V IoT stream başlatılıyor...', 'info');
    
    // Stream URL oluştur
    const streamUrl = `http://${deviceIp}:81/stream`;
    console.log(`🎥 City-V IoT Stream URL: ${streamUrl}`);
    
    // Stream test et
    try {
      const testResponse = await fetch(streamUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      console.log(`🌐 Stream endpoint response: ${testResponse.status}`);
    } catch (error) {
      console.log('⚠️ Stream endpoint test başarısız, devam ediliyor...');
    }
    
    setIsStreaming(true);
    
    if (streamRef.current) {
      // Önce eski src'yi temizle
      streamRef.current.src = '';
      
      // Kısa gecikme sonrası yeni src ata
      setTimeout(() => {
        if (streamRef.current) {
          streamRef.current.src = streamUrl;
          console.log(`📺 Stream source atandı: ${streamUrl}`);
        }
      }, 100);
    }

    // İLK ANALİZİ HEMEN BAŞLAT
    await runAnalysis();
    
    // Otomatik analiz başlat (5sn aralık)
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(runAnalysis, 5000);
    
    log('✅ Otomatik AI analizi başlatıldı (5sn aralık)', 'success');
  };

  const stopStream = () => {
    log('Stream durduruluyor...', 'info');
    setIsStreaming(false);
    
    if (streamRef.current) {
      streamRef.current.src = '';
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Canvas Drawing
  useEffect(() => {
    if (!canvasRef.current || !streamRef.current || !analysisData || !showDetections) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const stream = streamRef.current;
    
    if (!ctx) return;

    // Canvas boyutunu stream ile tam eşitle
    const streamRect = stream.getBoundingClientRect();
    const naturalWidth = stream.naturalWidth || 640;
    const naturalHeight = stream.naturalHeight || 480;
    
    // Canvas internal resolution (gerçek piksel)
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    
    // Canvas display size (CSS boyut)
    canvas.style.width = `${streamRect.width}px`;
    canvas.style.height = `${streamRect.height}px`;
    
    console.log(`🎨 Canvas ayarlandı: ${canvas.width}x${canvas.height} (display: ${streamRect.width}x${streamRect.height})`);
    
    // Temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 📏 SANAL GİRİŞ ÇİZGİSİ ÇİZ (ÖNCELİKLE)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]); // Kesikli çizgi
    ctx.beginPath();
    ctx.moveTo(0, ENTRY_LINE_Y);
    ctx.lineTo(canvas.width, ENTRY_LINE_Y);
    ctx.stroke();
    ctx.setLineDash([]); // Reset
    
    // Çizgi üzerine text (arka plan ile)
    const lineText = '↓ GİRİŞ HATTI / ENTRY LINE ↑';
    ctx.font = 'bold 18px Arial';
    const textWidth = ctx.measureText(lineText).width;
    const textX = (canvas.width - textWidth) / 2;
    const textY = ENTRY_LINE_Y - 15;
    
    // Text arka planı (siyah kutu)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(textX - 10, textY - 20, textWidth + 20, 30);
    
    // Text
    ctx.fillStyle = '#00FF00';
    ctx.fillText(lineText, textX, textY);

    // Her nesne için bounding box çiz
    analysisData.objects.forEach((obj) => {
      const { x, y, width, height } = obj.bbox;
      
      // Renk seçimi
      let color = '#00FF00';
      if (obj.type === 'person') color = '#FF0000';
      else if (obj.type === 'table') color = '#0000FF';
      else if (obj.type === 'chair') color = '#FFFF00';

      // Kutu çiz
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Etiket arka planı
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 25, Math.min(width, 150), 25);

      // Etiket metni
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      const label = `${obj.type.toUpperCase()} ${Math.round(obj.confidence * 100)}%`;
      ctx.fillText(label, x + 5, y - 8);
      
      // 🎯 Kişi merkezini göster (debugging)
      if (obj.type === 'person') {
        const centerY = y + (height / 2);
        ctx.fillStyle = centerY < ENTRY_LINE_Y ? '#FF00FF' : '#00FFFF'; // Üst=Mor, Alt=Cyan
        ctx.beginPath();
        ctx.arc(x + width/2, centerY, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [analysisData, showDetections]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎥 City-V AI Analiz Sistemi
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gerçek zamanlı nesne tespiti ve crowd analizi - TensorFlow.js v4.0
          </p>
          
          {/* TensorFlow Model Status */}
          {!isModelLoaded && (
            <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-lg">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="font-medium">🤖 AI Model yükleniyor...</span>
            </div>
          )}
          
          {isModelLoaded && (
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">✅ AI Model hazır (COCO-SSD)</span>
            </div>
          )}
        </div>

        {/* Connection Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Wifi className={`w-6 h-6 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Cihaz IP Adresi (örn: 192.168.1.9)"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Test
              </button>
              
              <button
                onClick={isStreaming ? stopStream : startStream}
                disabled={loading || !isModelLoaded}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isStreaming 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                }`}
                title={!isModelLoaded ? 'AI model yükleniyor, lütfen bekleyin...' : ''}
              >
                {isStreaming ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isStreaming ? 'Durdur' : 'Başlat'}
              </button>
            </div>
          </div>
          
          {/* Connection Status */}
          {deviceIp && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">City-V IoT bağlı</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Cihaz bağlı</span>
                  </>
                )}
              </div>
              
              <div className="flex gap-4 text-gray-600 dark:text-gray-400">
                <a 
                  href={`http://${deviceIp}/status`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline"
                >
                  Status API
                </a>
                <a 
                  href={`http://${deviceIp}/stream`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline"
                >
                  Stream Test
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Durum</p>
                  <p className="font-bold text-green-600">{status.status === 'online' ? 'Aktif' : 'Kapalı'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tespit</p>
                  <p className="font-bold text-blue-600">{analysisData?.personCount || 0} Kişi</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Doluluk</p>
                  <p className="font-bold text-yellow-600">{analysisData?.occupancyRate || 0}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Wifi className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">WiFi</p>
                  <p className="font-bold text-purple-600">{status.wifi_rssi} dBm</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Stream Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Camera className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold">Canlı Stream & AI Analiz</h2>
              {isStreaming && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  CANLI
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={runAnalysis}
                disabled={loading || !isConnected}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Analiz Et
              </button>
              
              <button
                onClick={() => setShowDetections(!showDetections)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showDetections 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {showDetections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                İşaretlemeler
              </button>
              
              <button
                onClick={() => {
                  setTotalEntry(0);
                  setTotalExit(0);
                  setPreviousPersonCount(analysisData?.personCount || 0);
                  trackedPersonsRef.current.clear(); // ✅ Ref'i temizle
                  log('🔄 Giren/Çıkan sayaçları ve tracking sıfırlandı', 'info');
                }}
                disabled={!isStreaming}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
              >
                🔄 Sayacı Sıfırla
              </button>
            </div>
          </div>

          {/* GERÇEK City-V IoT STREAM CONTAINER */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-green-500" style={{ width: '100%', height: '600px' }}>
            {isStreaming ? (
              <div className="relative w-full h-full">
                {/* Stream Status */}
                <div className="absolute top-4 left-4 bg-green-600/90 text-white px-3 py-1 rounded-full text-sm font-medium z-30 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  LIVE: {deviceIp}
                </div>
                
                {/* GERÇEK City-V IMAGE STREAM */}
                <img
                  ref={streamRef}
                  src={`http://${deviceIp}/stream`}
                  alt="City-V Live Stream"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.log(`🎉 GERÇEK City-V IoT STREAM YÜKLENDİ!`);
                    console.log(`📏 Boyut: ${img.naturalWidth} x ${img.naturalHeight}`);
                    console.log(`🎥 Stream URL: ${img.src}`);
                    log('✅ City-V IoT canlı yayını başarıyla bağlandı!', 'success');
                    
                    // Stream yüklendiğinde canvas'ı da ayarla
                    if (canvasRef.current) {
                      canvasRef.current.width = img.naturalWidth || 640;
                      canvasRef.current.height = img.naturalHeight || 480;
                    }
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.error(`❌ City-V IoT STREAM HATA!`);
                    console.error(`🔗 Başarısız URL: ${img.src}`);
                    log('❌ City-V IoT stream bağlantısı kesildi!', 'error');
                  }}
                />
                {/* AI DETECTION OVERLAY CANVAS */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
                {/* LIVE STATS OVERLAY */}
                {analysisData && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg space-y-3">
                    {/* Anlık Sayımlar */}
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <p className="text-2xl font-bold text-red-400">{analysisData.personCount}</p>
                        <p className="text-xs">👤 Şu An</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{analysisData.tableCount}</p>
                        <p className="text-xs">🪑 Masa</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">{analysisData.occupancyRate}%</p>
                        <p className="text-xs">📊 Doluluk</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">{analysisData.objects.length}</p>
                        <p className="text-xs">🎯 Nesne</p>
                      </div>
                    </div>
                    
                    {/* 🚪 GİREN/ÇIKAN SAYAÇ */}
                    <div className="border-t border-white/20 pt-3 flex justify-around">
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-400">📥 {totalEntry}</p>
                        <p className="text-xs">Giren</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-orange-400">📤 {totalExit}</p>
                        <p className="text-xs">Çıkan</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-purple-400">🔄 {totalEntry - totalExit}</p>
                        <p className="text-xs">Net Giriş</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ minHeight: '500px' }}>
                <div className="text-center text-gray-400">
                  <Camera className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium">
                    {deviceIp ? 'Stream Bekleniyor' : 'Cihaz Bağlantısı Gerekli'}
                  </p>
                  <p className="text-sm mt-2">
                    {deviceIp ? 
                      'Yukarıdan "Başlat" butonuna tıklayın' : 
                      'IP adresini girin ve bağlantıyı test edin'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detection Results */}
        {analysisData && analysisData.objects.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🎯 Tespit Edilen Nesneler
              <span className="text-sm font-normal text-gray-500">
                ({lastUpdate?.toLocaleTimeString('tr-TR')})
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisData.objects.map((obj, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-3 h-12 rounded ${
                    obj.type === 'person' ? 'bg-red-500' :
                    obj.type === 'table' ? 'bg-blue-500' :
                    obj.type === 'chair' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">
                      {obj.type === 'person' ? '👤 Kişi' :
                       obj.type === 'table' ? '🪑 Masa' :
                       obj.type === 'chair' ? '💺 Sandalye' : '📦 Nesne'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Güven: {Math.round(obj.confidence * 100)}%
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {obj.bbox.width}×{obj.bbox.height}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>🚀 City-V AI Platform v3.0 - Production Ready</p>
          <p>Gerçek zamanlı AI analizi ile gelişmiş crowd monitoring sistemi</p>
        </div>
      </div>
    </div>
  );
}