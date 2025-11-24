'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, TrendingUp, AlertCircle, 
  CheckCircle, Clock, Wifi, WifiOff, RefreshCw 
} from 'lucide-react';

interface RealTimeDataManagerProps {
  businessId: string;
  onDataUpdate?: (data: any) => void;
  ngrokEnabled?: boolean;
}

interface RealTimeData {
  totalPeople: number;
  activeCameras: number;
  totalEntries: number;
  totalExits: number;
  avgOccupancy: number;
  crowdLevel: 'low' | 'medium' | 'high';
  lastUpdate: Date;
  cameras: Array<{
    cameraId: number;
    cameraName: string;
    currentPeople: number;
    isOnline: boolean;
  }>;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export default function RealTimeDataManager({ 
  businessId, 
  onDataUpdate, 
  ngrokEnabled = false 
}: RealTimeDataManagerProps) {
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    totalPeople: 0,
    activeCameras: 0,
    totalEntries: 0,
    totalExits: 0,
    avgOccupancy: 0,
    crowdLevel: 'low',
    lastUpdate: new Date(),
    cameras: [],
    connectionStatus: 'disconnected'
  });
  
  const [isActive, setIsActive] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 🔥 REAL-TIME: Veri çekme fonksiyonu
  const fetchRealTimeData = useCallback(async () => {
    if (!isActive) return;
    
    try {
      console.log('🔄 Real-time data fetch starting...', { businessId, ngrokEnabled, timestamp: new Date().toISOString() });
      
      setRealTimeData(prev => ({ ...prev, connectionStatus: 'reconnecting' }));
      
      // Multiple API endpoints ile comprehensive data al
      const [analyticsResponse, iotResponse] = await Promise.all([
        fetch(`/api/business/cameras/analytics/summary?businessUserId=${businessId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch(`/api/business/live-iot-data?businessId=${businessId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
      ]);

      if (!analyticsResponse.ok) {
        throw new Error(`Analytics API error: ${analyticsResponse.status}`);
      }

      const analyticsData = await analyticsResponse.json();
      const iotData = await iotResponse.json();
      
      console.log('📊 Real-time data received:', { 
        analytics: analyticsData.success, 
        iot: iotData.success,
        timestamp: new Date().toLocaleTimeString('tr-TR')
      });

      if (analyticsData.success) {
        const summary = analyticsData.summary;
        
        const newData: RealTimeData = {
          totalPeople: summary.totalPeople || 0,
          activeCameras: summary.activeCameras || 0,
          totalEntries: summary.totalEntries || 0,
          totalExits: summary.totalExits || 0,
          avgOccupancy: summary.avgOccupancy || 0,
          crowdLevel: summary.crowdLevel || 'low',
          lastUpdate: new Date(),
          cameras: summary.cameras || [],
          connectionStatus: 'connected'
        };
        
        setRealTimeData(newData);
        setError(null);
        setRetryCount(0);
        
        // Parent component'e veri gönder
        if (onDataUpdate) {
          onDataUpdate(newData);
        }
        
        console.log('✅ Real-time data updated successfully:', {
          people: newData.totalPeople,
          cameras: newData.activeCameras,
          level: newData.crowdLevel
        });
      } else {
        throw new Error(analyticsData.error || 'Analytics data fetch failed');
      }
      
    } catch (error: any) {
      console.error('❌ Real-time data fetch error:', error.message);
      setError(error.message);
      setRealTimeData(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      setRetryCount(prev => prev + 1);
    }
  }, [businessId, ngrokEnabled, onDataUpdate, isActive]);

  // 🔥 REAL-TIME: Auto refresh setup
  useEffect(() => {
    if (!isActive) return;
    
    // İlk veriyi hemen çek
    fetchRealTimeData();
    
    // 5 saniyede bir güncellemeleri başlat
    const interval = setInterval(fetchRealTimeData, 5000);
    
    console.log('⚡ Real-time updates started for business:', businessId);
    
    return () => {
      clearInterval(interval);
      console.log('🛑 Real-time updates stopped');
    };
  }, [fetchRealTimeData, businessId, isActive]);

  // Manual refresh
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchRealTimeData();
  };

  // Toggle real-time updates
  const toggleRealTime = () => {
    setIsActive(!isActive);
    console.log('🔄 Real-time updates:', !isActive ? 'ENABLED' : 'DISABLED');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg"
    >
      {/* Real-Time Status Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: realTimeData.connectionStatus === 'connected' ? [1, 1.2, 1] : 1,
              rotate: realTimeData.connectionStatus === 'reconnecting' ? 360 : 0
            }}
            transition={{ 
              scale: { duration: 1, repeat: Infinity },
              rotate: { duration: 1, repeat: Infinity, ease: "linear" }
            }}
            className={`p-2 rounded-lg ${
              realTimeData.connectionStatus === 'connected' 
                ? 'bg-green-100 text-green-600'
                : realTimeData.connectionStatus === 'reconnecting'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {realTimeData.connectionStatus === 'connected' ? (
              <Wifi className="w-5 h-5" />
            ) : realTimeData.connectionStatus === 'reconnecting' ? (
              <RefreshCw className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
          </motion.div>
          
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              Real-Time Dashboard
              {ngrokEnabled && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Ngrok Enabled
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600">
              {realTimeData.connectionStatus === 'connected' 
                ? `Son güncelleme: ${realTimeData.lastUpdate.toLocaleTimeString('tr-TR')}`
                : realTimeData.connectionStatus === 'reconnecting'
                ? 'Bağlanıyor...'
                : `Bağlantı kesildi ${retryCount > 0 ? `(${retryCount} deneme)` : ''}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={realTimeData.connectionStatus === 'reconnecting'}
          >
            <RefreshCw className={`w-4 h-4 ${
              realTimeData.connectionStatus === 'reconnecting' ? 'animate-spin' : ''
            }`} />
          </button>
          
          <button
            onClick={toggleRealTime}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isActive ? 'CANLI' : 'DURDUR'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
          >
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Bağlantı Hatası:</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-Time Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total People */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-blue-600" />
            <motion.span 
              key={realTimeData.totalPeople}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-blue-700"
            >
              {realTimeData.totalPeople}
            </motion.span>
          </div>
          <p className="text-blue-600 font-medium mt-2">Toplam Kişi</p>
          <p className="text-blue-500 text-xs">
            Seviye: {realTimeData.crowdLevel === 'high' ? 'Yoğun' : 
                     realTimeData.crowdLevel === 'medium' ? 'Orta' : 'Az'}
          </p>
        </motion.div>

        {/* Active Cameras */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
        >
          <div className="flex items-center justify-between">
            <Activity className="w-8 h-8 text-green-600" />
            <motion.span 
              key={realTimeData.activeCameras}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-green-700"
            >
              {realTimeData.activeCameras}
            </motion.span>
          </div>
          <p className="text-green-600 font-medium mt-2">Aktif Kamera</p>
          <p className="text-green-500 text-xs">
            {realTimeData.cameras.filter(c => c.isOnline).length} online
          </p>
        </motion.div>

        {/* Entry/Exit */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="text-right">
              <motion.div 
                key={`${realTimeData.totalEntries}-${realTimeData.totalExits}`}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold text-purple-700"
              >
                <span className="text-green-600">+{realTimeData.totalEntries}</span>
                <span className="mx-1 text-purple-600">/</span>
                <span className="text-red-600">-{realTimeData.totalExits}</span>
              </motion.div>
            </div>
          </div>
          <p className="text-purple-600 font-medium mt-2">Giriş/Çıkış</p>
          <p className="text-purple-500 text-xs">
            Net: {realTimeData.totalEntries - realTimeData.totalExits}
          </p>
        </motion.div>

        {/* Occupancy */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <Clock className="w-8 h-8 text-orange-600" />
            <motion.span 
              key={realTimeData.avgOccupancy}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-orange-700"
            >
              {Math.round(realTimeData.avgOccupancy)}%
            </motion.span>
          </div>
          <p className="text-orange-600 font-medium mt-2">Doluluk</p>
          <p className="text-orange-500 text-xs">
            Ortalama yoğunluk
          </p>
        </motion.div>
      </div>

      {/* Camera Status List */}
      {realTimeData.cameras.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Kamera Durumu</h4>
          <div className="space-y-2">
            {realTimeData.cameras.map((camera) => (
              <motion.div
                key={camera.cameraId}
                layout
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  camera.isOnline 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    camera.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium text-gray-900">{camera.cameraName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {camera.currentPeople} kişi
                  </span>
                  {camera.isOnline && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}