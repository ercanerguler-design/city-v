'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Camera, Activity, Wifi, Clock, Users, MapPin, Eye, Zap } from 'lucide-react';

interface DetectedObject {
  type: 'person' | 'table' | 'chair' | 'object';
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AnalysisData {
  objects: DetectedObject[];
  crowdLevel: string;
  personCount: number;
  tableCount: number;
  occupancyRate: number;
  timestamp: number;
}

interface DeviceStatus {
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

export default function ESP32Dashboard() {
  const [deviceIp, setDeviceIp] = useState('192.168.1.9');
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [showDetections, setShowDetections] = useState(true);
  const streamRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Durum bilgisini al
  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://${deviceIp}/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('❌ Durum alınamadı:', error);
    }
  };

  // Frame analizi yap
  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/esp32/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceIp })
      });
      const result = await response.json();
      
      if (result.success) {
        setAnalysisData(result.data);
        console.log('📊 Analiz:', result.data);
      }
    } catch (error) {
      console.error('❌ Analiz hatası:', error);
    }
    setLoading(false);
  };

  // Stream başlat
  const startStream = () => {
    console.log('🎬 Stream başlatılıyor:', `http://${deviceIp}/stream`);
    
    // IP adresi doğrulama
    if (!deviceIp || deviceIp.trim() === '') {
      alert('⚠️ Lütfen ESP32-CAM IP adresini girin!');
      return;
    }

    setIsStreaming(true);
    if (streamRef.current) {
      const streamUrl = `http://${deviceIp}/stream`;
      console.log('📡 Stream URL:', streamUrl);
      streamRef.current.src = streamUrl;
    }
    
    // Otomatik analiz başlat
    const interval = setInterval(runAnalysis, 5000); // 5 saniyede bir
    return () => clearInterval(interval);
  };

  // Stream durdur
  const stopStream = () => {
    console.log('⏹️ Stream durduruluyor');
    setIsStreaming(false);
    if (streamRef.current) {
      streamRef.current.src = '';
    }
  };

  // Canvas üzerine tespit kutularını çiz
  useEffect(() => {
    if (!canvasRef.current || !streamRef.current || !analysisData || !showDetections) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas boyutunu stream ile eşleştir
    canvas.width = streamRef.current.width || 640;
    canvas.height = streamRef.current.height || 480;

    // Temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Her tespit için kutu çiz
    analysisData.objects.forEach((obj) => {
      const { x, y, width, height } = obj.bbox;
      
      // Renk seçimi
      let color = '#00FF00'; // Yeşil (varsayılan)
      if (obj.type === 'person') color = '#FF0000'; // Kırmızı
      else if (obj.type === 'table') color = '#0000FF'; // Mavi
      else if (obj.type === 'chair') color = '#FFFF00'; // Sarı

      // Kutu çiz
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Etiket arka planı
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 25, width, 25);

      // Etiket metni
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      const label = `${obj.type.toUpperCase()} ${(obj.confidence * 100).toFixed(0)}%`;
      ctx.fillText(label, x + 5, y - 8);
    });
  }, [analysisData, showDetections]);

  // Otomatik durum güncelleme
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [deviceIp]);

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      case 'empty': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getCrowdLabel = (level: string) => {
    switch (level) {
      case 'very_high': return 'Çok Yoğun';
      case 'high': return 'Yoğun';
      case 'moderate': return 'Orta';
      case 'low': return 'Az Yoğun';
      case 'empty': return 'Boş';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎥 ESP32-CAM AI Analiz Sistemi
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerçek zamanlı insan ve nesne tespiti ile yoğunluk analizi
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStatus} variant="outline">
            🔄 Yenile
          </Button>
          <Button onClick={() => setShowDetections(!showDetections)} variant="outline">
            {showDetections ? <Eye className="w-4 h-4 mr-2" /> : '👁️‍🗨️'}
            {showDetections ? 'İşaretlemeleri Gizle' : 'İşaretlemeleri Göster'}
          </Button>
        </div>
      </div>

      {/* IP Ayarı */}
      <Card className="border-2 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-600" />
            Cihaz Bağlantısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="192.168.1.9"
              value={deviceIp}
              onChange={(e) => setDeviceIp(e.target.value)}
              className="font-mono"
            />
            <Button onClick={fetchStatus} className="bg-blue-600 hover:bg-blue-700">
              Bağlan
            </Button>
          </div>
          
          {/* Quick Test */}
          {deviceIp && (
            <div className="flex gap-2 text-sm">
              <Button 
                onClick={() => window.open(`http://${deviceIp}/status`, '_blank')} 
                variant="outline" 
                size="sm"
              >
                🔍 Status Test
              </Button>
              <Button 
                onClick={() => window.open(`http://${deviceIp}/stream`, '_blank')} 
                variant="outline" 
                size="sm"
              >
                🎥 Stream Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Durum Kartları */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Durum</p>
                  <p className="text-2xl font-bold">
                    {status.status === 'online' ? '🟢 Aktif' : '🔴 Kapalı'}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tespit Edilen</p>
                  <p className="text-2xl font-bold">
                    {analysisData?.personCount || 0} Kişi
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analysisData?.tableCount || 0} Masa
                  </p>
                </div>
                <Users className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Doluluk Oranı</p>
                  <p className="text-2xl font-bold">
                    {analysisData?.occupancyRate.toFixed(0) || 0}%
                  </p>
                  <Badge className={`mt-1 ${getCrowdColor(analysisData?.crowdLevel || 'empty')}`}>
                    {getCrowdLabel(analysisData?.crowdLevel || 'empty')}
                  </Badge>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">WiFi Gücü</p>
                  <p className="text-2xl font-bold">{status.wifi_rssi} dBm</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor(status.uptime / 60000)} dakika
                  </p>
                </div>
                <Wifi className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Canlı Stream + AI Overlay */}
      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Canlı Görüntü + AI Analiz
            </span>
            <div className="flex gap-2">
              <Button 
                onClick={runAnalysis} 
                disabled={loading}
                variant="outline"
                className="border-purple-500"
              >
                {loading ? '⏳ Analiz ediliyor...' : '🔍 Şimdi Analiz Et'}
              </Button>
              <Button 
                onClick={isStreaming ? stopStream : startStream} 
                variant={isStreaming ? 'destructive' : 'default'}
                className={isStreaming ? '' : 'bg-gradient-to-r from-blue-600 to-purple-600'}
              >
                {isStreaming ? '⏹️ Stream'i Durdur' : '▶️ Canlı İzlemeyi Başlat'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isStreaming ? (
            <div className="relative bg-black rounded-lg overflow-hidden">
              {/* Stream görüntüsü */}
              <img
                ref={streamRef}
                alt="ESP32-CAM Stream"
                className="w-full h-auto"
                onError={(e) => {
                  console.error('❌ Stream hatası:', e);
                  setIsStreaming(false);
                  // Stream hatası durumunda kullanıcıyı bilgilendir
                  if (streamRef.current?.src) {
                    console.log('Denenen stream URL:', streamRef.current.src);
                  }
                }}
                onLoad={() => {
                  console.log('✅ Stream başarıyla yüklendi');
                  if (canvasRef.current && streamRef.current) {
                    canvasRef.current.width = streamRef.current.width;
                    canvasRef.current.height = streamRef.current.height;
                  }
                }}
              />
              
              {/* AI detection overlay canvas */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />

              {/* CANLI badge */}
              <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                🔴 CANLI AI ANALİZ
              </div>

              {/* İstatistikler overlay */}
              {analysisData && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-lg border border-white/20">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-red-400">{analysisData.personCount}</p>
                      <p className="text-xs">Kişi</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-400">{analysisData.tableCount}</p>
                      <p className="text-xs">Masa</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-400">
                        {analysisData.occupancyRate.toFixed(0)}%
                      </p>
                      <p className="text-xs">Doluluk</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">
                        {analysisData.objects.length}
                      </p>
                      <p className="text-xs">Nesne</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg font-semibold">
                  {deviceIp ? 'Stream Bekleniyor...' : 'ESP32-CAM Bağlantısı'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {deviceIp ? 
                    `ESP32-CAM (${deviceIp}) bağlantısını kontrol edin` : 
                    'Önce IP adresini girin, sonra stream başlatın'
                  }
                </p>
                {deviceIp && (
                  <div className="mt-4 text-xs text-gray-600">
                    <p>✅ Kontrol Listesi:</p>
                    <p>📍 ESP32-CAM WiFi'ye bağlı mı?</p>
                    <p>🌐 IP: http://{deviceIp}/stream</p>
                    <p>🔌 Güç kaynağı yeterli mi? (5V 2A)</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tespit Edilen Nesneler Listesi */}
      {analysisData && analysisData.objects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Tespit Edilen Nesneler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysisData.objects.map((obj, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                >
                  <div className={`w-2 h-12 rounded ${
                    obj.type === 'person' ? 'bg-red-500' :
                    obj.type === 'table' ? 'bg-blue-500' :
                    obj.type === 'chair' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {obj.type === 'person' ? '👤 Kişi' :
                       obj.type === 'table' ? '🪑 Masa' :
                       obj.type === 'chair' ? '💺 Sandalye' :
                       '📦 Nesne'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Güven: {(obj.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Badge variant="outline">
                    {obj.bbox.width}×{obj.bbox.height}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detaylı Sistem Bilgileri */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cihaz ID</p>
                <p className="font-mono text-sm">{status.device_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lokasyon</p>
                <p className="font-medium">{status.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IP Adresi</p>
                <p className="font-mono text-sm">{status.ip}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Son Güncelleme</p>
                <p className="text-sm">
                  {analysisData ? new Date(analysisData.timestamp).toLocaleTimeString('tr-TR') : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
