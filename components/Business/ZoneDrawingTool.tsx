'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Plus, Trash2, Edit, Square, Circle } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  type: 'rectangle' | 'polygon';
  color: string;
  points: { x: number; y: number }[];
}

interface ZoneDrawingToolProps {
  videoRef: React.RefObject<HTMLVideoElement | HTMLImageElement | null>;
  cameraId: number;
  existingZones?: Zone[];
  onSaveZones?: (zones: Zone[]) => Promise<void>;
  onSave?: (zones: Zone[]) => void;
  onClose: () => void;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

export default function ZoneDrawingTool({
  videoRef,
  cameraId,
  existingZones = [],
  onSaveZones,
  onSave,
  onClose
}: ZoneDrawingToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zones, setZones] = useState<Zone[]>(existingZones);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [drawingMode, setDrawingMode] = useState<'rectangle' | 'polygon'>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const element = videoRef.current;

    if (canvas && element) {
      // Canvas boyutunu element ile eşitle
      if ('videoWidth' in element && element.videoWidth) {
        canvas.width = element.videoWidth;
        canvas.height = element.videoHeight;
      } else if ('naturalWidth' in element && element.naturalWidth) {
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
      } else {
        // Fallback boyutlar
        canvas.width = 640;
        canvas.height = 480;
      }
      drawZones();
    }
  }, [zones, currentZone, videoRef]);

  const drawZones = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas'ı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mevcut bölgeleri çiz
    zones.forEach(zone => {
      ctx.strokeStyle = zone.color;
      ctx.fillStyle = zone.color + '40'; // Alpha 0.25
      ctx.lineWidth = 3;

      if (zone.type === 'rectangle' && zone.points.length === 2) {
        const [start, end] = zone.points;
        const width = end.x - start.x;
        const height = end.y - start.y;
        
        ctx.fillRect(start.x, start.y, width, height);
        ctx.strokeRect(start.x, start.y, width, height);

        // Bölge adını yaz
        ctx.fillStyle = zone.color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(zone.name, start.x + 10, start.y + 25);
      } else if (zone.type === 'polygon' && zone.points.length > 2) {
        ctx.beginPath();
        ctx.moveTo(zone.points[0].x, zone.points[0].y);
        
        zone.points.forEach((point, index) => {
          if (index > 0) {
            ctx.lineTo(point.x, point.y);
          }
        });
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bölge adını yaz
        const centerX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
        const centerY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;
        ctx.fillStyle = zone.color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(zone.name, centerX - 30, centerY);
      }

      // Noktaları işaretle
      zone.points.forEach(point => {
        ctx.fillStyle = zone.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Çizilen bölgeyi göster (henüz kaydedilmemiş)
    if (currentZone && currentZone.points.length > 0) {
      ctx.strokeStyle = '#00FF00';
      ctx.fillStyle = '#00FF0040';
      ctx.lineWidth = 2;

      if (drawingMode === 'rectangle' && currentZone.points.length === 2) {
        const [start, end] = currentZone.points;
        const width = end.x - start.x;
        const height = end.y - start.y;
        
        ctx.fillRect(start.x, start.y, width, height);
        ctx.strokeRect(start.x, start.y, width, height);
      } else if (drawingMode === 'polygon') {
        ctx.beginPath();
        ctx.moveTo(currentZone.points[0].x, currentZone.points[0].y);
        
        currentZone.points.forEach((point, index) => {
          if (index > 0) {
            ctx.lineTo(point.x, point.y);
          }
        });
        
        ctx.stroke();
        
        // Noktaları göster
        currentZone.points.forEach(point => {
          ctx.fillStyle = '#00FF00';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvas.height) / rect.height;

    if (drawingMode === 'rectangle') {
      if (!isDrawing) {
        // İlk nokta
        setCurrentZone({
          id: Date.now().toString(),
          name: zoneName || 'Yeni Bölge',
          type: 'rectangle',
          color: COLORS[zones.length % COLORS.length],
          points: [{ x, y }]
        });
        setIsDrawing(true);
      } else {
        // İkinci nokta - rectangle tamamlandı
        if (currentZone) {
          setCurrentZone({
            ...currentZone,
            points: [...currentZone.points, { x, y }]
          });
        }
      }
    } else {
      // Polygon mode
      if (!currentZone) {
        setCurrentZone({
          id: Date.now().toString(),
          name: zoneName || 'Yeni Bölge',
          type: 'polygon',
          color: COLORS[zones.length % COLORS.length],
          points: [{ x, y }]
        });
        setIsDrawing(true);
      } else {
        // Yeni nokta ekle
        setCurrentZone({
          ...currentZone,
          points: [...currentZone.points, { x, y }]
        });
      }
    }
  };

  const finishPolygon = () => {
    if (currentZone && currentZone.points.length >= 3) {
      setZones([...zones, currentZone]);
      setCurrentZone(null);
      setIsDrawing(false);
      setZoneName('');
    }
  };

  const finishRectangle = () => {
    if (currentZone && currentZone.points.length === 2) {
      setZones([...zones, currentZone]);
      setCurrentZone(null);
      setIsDrawing(false);
      setZoneName('');
    }
  };

  const deleteZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId));
  };

  const handleSave = async () => {
    try {
      if (onSaveZones) {
        await onSaveZones(zones);
      } else if (onSave) {
        onSave(zones);
      }
      onClose();
    } catch (error) {
      console.error('Zone kaydetme hatası:', error);
      alert('Bölgeler kaydedilemedi!');
    }
  };

  useEffect(() => {
    // Rectangle mode - ikinci tıklamada otomatik tamamla
    if (drawingMode === 'rectangle' && currentZone && currentZone.points.length === 2) {
      finishRectangle();
    }
  }, [currentZone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Bölge Tanımlama</h2>
            <p className="text-blue-100 mt-1">Kamera görüntüsü üzerinde analiz bölgeleri çizin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Canvas Drawing Area */}
          <div className="col-span-2">
            <div className="relative bg-black rounded-lg overflow-hidden">
              {/* Background: Show video/image element */}
              {videoRef.current && (
                <div className="w-full">
                  {('videoWidth' in videoRef.current) ? (
                    <video
                      src={videoRef.current.src}
                      className="w-full"
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={videoRef.current.src}
                      alt="Camera view"
                      className="w-full"
                    />
                  )}
                </div>
              )}
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>

            {/* Drawing Controls */}
            <div className="mt-4 flex items-center gap-4">
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Bölge adı (ör: Kasa, Raf 1)"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
              
              <button
                onClick={() => setDrawingMode('rectangle')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  drawingMode === 'rectangle'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-300'
                }`}
              >
                <Square className="w-5 h-5" />
                Dikdörtgen
              </button>

              <button
                onClick={() => setDrawingMode('polygon')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  drawingMode === 'polygon'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-300'
                }`}
              >
                <Circle className="w-5 h-5" />
                Çokgen
              </button>

              {isDrawing && drawingMode === 'polygon' && (
                <button
                  onClick={finishPolygon}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Tamamla
                </button>
              )}
            </div>
          </div>

          {/* Zones List */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-white font-bold text-lg mb-4">Tanımlı Bölgeler</h3>
            
            {zones.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Henüz bölge tanımlanmadı
              </p>
            ) : (
              <div className="space-y-2">
                {zones.map(zone => (
                  <div
                    key={zone.id}
                    className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="text-white font-medium">{zone.name}</span>
                    </div>
                    <button
                      onClick={() => deleteZone(zone.id)}
                      className="p-1 hover:bg-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <Save className="w-5 h-5" />
              Bölgeleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
