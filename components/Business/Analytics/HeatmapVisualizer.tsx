'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplet, TrendingUp, MapPin, Clock } from 'lucide-react';

interface HeatmapVisualizerProps {
  businessId: string;
  width?: number;
  height?: number;
}

interface HeatPoint {
  x: number;
  y: number;
  intensity: number;
  timestamp?: string;
  location?: string;
}

interface Hotspot {
  zone: string;
  avgIntensity: number;
  dataPoints: number;
}

interface HourlyData {
  hour: number;
  avgIntensity: number;
}

export default function HeatmapVisualizer({ businessId, width = 1200, height = 600 }: HeatmapVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgIntensity, setAvgIntensity] = useState(0);
  const [peakHour, setPeakHour] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchHeatmapData();
    // 🔥 REAL-TIME: 10 saniyede bir ısı haritası güncellenir
    const interval = setInterval(() => {
      console.log('🔥 Heatmap güncelleniyor...');
      fetchHeatmapData();
      setLastUpdate(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, [businessId]);

  useEffect(() => {
    if (heatPoints.length > 0) {
      drawHeatmap();
    }
  }, [heatPoints]);

  const fetchHeatmapData = async () => {
    try {
      console.log('📊 Fetching heatmap data for business:', businessId);
      
      // Gerçek analytics API'den veri çek
      const response = await fetch(`/api/business/analytics?businessId=${businessId}`);
      const data = await response.json();

      console.log('📊 Analytics data:', data);

      if (data.success) {
        // Gerçek veriyi ısı haritası noktalarına dönüştür
        const points: HeatPoint[] = [];
        
        // Her saatlik veriyi canvas noktasına çevir
        if (data.hourlyData && data.hourlyData.length > 0) {
          data.hourlyData.forEach((item: any) => {
            const hour = parseInt(item.hour);
            let intensity = parseFloat(item.avg_occupancy) / 100; // 0-1 arası normalize et
            
            // Intensity güvenlik kontrolü
            if (!intensity || isNaN(intensity) || intensity < 0) {
              intensity = 0;
            }
            intensity = Math.min(Math.max(intensity, 0), 1); // 0-1 arası clamp
            
            // Canvas üzerinde yatay dağıtım (saat bazlı)
            const x = (hour / 24) * width;
            const y = height / 2 + (Math.random() - 0.5) * (height * 0.4);
            
            points.push({
              x,
              y,
              intensity,
              timestamp: `${hour}:00`,
              location: item.location_name || 'Genel Alan'
            });
          });
        }
        
        // Hotspot'ları ayarla
        if (data.topLocations && data.topLocations.length > 0) {
          const spots = data.topLocations.map((loc: any) => ({
            zone: loc.location_name || loc.zone || 'Bilinmeyen Bölge',
            avgIntensity: parseFloat(loc.avg_occupancy) || 0,
            dataPoints: parseInt(loc.data_points) || 0
          }));
          setHotspots(spots);
        }
        
        // Saatlik yoğunluk grafiği için veri
        if (data.peakHours && data.peakHours.length > 0) {
          const hourly = data.peakHours.map((item: any) => ({
            hour: parseInt(item.hour),
            avgIntensity: parseFloat(item.avg_occupancy)
          }));
          setHourlyData(hourly);
          
          // En yoğun saati bul
          const peak = hourly.reduce((max: any, curr: any) => 
            curr.avgIntensity > max.avgIntensity ? curr : max
          , hourly[0]);
          setPeakHour(peak.hour);
        }
        
        setHeatPoints(points);
        setAvgIntensity(data.analytics?.avgOccupancy || 0);
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch heatmap:', error);
      setLoading(false);
    }
  };

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw elegant grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 60) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw time axis labels (24 hours)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    for (let hour = 0; hour < 24; hour += 3) {
      const x = (hour / 24) * width;
      ctx.fillText(`${hour}:00`, x, height - 10);
    }

    // Draw heatmap points with enhanced gradients
    heatPoints.forEach(point => {
      const radius = 80; // Larger heat radius for better visualization
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);

      // Enhanced color scheme based on intensity - Safe validation
      let intensity = point.intensity;
      
      // Validate and normalize intensity
      if (!intensity || isNaN(intensity) || intensity < 0) {
        intensity = 0;
      }
      intensity = Math.min(Math.max(intensity, 0), 1); // Clamp between 0-1
      
      // Ensure alpha values are valid (0-1 range)
      const alpha1 = Math.min(Math.max(intensity * 0.9, 0), 1);
      const alpha2 = Math.min(Math.max(intensity * 0.6, 0), 1);
      const alpha3 = Math.min(Math.max(intensity * 0.3, 0), 1);
      const alpha4 = Math.min(Math.max(intensity * 0.7, 0), 1);
      const alpha5 = Math.min(Math.max(intensity * 0.4, 0), 1);
      const alpha6 = Math.min(Math.max(intensity * 0.2, 0), 1);
      const alpha7 = Math.min(Math.max(intensity * 0.8, 0), 1);
      const alpha8 = Math.min(Math.max(intensity * 0.5, 0), 1);
      
      if (intensity > 0.75) {
        // Critical - Red
        gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha1})`);
        gradient.addColorStop(0.4, `rgba(239, 68, 68, ${alpha2})`);
        gradient.addColorStop(0.7, `rgba(220, 38, 38, ${alpha3})`);
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (intensity > 0.5) {
        // High - Orange
        gradient.addColorStop(0, `rgba(251, 146, 60, ${alpha1})`);
        gradient.addColorStop(0.4, `rgba(251, 146, 60, ${alpha2})`);
        gradient.addColorStop(0.7, `rgba(249, 115, 22, ${alpha3})`);
        gradient.addColorStop(1, 'rgba(251, 146, 60, 0)');
      } else if (intensity > 0.3) {
        // Medium - Yellow
        gradient.addColorStop(0, `rgba(234, 179, 8, ${alpha7})`);
        gradient.addColorStop(0.4, `rgba(234, 179, 8, ${alpha8})`);
        gradient.addColorStop(0.7, `rgba(202, 138, 4, ${alpha6})`);
        gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
      } else {
        // Low - Green
        gradient.addColorStop(0, `rgba(34, 197, 94, ${alpha4})`);
        gradient.addColorStop(0.4, `rgba(34, 197, 94, ${alpha5})`);
        gradient.addColorStop(0.7, `rgba(22, 163, 74, ${alpha6})`);
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      }

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = 'source-over';
    });

    // Draw hotspot markers with labels
    hotspots.slice(0, 5).forEach((hotspot, index) => {
      // Position hotspots intelligently based on their data
      const x = 100 + (index * 220);
      const y = height / 2 + (Math.sin(index) * (height * 0.3));

      // Animated pulse effect
      const pulseRadius = 12 + Math.sin(Date.now() / 500 + index) * 3;
      
      // Outer glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius * 2);
      glowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
      glowGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main circle
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Zone label above marker
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(hotspot.zone, x, y - 25);
      
      // Intensity percentage below marker
      ctx.font = '11px Inter';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
      ctx.fillText(`${Math.round(hotspot.avgIntensity)}%`, x, y + 30);
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700 rounded w-32"></div>
          </div>
          <div style={{ height: height }} className="bg-gray-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl"
    >
      {/* Professional Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400" />
            Saatlik Yoğunluk Isı Haritası
          </h3>
          <p className="text-sm text-gray-400 mt-1">Gerçek zamanlı yoğunluk analizi ve dağılım</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/30"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">CANLI</span>
          </motion.div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">
              {lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Ortalama Yoğunluk</span>
          </div>
          <div className="text-2xl font-bold text-white">{Math.round(avgIntensity)}%</div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl p-4 border border-red-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Sıcak Bölge</span>
          </div>
          <div className="text-2xl font-bold text-white">{hotspots.length}</div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Yoğun Saat</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {peakHour !== null ? `${peakHour}:00` : '--'}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Veri Noktası</span>
          </div>
          <div className="text-2xl font-bold text-white">{heatPoints.length}</div>
        </motion.div>
      </div>

      {/* Canvas with Professional Border */}
      <div className="relative bg-gradient-to-br from-gray-950 to-slate-900 rounded-xl overflow-hidden border border-gray-700 shadow-inner">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full"
        />
        
        {heatPoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Droplet className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Henüz ısı haritası verisi yok</p>
            </div>
          </div>
        )}
      </div>

      {/* Hotspots List */}
      {hotspots.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-3"
        >
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            En Yoğun Bölgeler
          </h4>
          <div className="grid grid-cols-5 gap-3">
            {hotspots.map((hotspot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 hover:border-orange-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    className={`w-3 h-3 rounded-full shadow-lg ${
                      index === 0 ? 'bg-red-500 shadow-red-500/50' : 
                      index === 1 ? 'bg-orange-500 shadow-orange-500/50' : 
                      'bg-yellow-500 shadow-yellow-500/50'
                    }`}
                  ></motion.div>
                </div>
                <p className="text-xl font-bold text-white mb-1">
                  {Math.round(hotspot.avgIntensity)}%
                </p>
                <p className="text-xs text-gray-400 truncate" title={hotspot.zone}>
                  {hotspot.zone}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500">{hotspot.dataPoints} veri</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex items-center justify-center gap-8"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-green-600 rounded shadow-lg shadow-green-500/30"></div>
          <span className="text-xs text-gray-300 font-medium">0-30% Düşük</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded shadow-lg shadow-yellow-500/30"></div>
          <span className="text-xs text-gray-300 font-medium">30-50% Orta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-orange-600 rounded shadow-lg shadow-orange-500/30"></div>
          <span className="text-xs text-gray-300 font-medium">50-75% Yüksek</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-red-400 to-red-600 rounded shadow-lg shadow-red-500/30"></div>
          <span className="text-xs text-gray-300 font-medium">75-100% Kritik</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
