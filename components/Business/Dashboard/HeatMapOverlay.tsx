'use client';

import { useEffect, useRef, useState } from 'react';

interface HeatPoint {
  x: number;
  y: number;
  intensity: number; // 0-1 arası
  timestamp: number;
}

interface Zone {
  name: string;
  points: { x: number; y: number }[];
  color: string;
}

interface HeatMapOverlayProps {
  streamUrl: string;
  zones: Zone[];
  detections: any[]; // AI detection sonuçları
  decayRate?: number; // Isı azalma hızı (saniye)
}

export default function HeatMapOverlay({
  streamUrl,
  zones,
  detections,
  decayRate = 30 // 30 saniyede kaybolur
}: HeatMapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const [zoneOccupancy, setZoneOccupancy] = useState<{ [key: string]: number }>({});

  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;
  const HEAT_RADIUS = 40; // Isı noktası yarıçapı

  // Detectionları heat point'e dönüştür
  useEffect(() => {
    if (!detections || detections.length === 0) return;

    const now = Date.now();
    const newPoints: HeatPoint[] = detections
      .filter(d => d.class === 'person') // Sadece kişiler için ısı haritası
      .map(d => {
        const [x, y, width, height] = d.bbox;
        return {
          x: x + width / 2, // Merkez nokta
          y: y + height / 2,
          intensity: d.score, // Confidence = intensity
          timestamp: now
        };
      });

    // Eski noktaları güncelle (decay)
    const updatedPoints = heatPoints
      .map(point => {
        const age = (now - point.timestamp) / 1000; // saniye cinsinden
        const decayFactor = Math.max(0, 1 - age / decayRate);
        return {
          ...point,
          intensity: point.intensity * decayFactor
        };
      })
      .filter(point => point.intensity > 0.1); // Çok düşük olanları sil

    setHeatPoints([...updatedPoints, ...newPoints]);
  }, [detections]);

  // Zone occupancy hesapla
  useEffect(() => {
    if (!zones || zones.length === 0) return;

    const occupancy: { [key: string]: number } = {};

    zones.forEach(zone => {
      // Zone içindeki heat point'leri say
      const pointsInZone = heatPoints.filter(point =>
        isPointInPolygon(point, zone.points)
      );

      // Ortalama intensity
      const avgIntensity = pointsInZone.length > 0
        ? pointsInZone.reduce((sum, p) => sum + p.intensity, 0) / pointsInZone.length
        : 0;

      occupancy[zone.name] = avgIntensity;
    });

    setZoneOccupancy(occupancy);
  }, [heatPoints, zones]);

  // Point in polygon algoritması
  const isPointInPolygon = (
    point: { x: number; y: number },
    polygon: { x: number; y: number }[]
  ): boolean => {
    if (polygon.length < 3) return false;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Stream
    const img = new Image();
    img.style.display = 'none';
    img.src = streamUrl;
    document.body.appendChild(img);

    let animationFrameId: number;

    const drawFrame = () => {
      if (img.complete && img.naturalWidth > 0) {
        // Stream frame
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Heat map overlay
        drawHeatMap(ctx);

        // Zone overlays
        zones.forEach(zone => drawZoneOverlay(ctx, zone));
      }

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    img.onload = () => {
      console.log('✅ Heat map stream başladı');
      drawFrame();
    };

    img.onerror = () => {
      console.error('❌ Heat map stream hatası');
    };

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (img.parentNode) {
        document.body.removeChild(img);
      }
    };
  }, [streamUrl, heatPoints, zones, zoneOccupancy]);

  // Heat map çiz (radyal gradient)
  const drawHeatMap = (ctx: CanvasRenderingContext2D) => {
    heatPoints.forEach(point => {
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, HEAT_RADIUS
      );

      // Intensity'ye göre renk
      const alpha = point.intensity * 0.6; // Maksimum %60 opacity
      
      if (point.intensity > 0.8) {
        // Çok yoğun - Kırmızı
        gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(239, 68, 68, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (point.intensity > 0.5) {
        // Orta yoğun - Turuncu
        gradient.addColorStop(0, `rgba(245, 158, 11, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(245, 158, 11, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        // Az yoğun - Sarı-Yeşil
        gradient.addColorStop(0, `rgba(16, 185, 129, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(
        point.x - HEAT_RADIUS,
        point.y - HEAT_RADIUS,
        HEAT_RADIUS * 2,
        HEAT_RADIUS * 2
      );
    });
  };

  // Zone overlay (occupancy göstergesi)
  const drawZoneOverlay = (ctx: CanvasRenderingContext2D, zone: Zone) => {
    if (zone.points.length < 3) return;

    const occupancy = zoneOccupancy[zone.name] || 0;
    
    // Zone boundary (hafif)
    ctx.strokeStyle = zone.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(zone.points[0].x, zone.points[0].y);
    zone.points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // Occupancy dolgusu
    if (occupancy > 0) {
      const fillColor = getOccupancyColor(occupancy);
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(zone.points[0].x, zone.points[0].y);
      zone.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
    }

    // Zone label
    const centerX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
    const centerY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(centerX - 80, centerY - 30, 160, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(zone.name, centerX, centerY - 10);

    // Occupancy percentage
    const percentage = Math.round(occupancy * 100);
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = getOccupancyTextColor(occupancy);
    ctx.fillText(`${percentage}%`, centerX, centerY + 12);
  };

  // Occupancy rengi (gradient)
  const getOccupancyColor = (occupancy: number): string => {
    if (occupancy > 0.8) return 'rgba(239, 68, 68, 0.4)'; // Kırmızı - Çok yoğun
    if (occupancy > 0.6) return 'rgba(245, 158, 11, 0.4)'; // Turuncu - Yoğun
    if (occupancy > 0.4) return 'rgba(234, 179, 8, 0.4)'; // Sarı - Orta
    if (occupancy > 0.2) return 'rgba(16, 185, 129, 0.4)'; // Yeşil - Az
    return 'rgba(59, 130, 246, 0.3)'; // Mavi - Çok az
  };

  const getOccupancyTextColor = (occupancy: number): string => {
    if (occupancy > 0.8) return '#EF4444'; // Kırmızı
    if (occupancy > 0.6) return '#F59E0B'; // Turuncu
    if (occupancy > 0.4) return '#EAB308'; // Sarı
    if (occupancy > 0.2) return '#10B981'; // Yeşil
    return '#3B82F6'; // Mavi
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />

      {/* Heat map legend */}
      <div className="absolute bottom-4 left-4 bg-black/75 rounded-lg px-4 py-3 text-white">
        <h3 className="text-sm font-bold mb-2">🔥 Yoğunluk Haritası</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Çok Yoğun (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span>Yoğun (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>Orta (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Az (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>Çok Az (0-20%)</span>
          </div>
        </div>
      </div>

      {/* Active heat points count */}
      <div className="absolute top-4 left-4 bg-black/75 rounded-lg px-4 py-2 text-white">
        <div className="text-sm">
          <span className="text-orange-400">🔥 Aktif Nokta:</span>
          <span className="ml-2 font-bold">{heatPoints.length}</span>
        </div>
      </div>
    </div>
  );
}
