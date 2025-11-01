'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Save, RotateCcw, ZoomIn, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CalibrationLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface CalibrationModalProps {
  camera: any;
  onClose: () => void;
  onSave: (calibrationData: any) => void;
}

export default function CalibrationModalPro({ camera, onClose, onSave }: CalibrationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentLine, setCurrentLine] = useState<CalibrationLine | null>(null);
  const [entryDirection, setEntryDirection] = useState<string>('up_to_down');
  const [scale, setScale] = useState(1);
  
  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;
  
  const streamUrl = camera.stream_url || `http://${camera.ip_address}:${camera.port}/stream`;

  useEffect(() => {
    // Mevcut kalibrasyonu yükle
    if (camera.calibration_line) {
      setCurrentLine(camera.calibration_line);
      setEntryDirection(camera.entry_direction || 'up_to_down');
    }

    // Canvas'ı hazırla
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const img = new Image();
    // CORS hatası için crossOrigin kaldırıldı (local network için gerekli değil)
    // img.crossOrigin = 'anonymous';
    img.src = streamUrl + '?t=' + Date.now();
    
    img.onload = () => {
      console.log('✅ Kalibrasyon görüntüsü yüklendi');
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      setImageLoaded(true);
      
      // Mevcut çizimi göster
      if (camera.calibration_line) {
        drawCalibrationLine(ctx, camera.calibration_line, camera.entry_direction || 'up_to_down');
      }
    };

    img.onerror = (err) => {
      console.error('❌ Kamera görüntüsü yüklenemedi:', streamUrl);
      toast.error('Kamera görüntüsü yüklenemedi. Kamera bağlantısını kontrol edin.');
      setImageLoaded(true);
      
      // Fallback görsel
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Kamera Bağlantısı Yok', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    };
  }, [camera]);

  // Kalibrasyon çizgisini çiz (ok ile)
  const drawCalibrationLine = (
    ctx: CanvasRenderingContext2D,
    line: CalibrationLine,
    direction: string
  ) => {
    // Giriş noktası (yeşil)
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(line.x1, line.y1, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Çıkış noktası (kırmızı)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(line.x2, line.y2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Çizgi
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ok işareti
    const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
    const arrowLength = 30;
    const arrowAngle = Math.PI / 6;

    ctx.strokeStyle = '#3B82F6';
    ctx.fillStyle = '#3B82F6';
    ctx.lineWidth = 4;

    // Ok başı
    ctx.beginPath();
    ctx.moveTo(line.x2, line.y2);
    ctx.lineTo(
      line.x2 - arrowLength * Math.cos(angle - arrowAngle),
      line.y2 - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      line.x2 - arrowLength * Math.cos(angle + arrowAngle),
      line.y2 - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();

    // Yön etiketi
    const midX = (line.x1 + line.x2) / 2;
    const midY = (line.y1 + line.y2) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(midX - 60, midY - 20, 120, 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getDirectionLabel(direction), midX, midY);
  };

  const getDirectionLabel = (dir: string) => {
    const labels: { [key: string]: string } = {
      'up_to_down': '↓ Yukarıdan Aşağı',
      'down_to_up': '↑ Aşağıdan Yukarı',
      'left_to_right': '→ Soldan Sağa',
      'right_to_left': '← Sağdan Sola'
    };
    return labels[dir] || dir;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    if (!drawing) {
      // İlk nokta - Giriş
      setStartPoint({ x, y });
      setDrawing(true);
      toast.success('Giriş noktası işaretlendi (yeşil)', { duration: 1500 });
    } else {
      // İkinci nokta - Çıkış
      setEndPoint({ x, y });
      setDrawing(false);
      
      if (startPoint) {
        const newLine: CalibrationLine = {
          x1: startPoint.x,
          y1: startPoint.y,
          x2: x,
          y2: y
        };
        setCurrentLine(newLine);
        
        // Canvas'ı güncelle
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Görüntüyü yeniden yükle
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = streamUrl + '?t=' + Date.now();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            drawCalibrationLine(ctx, newLine, entryDirection);
          };
        }
        
        toast.success('✅ Çıkış noktası işaretlendi (kırmızı)');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !startPoint || !imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    // Görüntüyü yeniden çiz
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = streamUrl + '?t=' + Date.now();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Geçici çizgi
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Başlangıç noktası
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 10, 0, Math.PI * 2);
      ctx.fill();
    };
  };

  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setCurrentLine(null);
    setDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = streamUrl + '?t=' + Date.now();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    toast.info('Kalibrasyon sıfırlandı');
  };

  const handleSave = async () => {
    if (!currentLine) {
      toast.error('Önce kalibrasyon çizgisini çizin');
      return;
    }

    setLoading(true);

    try {
      await onSave({
        calibration_line: currentLine,
        entry_direction: entryDirection
      });
      
      toast.success('✅ Kalibrasyon kaydedildi!');
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
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                🎯 Kalibrasyon Sistemi
              </h2>
              <p className="text-blue-100 mt-1">{camera.camera_name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* İnfo Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Kalibrasyon Nasıl Yapılır?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>1. Adım:</strong> GİRİŞ noktasını işaretleyin (yeşil nokta)</li>
                <li><strong>2. Adım:</strong> ÇIKIŞ noktasını işaretleyin (kırmızı nokta)</li>
                <li><strong>3. Adım:</strong> Hareket yönünü seçin</li>
                <li><strong>4. Adım:</strong> Kaydet butonuna tıklayın</li>
              </ol>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-fit mx-auto">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                className="border-4 border-gray-200 rounded-lg cursor-crosshair max-w-full h-auto"
                style={{ maxHeight: '60vh' }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-100 p-6 border-t border-gray-200">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Yön Seçimi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Hareket Yönü Seçin:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'up_to_down', label: '↓ Yukarıdan Aşağı', icon: '⬇️' },
                    { value: 'down_to_up', label: '↑ Aşağıdan Yukarı', icon: '⬆️' },
                    { value: 'left_to_right', label: '→ Soldan Sağa', icon: '➡️' },
                    { value: 'right_to_left', label: '← Sağdan Sola', icon: '⬅️' }
                  ].map((dir) => (
                    <button
                      key={dir.value}
                      onClick={() => setEntryDirection(dir.value)}
                      className={`p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-center gap-2 justify-center ${
                        entryDirection === dir.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-2xl">{dir.icon}</span>
                      <span>{dir.label}</span>
                      {entryDirection === dir.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center gap-2 font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  Sıfırla
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!currentLine || loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Kaydediliyor...' : 'Kalibrasyonu Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
