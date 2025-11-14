'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, WifiOff, Camera, Users, Bus, MapPin, 
  Activity, AlertTriangle, Zap, Clock, Target,
  TrendingUp, Battery, Signal, Thermometer
} from 'lucide-react';

interface RealtimeData {
  type: 'crowd_analysis' | 'vehicle_arrival' | 'device_status';
  device_id: string;
  device_name: string;
  timestamp: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface IoTRealtimeProps {
  className?: string;
}

export default function IoTRealtime({ className = '' }: IoTRealtimeProps) {
  const [realtimeData, setRealtimeData] = useState<RealtimeData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Bağlanıyor...');

  useEffect(() => {
    // Simüle WebSocket bağlantısı (gerçek projede Socket.io kullanılır)
    simulateRealtimeConnection();
    
    return () => {
      // Cleanup
    };
  }, []);

  const simulateRealtimeConnection = () => {
    setIsConnected(true);
    setConnectionStatus('Bağlı');

    // Her 5-15 saniyede bir rastgele veri simüle et
    const interval = setInterval(() => {
      const randomData = generateRandomRealtimeData();
      addRealtimeData(randomData);
    }, Math.random() * 10000 + 5000);

    return () => clearInterval(interval);
  };

  const generateRandomRealtimeData = (): RealtimeData => {
    const devices = [
      { id: 'ESP32-001', name: 'Kızılay Durağı Kamerası' },
      { id: 'ESP32-002', name: 'Batıkent İstasyonu Kamerası' },
      { id: 'ESP32-003', name: 'M1 Metro Kamerası' },
      { id: 'ESP32-004', name: '405 Otobüs Kamerası' }
    ];

    const device = devices[Math.floor(Math.random() * devices.length)];
    const dataTypes = ['crowd_analysis', 'vehicle_arrival', 'device_status'];
    const type = dataTypes[Math.floor(Math.random() * dataTypes.length)] as any;

    let data: any = {};
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';

    switch (type) {
      case 'crowd_analysis':
        const peopleCount = Math.floor(Math.random() * 30);
        let density = 'empty';
        if (peopleCount > 0 && peopleCount <= 5) density = 'low';
        else if (peopleCount > 5 && peopleCount <= 10) density = 'medium';
        else if (peopleCount > 10 && peopleCount <= 15) density = 'high';
        else if (peopleCount > 15) density = 'overcrowded';

        priority = density === 'overcrowded' ? 'critical' : 
                  density === 'high' ? 'high' : 
                  density === 'medium' ? 'medium' : 'low';

        data = {
          people_count: peopleCount,
          crowd_density: density,
          confidence_score: Math.random() * 30 + 70,
          weather_condition: 'clear',
          temperature: Math.random() * 15 + 15
        };
        break;

      case 'vehicle_arrival':
        const statuses = ['approaching', 'arrived', 'departed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        priority = status === 'approaching' ? 'high' : 'medium';

        data = {
          vehicle_number: `${Math.floor(Math.random() * 900) + 100}`,
          vehicle_type: Math.random() > 0.5 ? 'bus' : 'metro',
          arrival_status: status,
          vehicle_occupancy_percent: Math.floor(Math.random() * 100),
          passenger_boarding: Math.floor(Math.random() * 15),
          passenger_alighting: Math.floor(Math.random() * 10)
        };
        break;

      case 'device_status':
        const isOnline = Math.random() > 0.1; // %90 online
        priority = isOnline ? 'low' : 'critical';

        data = {
          is_online: isOnline,
          battery_level: Math.floor(Math.random() * 40 + 60),
          signal_strength: Math.floor(Math.random() * 30 - 70),
          temperature: Math.random() * 10 + 30,
          free_memory: Math.floor(Math.random() * 50000 + 150000)
        };
        break;
    }

    return {
      type,
      device_id: device.id,
      device_name: device.name,
      timestamp: new Date().toISOString(),
      data,
      priority
    };
  };

  const addRealtimeData = (newData: RealtimeData) => {
    setRealtimeData(prev => {
      const updated = [newData, ...prev].slice(0, 20); // Son 20 veri
      return updated;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crowd_analysis': return <Users className="h-5 w-5" />;
      case 'vehicle_arrival': return <Bus className="h-5 w-5" />;
      case 'device_status': return <Camera className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'crowd_analysis': return 'Yoğunluk Analizi';
      case 'vehicle_arrival': return 'Araç Gelişi';
      case 'device_status': return 'Cihaz Durumu';
      default: return 'Bilinmeyen';
    }
  };

  const formatDataMessage = (item: RealtimeData) => {
    const { type, data } = item;

    switch (type) {
      case 'crowd_analysis':
        return `${data.people_count} kişi tespit edildi (${data.crowd_density}) - %${Math.round(data.confidence_score)} güven`;
      
      case 'vehicle_arrival':
        return `${data.vehicle_number} ${data.vehicle_type} ${data.arrival_status} - %${data.vehicle_occupancy_percent} dolu`;
      
      case 'device_status':
        return data.is_online 
          ? `Online - Batarya: %${data.battery_level}, Sinyal: ${data.signal_strength}dBm`
          : `OFFLINE - Bağlantı kesildi!`;
      
      default:
        return 'Veri alındı';
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Gerçek Zamanlı Veriler
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ESP32-CAM cihazlarından canlı veri akışı
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Wifi className="h-5 w-5" />
                <span className="text-sm font-medium">{connectionStatus}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <WifiOff className="h-5 w-5" />
                <span className="text-sm font-medium">{connectionStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Realtime Data Stream */}
      <div className="p-6">
        {realtimeData.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Gerçek zamanlı veri bekleniyor...
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realtimeData.map((item, index) => (
              <motion.div
                key={`${item.device_id}-${item.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-xl border-l-4 ${
                  item.priority === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  item.priority === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                  item.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-green-500 bg-green-50 dark:bg-green-900/20'
                } shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getPriorityColor(item.priority)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {item.device_name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {formatDataMessage(item)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.timestamp).toLocaleTimeString('tr-TR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {item.device_id}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Priority Indicator */}
                  <div className="ml-3">
                    {item.priority === 'critical' && (
                      <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                    )}
                    {item.priority === 'high' && (
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    )}
                    {item.priority === 'medium' && (
                      <Activity className="h-5 w-5 text-yellow-600" />
                    )}
                    {item.priority === 'low' && (
                      <Zap className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Additional Data for Critical Events */}
                {item.priority === 'critical' && item.type === 'crowd_analysis' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-red-200 dark:border-red-700"
                  >
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                          YOĞUNLUK UYARISI
                        </span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Aşırı yoğunluk tespit edildi! Alternatif güzergahlar önerilmelidir.
                      </p>
                    </div>
                  </motion.div>
                )}

                {item.priority === 'critical' && item.type === 'device_status' && !item.data.is_online && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-red-200 dark:border-red-700"
                  >
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <WifiOff className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                          CİHAZ ÇEVRIMDIŞI
                        </span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Cihaz bağlantısı kesildi. Teknik destek gerekebilir.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/50 rounded-b-2xl border-t border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {realtimeData.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Toplam Veri</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {realtimeData.filter(d => d.priority === 'critical').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Kritik Uyarı</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {realtimeData.filter(d => d.priority === 'high').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Yüksek Öncelik</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {realtimeData.filter(d => d.type === 'crowd_analysis').length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Yoğunluk Analizi</p>
          </div>
        </div>
      </div>
    </div>
  );
}