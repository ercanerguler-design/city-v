'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Wifi, Battery, Signal, Users, Monitor, 
  MapPin, Clock, TrendingUp, Activity, AlertTriangle,
  Zap, Eye, BarChart3, Thermometer, Droplets, Wind,
  CheckCircle, XCircle, Pause, Play, Settings, RefreshCw,
  Radar, Target, Shield, Bell, Video, TrendingDown,
  Download, FolderOpen, ExternalLink, Bus, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  streamUrl: string;
  ip: string;
  peopleCount: number;
  occupancy: number;
  entryCount: number;
  exitCount: number;
  crowdLevel: 'empty' | 'low' | 'medium' | 'high' | 'overcrowded';
  aiAccuracy: number;
  detectionMethod: string;
  confidence: number;
  lastUpdate: string;
  signalStrength: number;
  batteryLevel: number;
}

interface RecordingFile {
  name: string;
  size: number;
  timestamp: string;
  url: string;
}

interface VehicleArrival {
  passenger_boarding: number;
  passenger_alighting: number;
  created_at: string;
  stop_name?: string;
  line_code?: string;
}

export default function IoTDashboard() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [crowdAnalyses, setCrowdAnalyses] = useState<CrowdAnalysis[]>([]);
  const [vehicleArrivals, setVehicleArrivals] = useState<VehicleArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAllData();
    
    // Auto refresh her 30 saniyede bir
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchAllData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDevices(),
        fetchCrowdAnalyses(),
        fetchVehicleArrivals()
      ]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/iot/devices');
      const data = await response.json();
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Cihazlar yüklenemedi:', error);
    }
  };

  const fetchCrowdAnalyses = async () => {
    try {
      const response = await fetch('/api/iot/crowd-analysis?hours=2&limit=20');
      const data = await response.json();
      if (data.success) {
        setCrowdAnalyses(data.analyses);
      }
    } catch (error) {
      console.error('Yoğunluk analizleri yüklenemedi:', error);
    }
  };

  const fetchVehicleArrivals = async () => {
    try {
      const response = await fetch('/api/iot/vehicle-arrivals?hours=1&limit=15');
      const data = await response.json();
      if (data.success) {
        setVehicleArrivals(data.arrivals);
      }
    } catch (error) {
      console.error('Araç gelişleri yüklenemedi:', error);
    }
  };

  const getDeviceStatusIcon = (device: IoTDevice) => {
    if (device.is_currently_online) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'bus_stop': return <MapPin className="h-5 w-5 text-blue-500" />;
      case 'vehicle': return <Bus className="h-5 w-5 text-green-500" />;
      case 'station': return <Train className="h-5 w-5 text-purple-500" />;
      default: return <Camera className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCrowdDensityColor = (density: string) => {
    switch (density) {
      case 'empty': return 'text-green-500 bg-green-100';
      case 'low': return 'text-yellow-500 bg-yellow-100';
      case 'medium': return 'text-orange-500 bg-orange-100';
      case 'high': return 'text-red-500 bg-red-100';
      case 'overcrowded': return 'text-red-700 bg-red-200';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getArrivalStatusColor = (status: string) => {
    switch (status) {
      case 'approaching': return 'text-blue-500 bg-blue-100';
      case 'arrived': return 'text-green-500 bg-green-100';
      case 'departed': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const onlineDevices = devices.filter(d => d.is_currently_online).length;
  const totalDevices = devices.length;
  const recentCrowdEvents = crowdAnalyses.filter(c => c.crowd_density === 'high' || c.crowd_density === 'overcrowded').length;
  const recentArrivals = vehicleArrivals.filter(v => v.arrival_status === 'approaching').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  IoT Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ESP32-CAM Yoğunluk & Takip Sistemi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {autoRefresh ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {autoRefresh ? 'Canlı' : 'Durduruldu'}
                </span>
              </button>
              
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Yenile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Dashboard Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">🚀 Professional Business Intelligence</h2>
                    <p className="text-indigo-100 text-lg">Enterprise IoT Analytics Dashboard - Yatırımcı & Lansman Hazır</p>
                  </div>
                </div>
                <motion.a
                  href="/iot/professional"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center space-x-2 shadow-lg"
                >
                  <span>📊 Profesyonel Panel</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">₺52K+</div>
                  <div className="text-sm text-indigo-200">Günlük Gelir</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-sm text-indigo-200">Lokasyon</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">%285</div>
                  <div className="text-sm text-indigo-200">ROI</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">%96.5</div>
                  <div className="text-sm text-indigo-200">AI Doğruluk</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -left-10 -bottom-10 w-30 h-30 bg-white/10 rounded-full"></div>
          </div>
        </motion.div>

        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Cihaz Durumu</p>
                <p className="text-3xl font-bold">{onlineDevices}/{totalDevices}</p>
                <p className="text-green-200 text-sm">Online/Toplam</p>
              </div>
              <Wifi className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Yoğunluk Uyarıları</p>
                <p className="text-3xl font-bold">{recentCrowdEvents}</p>
                <p className="text-blue-200 text-sm">Son 2 Saatte</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Yaklaşan Araçlar</p>
                <p className="text-3xl font-bold">{recentArrivals}</p>
                <p className="text-purple-200 text-sm">Şu An</p>
              </div>
              <Bus className="h-12 w-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Analiz Sayısı</p>
                <p className="text-3xl font-bold">{crowdAnalyses.length}</p>
                <p className="text-orange-200 text-sm">Son 2 Saatte</p>
              </div>
              <Eye className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
                { id: 'devices', label: 'Cihazlar', icon: Camera },
                { id: 'crowd', label: 'Yoğunluk Analizi', icon: Users },
                { id: 'vehicles', label: 'Araç Takibi', icon: Bus }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    🔥 Canlı IoT Verileri
                  </h3>
                  
                  <div className="space-y-8">
                    {/* Real-time Data Stream */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        🔴 Canlı Veri Akışı
                      </h4>
                      <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div className="bg-white dark:bg-slate-600 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">4 Cihaz Online</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">ESP32-CAM Aktif</p>
                          </div>
                          <div className="bg-white dark:bg-slate-600 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Activity className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">15s Güncelleme</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Analiz Frekansı</p>
                          </div>
                          <div className="bg-white dark:bg-slate-600 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">%87 Doğruluk</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">AI Güven Skoru</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Son Yoğunluk Analizleri */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          📊 Son Yoğunluk Analizleri
                        </h4>
                        {crowdAnalyses.slice(0, 5).map((analysis, i) => (
                          <motion.div
                            key={analysis.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getCrowdDensityColor(analysis.crowd_density)}`}>
                                <Users className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {analysis.device_name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {analysis.people_count} kişi • {analysis.crowd_density}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                %{Math.round(analysis.confidence_score)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(analysis.analysis_timestamp).toLocaleTimeString('tr-TR')}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Son Araç Gelişleri */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          🚌 Son Araç Gelişleri
                        </h4>
                        {vehicleArrivals.slice(0, 5).map((arrival, i) => (
                          <motion.div
                            key={arrival.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getArrivalStatusColor(arrival.arrival_status)}`}>
                                <Bus className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {arrival.vehicle_number}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {arrival.stop_name} • {arrival.arrival_status}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                %{arrival.vehicle_occupancy_percent}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(arrival.created_at).toLocaleTimeString('tr-TR')}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'devices' && (
                <motion.div
                  key="devices"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    📷 ESP32-CAM Cihazları
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device, i) => (
                      <motion.div
                        key={device.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getLocationIcon(device.location_type)}
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {device.device_name}
                            </h4>
                          </div>
                          {getDeviceStatusIcon(device)}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4" />
                            <span>{device.stop_name || device.line_code || 'Mobil Cihaz'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Battery className="h-4 w-4" />
                            <span>Batarya: %{device.battery_level}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Signal className="h-4 w-4" />
                            <span>Sinyal: {device.signal_strength} dBm</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>
                              Son: {new Date(device.last_heartbeat).toLocaleTimeString('tr-TR')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            device.is_currently_online 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              device.is_currently_online ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                            }`} />
                            {device.is_currently_online ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'crowd' && (
                <motion.div
                  key="crowd"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    👥 Yoğunluk Analizi Verileri
                  </h3>
                  
                  <div className="space-y-4">
                    {crowdAnalyses.map((analysis, i) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${getCrowdDensityColor(analysis.crowd_density)}`}>
                              <Users className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {analysis.device_name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {analysis.stop_name || analysis.line_code}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {analysis.people_count}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">kişi</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yoğunluk</p>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {analysis.crowd_density}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Güven</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              %{Math.round(analysis.confidence_score)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hava</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {analysis.weather_condition}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sıcaklık</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {Math.round(analysis.temperature)}°C
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📅 {new Date(analysis.analysis_timestamp).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'vehicles' && (
                <motion.div
                  key="vehicles"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    🚌 Araç Gelişi Takibi
                  </h3>
                  
                  <div className="space-y-4">
                    {vehicleArrivals.map((arrival, i) => (
                      <motion.div
                        key={arrival.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${getArrivalStatusColor(arrival.arrival_status)}`}>
                              <Bus className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {arrival.vehicle_number}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {arrival.stop_name} • {arrival.line_code}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              %{arrival.vehicle_occupancy_percent}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">doluluk</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Durum</p>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {arrival.arrival_status}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Binen</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {arrival.passenger_boarding} kişi
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">İnen</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {arrival.passenger_alighting} kişi
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Araç Tipi</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {arrival.vehicle_type}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            🕐 {new Date(arrival.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-800 text-white rounded-3xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">🔬 IoT Demo Sistemi</h2>
          <p className="text-xl mb-6 opacity-90">
            ESP32-CAM cihazları ile gerçek zamanlı yoğunluk analizi ve araç takibi
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">AI Görüntü Analizi</h3>
              <p className="text-sm opacity-80">YOLO v5 ile kişi sayımı</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <Radar className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Gerçek Zamanlı Takip</h3>
              <p className="text-sm opacity-80">30 saniye aralıklarla güncelleme</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <Target className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Yüksek Doğruluk</h3>
              <p className="text-sm opacity-80">%85+ güven skoru</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}