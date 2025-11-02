'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplet } from 'lucide-react';

interface HeatmapVisualizerProps {
  businessId: string;
  width?: number;
  height?: number;
}

interface HeatPoint {
  x: number;
  y: number;
  intensity: number;
}

interface Hotspot {
  zone: string;
  avgIntensity: number;
  dataPoints: number;
}

export default function HeatmapVisualizer({ businessId, width = 800, height = 600 }: HeatmapVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgIntensity, setAvgIntensity] = useState(0);

  useEffect(() => {
    fetchHeatmapData();
    const interval = setInterval(fetchHeatmapData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [businessId]);

  useEffect(() => {
    if (heatPoints.length > 0) {
      drawHeatmap();
    }
  }, [heatPoints]);

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch(`/api/business/heatmap?businessId=${businessId}&timeRange=1hour`);
      const data = await response.json();

      if (data.success && data.heatmapPoints) {
        setHeatPoints(data.heatmapPoints);
        setHotspots(data.hotspots || []);
        setAvgIntensity(data.analytics?.avgIntensity || 0);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch heatmap:', error);
      setLoading(false);
    }
  };

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(55, 65, 81, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw heatmap points
    heatPoints.forEach(point => {
      const radius = 40; // Heat radius
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);

      // Color based on intensity (0-1)
      const intensity = Math.min(point.intensity, 1);
      
      if (intensity > 0.7) {
        gradient.addColorStop(0, `rgba(239, 68, 68, ${intensity})`); // Red
        gradient.addColorStop(0.5, `rgba(239, 68, 68, ${intensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (intensity > 0.4) {
        gradient.addColorStop(0, `rgba(251, 146, 60, ${intensity})`); // Orange
        gradient.addColorStop(0.5, `rgba(251, 146, 60, ${intensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(251, 146, 60, 0)');
      } else if (intensity > 0.2) {
        gradient.addColorStop(0, `rgba(234, 179, 8, ${intensity})`); // Yellow
        gradient.addColorStop(0.5, `rgba(234, 179, 8, ${intensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
      } else {
        gradient.addColorStop(0, `rgba(34, 197, 94, ${intensity})`); // Green
        gradient.addColorStop(0.5, `rgba(34, 197, 94, ${intensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    });

    // Draw hotspot markers
    hotspots.slice(0, 3).forEach((hotspot, index) => {
      const [zoneX, zoneY] = hotspot.zone.split('-').map(Number);
      const x = (zoneX * 100) + 50;
      const y = (zoneY * 100) + 50;

      // Marker circle
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Marker border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 12px Inter';
      ctx.fillText(`#${index + 1}`, x + 12, y + 4);
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div style={{ height }} className="bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Isı Haritası</h3>
          <p className="text-sm text-gray-400">Yoğunluk dağılımı</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Sıcak Bölgeler: {hotspots.length}</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
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
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-white">En Yoğun Bölgeler</h4>
          <div className="grid grid-cols-3 gap-3">
            {hotspots.slice(0, 3).map((hotspot, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <p className="text-lg font-bold text-white mb-1">
                  {hotspot.avgIntensity.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">Yoğunluk skoru</p>
                <p className="text-xs text-gray-500 mt-1">{hotspot.dataPoints} veri noktası</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-yellow-500 rounded"></div>
          <span className="text-xs text-gray-400">Düşük</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
          <span className="text-xs text-gray-400">Orta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
          <span className="text-xs text-gray-400">Yüksek</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-400">Ortalama Yoğunluk:</span>
        <span className="text-lg font-semibold text-white">{avgIntensity.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}
