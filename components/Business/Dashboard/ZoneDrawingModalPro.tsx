'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Save, Trash2, Plus, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Point {
  x: number;
  y: number;
}

interface Zone {
  name: string;
  type: string;
  points: Point[];
  color: string;
}

interface ZoneDrawingModalProps {
  camera: any;
  onClose: () => void;
  onSave: (zones: Zone[]) => void;
}

const ZONE_TYPES = [
  { value: 'checkout', label: 'Kasa', color: '#EF4444', icon: '💳' },
  { value: 'seating', label: 'Oturma Alanı', color: '#3B82F6', icon: '🪑' },
  { value: 'entrance', label: 'Giriş', color: '#10B981', icon: '🚪' },
  { value: 'storage', label: 'Depo', color: '#F59E0B', icon: '📦' },
  { value: 'kitchen', label: 'Mutfak', color: '#8B5CF6', icon: '🍳' },
  { value: 'bathroom', label: 'Tuvalet', color: '#06B6D4', icon: '🚻' }
];

export default function ZoneDrawingModalPro({ camera, onClose, onSave }: ZoneDrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [currentZone, setCurrentZone] = useState<Point[]>([]);
  const [selectedZoneType, setSelectedZoneType] = useState('seating');
  const [zoneName, setZoneName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;

  const streamUrl = camera.stream_url || `http://${camera.ip_address}:${camera.port}/stream`;

  useEffect(() => {
    // Mevcut bölgeleri yükle
    if (camera.zones && camera.zones.length > 0) {
      setZones(camera.zones);
    }

    loadCameraImage();
  }, [camera]);

  // Şu an çizilen zone'u render et
  const drawCurrentZone = (ctx: CanvasRenderingContext2D) => {
    if (currentZone.length === 0) return;

    const color = ZONE_TYPES.find(t => t.value === selectedZoneType)?.color || '#3B82F6';
    
    // Çizgiler (kesikli)
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(currentZone[0].x, currentZone[0].y);
    
    for (let i = 1; i < currentZone.length; i++) {
      ctx.lineTo(currentZone[i].x, currentZone[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Noktalar
    currentZone.forEach((point, index) => {
      if (index === 0) {
        // İlk nokta (yeşil)
        ctx.fillStyle = '#10B981';
      } else if (index === currentZone.length - 1) {
        // Son nokta (turuncu)
        ctx.fillStyle = '#F59E0B';
      } else {
        ctx.fillStyle = color;
      }
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Polygon'u tamamlamak için son noktadan ilk noktaya kesikli çizgi
    if (currentZone.length >= 2) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(currentZone[currentZone.length - 1].x, currentZone[currentZone.length - 1].y);
      ctx.lineTo(currentZone[0].x, currentZone[0].y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const loadCameraImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // MJPEG stream için img element kullan
    const img = new Image();
    img.style.display = 'none';
    img.src = streamUrl;
    document.body.appendChild(img);
    
    let animationFrameId: number;
    let frameCount = 0;

    const drawFrame = () => {
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Mevcut bölgeleri overlay olarak çiz
        if (zones.length > 0) {
          zones.forEach((zone: Zone) => drawZone(ctx, zone, false));
        }
        
        // Çizilmekte olan polygon'u çiz
        if (isDrawing && currentZone.length > 0) {
          drawCurrentZone(ctx);
        }
        
        if (frameCount === 0) {
          console.log('✅ Zone çizim stream başladı');
          setImageLoaded(true);
        }
        frameCount++;
      }
      
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    img.onload = () => {
      console.log('✅ Zone stream bağlantısı kuruldu');
      drawFrame();
    };

    img.onerror = () => {
      console.error('❌ Kamera stream yüklenemedi:', streamUrl);
      toast.error('Kamera stream bağlantısı kurulamadı');
      setImageLoaded(true);
      
      // Fallback
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🚫 Kamera Bağlantısı Yok', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    };

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (img.parentNode) {
        document.body.removeChild(img);
      }
    };
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = streamUrl + '?t=' + Date.now();

    img.onload = () => {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Tüm kaydedilmiş bölgeleri çiz
      zones.forEach(zone => drawZone(ctx, zone, false));

      // Şu an çizilen bölgeyi çiz
      if (currentZone.length > 0) {
        const color = ZONE_TYPES.find(t => t.value === selectedZoneType)?.color || '#3B82F6';
        drawZone(ctx, {
          name: zoneName || 'Yeni Bölge',
          type: selectedZoneType,
          points: currentZone,
          color
        }, true);
      }
    };
  };

  const drawZone = (ctx: CanvasRenderingContext2D, zone: Zone, isActive: boolean) => {
    if (zone.points.length < 2) return;

    // Bölge dolgusu
    ctx.fillStyle = zone.color + (isActive ? '40' : '30');
    ctx.strokeStyle = zone.color;
    ctx.lineWidth = isActive ? 4 : 3;
    ctx.setLineDash(isActive ? [10, 5] : []);

    ctx.beginPath();
    ctx.moveTo(zone.points[0].x, zone.points[0].y);
    
    for (let i = 1; i < zone.points.length; i++) {
      ctx.lineTo(zone.points[i].x, zone.points[i].y);
    }
    
    if (zone.points.length >= 3) {
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.stroke();
    ctx.setLineDash([]);

    // Noktaları çiz
    zone.points.forEach((point, index) => {
      ctx.fillStyle = zone.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, isActive ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // İlk ve son noktayı vurgula
      if (index === 0) {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (index === zone.points.length - 1 && zone.points.length >= 3) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Bölge ismi
    if (zone.points.length >= 3) {
      const centerX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
      const centerY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;

      const icon = ZONE_TYPES.find(t => t.value === zone.type)?.icon || '📍';
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(centerX - 70, centerY - 20, 140, 40);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${icon} ${zone.name}`, centerX, centerY);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates from either mouse or touch event
    let clientX: number, clientY: number;
    if ('touches' in e) {
      e.preventDefault();
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    const newPoint: Point = { x, y };
    const newZone = [...currentZone, newPoint];
    setCurrentZone(newZone);
    setIsDrawing(true);

    if (newZone.length === 1) {
      toast.success('✅ İlk nokta işaretlendi (yeşil)', { duration: 1500 });
    } else if (newZone.length === 3) {
      toast.success('✅ Polygon oluşturuldu! Daha fazla nokta ekleyebilir veya tamamlayabilirsiniz');
    }

    redrawCanvas();
  };

  const handleFinishZone = () => {
    if (currentZone.length < 3) {
      toast.error('En az 3 nokta işaretlemelisiniz');
      return;
    }

    if (!zoneName.trim()) {
      toast.error('Lütfen bölge adı girin');
      return;
    }

    const color = ZONE_TYPES.find(t => t.value === selectedZoneType)?.color || '#3B82F6';
    
    const newZone: Zone = {
      name: zoneName.trim(),
      type: selectedZoneType,
      points: currentZone,
      color
    };

    setZones([...zones, newZone]);
    setCurrentZone([]);
    setZoneName('');
    setIsDrawing(false);
    
    toast.success(`✅ "${newZone.name}" bölgesi oluşturuldu!`);
    redrawCanvas();
  };

  const handleCancelZone = () => {
    setCurrentZone([]);
    setIsDrawing(false);
    toast('Bölge çizimi iptal edildi');
    redrawCanvas();
  };

  const handleDeleteZone = (index: number) => {
    const deletedZone = zones[index];
    const newZones = zones.filter((_, i) => i !== index);
    setZones(newZones);
    toast.success(`"${deletedZone.name}" silindi`);
    
    setTimeout(() => redrawCanvas(), 100);
  };

  const handleSave = async () => {
    if (zones.length === 0) {
      toast.error('En az bir bölge oluşturun');
      return;
    }

    if (isDrawing) {
      toast.error('Önce mevcut bölgeyi tamamlayın veya iptal edin');
      return;
    }

    setLoading(true);

    try {
      await onSave(zones);
      toast.success(`✅ ${zones.length} bölge kaydedildi!`);
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      toast.error('Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex"
        >
          {/* Sol Panel - Canvas */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  📐 Bölge Çizim Sistemi
                </h2>
                <p className="text-purple-100 mt-1">{camera.camera_name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* İnfo */}
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-900">
                <p className="font-semibold">Nasıl Çizilir?</p>
                <p>Canvas üzerine tıklayarak nokta ekleyin. En az 3 nokta gerekli. Polygon oluşturmak için noktaları sırayla işaretleyin.</p>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onTouchEnd={handleCanvasClick}
                  className="border-2 sm:border-4 border-gray-200 rounded-lg cursor-crosshair touch-none w-full h-auto"
                  style={{ maxHeight: '60vh', touchAction: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Sağ Panel - Kontroller */}
          <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Bölge Türü */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bölge Türü
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ZONE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedZoneType(type.value)}
                      disabled={isDrawing && currentZone.length > 0}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center gap-2 ${
                        selectedZoneType === type.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                      } disabled:opacity-50`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bölge Adı */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bölge Adı
                </label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Örn: Masa 1, Kasa 2"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={!isDrawing}
                />
              </div>

              {/* Aktif Çizim Bilgisi */}
              {isDrawing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Çizim Devam Ediyor
                  </p>
                  <p className="text-sm text-blue-700 mb-3">
                    {currentZone.length} nokta işaretlendi
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFinishZone}
                      disabled={currentZone.length < 3}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Tamamla
                    </button>
                    <button
                      onClick={handleCancelZone}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}

              {/* Mevcut Bölgeler */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Oluşturulan Bölgeler ({zones.length})
                </h3>
                <div className="space-y-2">
                  {zones.map((zone, index) => {
                    const typeInfo = ZONE_TYPES.find(t => t.value === zone.type);
                    return (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{typeInfo?.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{zone.name}</p>
                            <p className="text-xs text-gray-500">{zone.points.length} nokta</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteZone(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 bg-white border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={zones.length === 0 || isDrawing || loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Kaydediliyor...' : `${zones.length} Bölgeyi Kaydet`}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
