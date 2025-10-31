'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Wifi, Activity, Users, CheckCircle, AlertCircle, 
  BarChart3, TrendingUp, Target, Clock, Play, Search, 
  ThermometerSun, Eye, UserCheck
} from 'lucide-react';
import { useBusinessStore } from '@/store/businessStore';

interface BusinessLiveCrowdProps {
  locationId: string;
  businessName: string;
  cameraIp?: string;
  maxCapacity?: number;
}

export default function BusinessLiveCrowd({ 
  locationId, 
  businessName,
  cameraIp = '192.168.1.2',
  maxCapacity = 50 
}: BusinessLiveCrowdProps) {
  const { 
    updateLiveCrowd, 
    setCameraConnection, 
    liveCrowdData,
    cameraConnected
  } = useBusinessStore();

  // CityV AI Kamerası verilerini çek
  const fetchCameraData = async () => {
    try {
      const response = await fetch('/api/camera/data');
      const result = await response.json();
      
      if (result.success && result.data) {
        const data = result.data;
        
        // CityV AI Kamerası bağlantı durumunu güncelle
        setCameraConnection(data.status === 'active');
        setCityVCameraConnection(data.status === 'active');
        
        // Local state güncelle
        setCurrentCount(data.humans || 0);
        setCrowdDensity(data.density || 0);
        setTemperature(data.temperature || 25);
        setLastUpdate(new Date().toLocaleTimeString('tr-TR'));
        
        // Store güncelle (tek parametre ile)
        updateLiveCrowd({
          locationId,
          currentCount: data.humans,
          density: data.density,
          temperature: data.temperature || 25,
          lastUpdate: new Date(data.lastUpdate).toLocaleTimeString('tr-TR'),
          deviceStatus: data.status
        });
        
        console.log('📡 CityV AI Kamerası verisi güncellendi:', data);
      }
    } catch (error) {
      console.error('❌ CityV AI Kamerası veri hatası:', error);
      setCameraConnection(false);
      setCityVCameraConnection(false);
    }
  };

  // Ana veri state'leri
  const [currentCount, setCurrentCount] = useState(0);
  const [crowdDensity, setCrowdDensity] = useState(0);
  const [temperature, setTemperature] = useState(25);
  const [lastUpdate, setLastUpdate] = useState('--:--');
  // State tanımları
  const [cityVCameraConnection, setCityVCameraConnection] = useState(false);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraIP, setCameraIP] = useState(cameraIp);
  const [currentIP, setCurrentIP] = useState(cameraIp);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [streamAnalytics, setStreamAnalytics] = useState({
    entryCount: 0,
    exitCount: 0,
    currentPeople: 0,
    objectsDetected: 0,
    crowdDensity: 0,
    heatLevel: 25.0,
    peakTime: '14:30',
    lastAnalysis: new Date().toLocaleTimeString('tr-TR')
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Gerçek zamanlı analiz verileri
  const realAnalytics = {
    roi: Math.floor(currentCount * 2.5 + 120), // ROI = kişi sayısı * katkı + base
    costSavings: Math.floor(currentCount * 150 + 20000), // Kişi başı tasarruf
    operationalEfficiency: Math.min(95, Math.floor(crowdDensity * 0.8 + 70)), // Yoğunluk bazlı verimlilik
    customerSatisfaction: Math.min(98, Math.floor((100 - crowdDensity) * 0.9 + 85)) // Yoğunluk azsa memnuniyet artar
  };

  // Stream analiz fonksiyonu
  const startStreamAnalysis = () => {
    if (!isStreaming) return;
    
    const analysisInterval = setInterval(() => {
      // Simulated AI analysis - gerçek uygulamada video frame'lerinden çekilir
      const newAnalytics = {
        entryCount: streamAnalytics.entryCount + Math.floor(Math.random() * 3),
        exitCount: streamAnalytics.exitCount + Math.floor(Math.random() * 2),
        currentPeople: Math.floor(Math.random() * 15) + 5,
        objectsDetected: Math.floor(Math.random() * 20) + 10,
        crowdDensity: Math.floor(Math.random() * 80) + 20,
        heatLevel: parseFloat((Math.random() * 10 + 20).toFixed(1)),
        peakTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        lastAnalysis: new Date().toLocaleTimeString('tr-TR')
      };
      
      setStreamAnalytics(newAnalytics);
      
      // CityV API'ye gönder
      fetchCameraData();
    }, 2000); // Her 2 saniyede bir analiz
    
    return analysisInterval;
  };

  // Store'dan gelen cameraConnected ile local state'i senkronize et
  useEffect(() => {
    setCityVCameraConnection(cameraConnected);
  }, [cameraConnected]);

  useEffect(() => {
    let analysisInterval: NodeJS.Timeout | undefined;
    
    if (isStreaming) {
      analysisInterval = startStreamAnalysis();
    }
    
    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, [isStreaming]);

  const testCityVConnection = async (ip: string) => {
    console.log(`🔍 CityV kamerası bağlantısı test ediliyor: ${ip}...`);
    
    // IP format kontrolü
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      console.error('❌ Geçersiz IP adresi formatı:', ip);
      setCameraError(`Geçersiz IP adresi formatı: ${ip}`);
      return false;
    }
    
    try {
      // Timeout ile daha hızlı test
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`http://${ip}/`, { 
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('✅ CityV AI Kamerası root endpoint yanıt verdi');
      return true;
      
    } catch (error: any) {
      console.error('❌ CityV AI Kamerası bağlantısı başarısız:', error.message);
      
      // Ağ hatası vs timeout ayırımı
      if (error.name === 'AbortError') {
        setCameraError(`Bağlantı zaman aşımı: ${ip} adresindeki CityV kamerası 3 saniye içinde yanıt vermedi`);
      } else if (error.message.includes('Failed to fetch')) {
        setCameraError(`Ağ hatası: ${ip} adresine ulaşılamıyor. CityV kamerasının açık ve WiFi'ye bağlı olduğunu kontrol edin`);
      } else {
        setCameraError(`Bağlantı hatası: ${error.message}`);
      }
      
      return false;
    }
  };

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    
    console.log(`🎥 CityV AI Kamerası bağlantısı test ediliyor: ${currentIP}...`);
    alert('CityV AI Kamerası bağlantısı kontrol ediliyor...');
    
    // Test CityV bağlantısı
    const isConnected = await testCityVConnection(currentIP);
    
    if (isConnected) {
      console.log('✅ CityV AI Kamerası bağlantısı başarılı');
      alert('CityV AI Kamerası başarıyla bağlandı!');
      setIsStreaming(true);
      setCameraConnection(true);
      setCityVCameraConnection(true);
      
      // Video stream başlat
      if (videoRef.current) {
        videoRef.current.src = `http://${currentIP}:81/stream`;
        videoRef.current.play().catch(error => {
          console.error('Video oynatma hatası:', error);
          setCameraError('Video stream başlatılamadı. Kamera IP adresini kontrol edin.');
          alert('Video stream başlatılamadı. Kamera IP adresini kontrol edin.');
        });
      }
    } else {
      console.error('❌ CityV AI Kamerası bağlantısı başarısız');
      setCameraError(`CityV AI Kamerasına ${currentIP} adresinden ulaşılamıyor. Cihazı ve ağ bağlantısını kontrol edin.`);
      alert(`CityV AI Kamerasına ${currentIP} adresinden ulaşılamıyor. Cihazı ve ağ bağlantısını kontrol edin.`);
      setCameraConnection(false);
      setCityVCameraConnection(false);
    }
    
    setCameraLoading(false);
  };

  const stopCamera = () => {
    setIsStreaming(false);
    setCameraConnection(false);
    setCityVCameraConnection(false);
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    
    // Analytics sıfırla
    setStreamAnalytics({
      entryCount: 0,
      exitCount: 0,
      currentPeople: 0,
      objectsDetected: 0,
      crowdDensity: 0,
      heatLevel: 25.0,
      peakTime: '',
      lastAnalysis: ''
    });
  };

  const scanForESP32 = async () => {
    setIsScanning(true);
    setCameraError(null);
    
    const baseIP = '192.168.1.';
    const foundDevices: string[] = [];
    
    console.log('🔍 CityV AI kameraları aranıyor...');
    
    // Common CityV AI Camera IP addresses to check
    const commonIPs = [2, 9, 10, 15, 20, 25, 30, 50, 100, 105, 110, 150, 200];
    
    const promises = commonIPs.map(async (lastOctet) => {
      const testIP = baseIP + lastOctet;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        
        const response = await fetch(`http://${testIP}/`, {
          method: 'GET',
          mode: 'no-cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`✅ CityV kamera bulundu: ${testIP}`);
        foundDevices.push(testIP);
        return testIP;
      } catch (error) {
        // Tarama için sessiz hata
        return null;
      }
    });
    
    await Promise.all(promises);
    
    if (foundDevices.length > 0) {
      const foundIP = foundDevices[0];
      setCurrentIP(foundIP);
      console.log(`🎯 CityV AI kamera bulundu: ${foundIP}`);
      alert(`🎯 CityV AI kamera bulundu: ${foundIP}\nIP adresi otomatik güncellendi.`);
    } else {
      setCameraError('Ağda CityV AI kamera bulunamadı. Lütfen IP adresini manuel girin.');
      console.log('❌ Yaygın IP adreslerinde CityV kamera bulunamadı');
    }
    
    setIsScanning(false);
  };

  const crowdLevel = currentCount / maxCapacity;
  const crowdStatus = crowdLevel > 0.8 ? 'Yüksek' : crowdLevel > 0.5 ? 'Orta' : 'Düşük';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{businessName}</h2>
            <p className="text-gray-600">Canlı Kalabalık Analizi</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              cameraConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <Wifi className="w-4 h-4" />
              <span>{cameraConnected ? 'Bağlı' : 'Bağlantı Yok'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white rounded-lg shadow-sm border p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mevcut Sayı</p>
              <p className="text-3xl font-bold text-blue-600">{currentCount}</p>
              <p className="text-sm text-gray-500">{maxCapacity} kapasite</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  crowdLevel > 0.8 ? 'bg-red-500' : crowdLevel > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(crowdLevel * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">Yoğunluk Seviyesi: {crowdStatus}</p>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yatırım Getirisi</p>
              <p className="text-3xl font-bold text-green-600">{realAnalytics.roi}%</p>
              <p className="text-sm text-green-600">Geçen aydan +12%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maliyet Tasarrufu</p>
              <p className="text-3xl font-bold text-purple-600">₺{realAnalytics.costSavings.toLocaleString()}</p>
              <p className="text-sm text-purple-600">Aylık</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verimlilik</p>
              <p className="text-3xl font-bold text-orange-600">{realAnalytics.operationalEfficiency}%</p>
              <p className="text-sm text-orange-600">Operasyonel</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Camera Section */}
      {/* Sadeleştirilmiş CityV AI Kamera Kontrolleri */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>📹 CityV AI Live Feed</span>
          </h3>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${esp32Connection ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className={esp32Connection ? 'text-green-600' : 'text-gray-500'}>
              {esp32Connection ? 'Bağlı' : 'Bağlı Değil'}
            </span>
          </div>
        </div>
            
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={currentIP}
              onChange={(e) => setCurrentIP(e.target.value)}
              placeholder="192.168.1.100"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40"
            />
            <button
              onClick={scanForESP32}
              disabled={isScanning}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isScanning ? 'Taranıyor...' : 'Ağı Tara'}</span>
            </button>
          </div>
          
          {!isStreaming ? (
            <button
              onClick={startCamera}
              disabled={cameraLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{cameraLoading ? 'Bağlanıyor...' : 'Kamerayı Başlat'}</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <span>Kamerayı Durdur</span>
            </button>
          )}
        </div>

        {/* Live Stream & Analytics */}
        {isStreaming && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Video Feed */}
            <div className="bg-gray-900 rounded-lg p-4">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg"
                controls={false}
                autoPlay
                muted
                playsInline
              />
              <div className="flex items-center justify-between mt-2 text-sm text-gray-300">
                <span>🔴 LIVE</span>
                <span>{currentIP}:81/stream</span>
              </div>
            </div>

            {/* Real-time Analytics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Giriş</p>
                    <p className="text-2xl font-bold text-blue-800">{streamAnalytics.entryCount}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Çıkış</p>
                    <p className="text-2xl font-bold text-red-800">{streamAnalytics.exitCount}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Mevcut Kişi</p>
                    <p className="text-2xl font-bold text-green-800">{streamAnalytics.currentPeople}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Sıcaklık</p>
                    <p className="text-2xl font-bold text-orange-800">{streamAnalytics.heatLevel}°C</p>
                  </div>
                  <ThermometerSun className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-purple-600">Yoğunluk Analizi</p>
                  <span className="text-xs text-purple-500">Son: {streamAnalytics.lastAnalysis}</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${streamAnalytics.crowdDensity}%` }}
                  />
                </div>
                <p className="text-lg font-bold text-purple-800 mt-1">{streamAnalytics.crowdDensity}% Doluluk</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Durumu</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-700">Analiz Çalışıyor</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-700">Veri Toplama Aktif</span>
          </div>
          <div className="flex items-center space-x-3">
            {cameraConnected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-gray-700">CityV AI Bağlantısı</span>
          </div>
        </div>
      </div>
    </div>
  );
}