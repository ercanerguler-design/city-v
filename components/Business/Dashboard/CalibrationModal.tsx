'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Save, RotateCcw, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface CalibrationModalProps {
  camera: any;
  onClose: () => void;
  onSave: () => void;
}

export default function CalibrationModal({ camera, onClose, onSave }: CalibrationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<'up_to_down' | 'down_to_up' | 'left_to_right' | 'right_to_left'>('up_to_down');
  const [saving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    loadCameraStream();
    loadExistingCalibration();
  }, [camera]);

  const loadCameraStream = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Stream URL oluştur
    const streamUrl = camera.stream_url || `http://${camera.ip_address}:${camera.port}/stream`;

    // Görüntü yükle
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 640;
      canvas.height = 480;
      ctx.drawImage(img, 0, 0, 640, 480);
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Hata durumunda placeholder
      canvas.width = 640;
      canvas.height = 480;
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kamera görüntüsü yüklenemedi', 320, 240);
      ctx.fillText('Yine de kalibrasyon yapabilirsiniz', 320, 270);
      setImageLoaded(true);
    };
    img.src = streamUrl;
  };

  const loadExistingCalibration = () => {
    if (camera.calibration_line) {
      const line = camera.calibration_line;
      setStartPoint({ x: line.x1, y: line.y1 });
      setEndPoint({ x: line.x2, y: line.y2 });
      setDirection(camera.entry_direction || 'up_to_down');
      drawLine({ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));

    setStartPoint({ x, y });
    setEndPoint(null);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));

    setEndPoint({ x, y });
    drawLine(startPoint, { x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const drawLine = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Görüntüyü yeniden çiz
    loadCameraStream();

    // Çizgiyi çiz
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Başlangıç noktası (yeşil)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(start.x, start.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bitiş noktası (kırmızı)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(end.x, end.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Yön oku
    drawArrow(ctx, start, end);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }) => {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 20;
    const arrowAngle = Math.PI / 6;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle - arrowAngle),
      end.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle + arrowAngle),
      end.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();
  };

  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    loadCameraStream();
  };

  const handleSave = async () => {
    if (!startPoint || !endPoint) {
      toast.error('Lütfen kalibrasyon çizgisini çizin');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('business_token');

      const response = await fetch('/api/business/cameras', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cameraId: camera.id,
          calibrationLine: {
            x1: startPoint.x,
            y1: startPoint.y,
            x2: endPoint.x,
            y2: endPoint.y
          },
          entryDirection: direction
        })
      });

      const data = await response.json();

      if (data.success) {
        onSave();
      } else {
        toast.error(data.error || 'Kaydedilemedi');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Kalibrasyon - {camera.camera_name}</h2>
            <p className="text-sm text-gray-500">Giriş-çıkış çizgisini belirleyin</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Nasıl çizilir?</p>
              <ul className="space-y-1 text-blue-700">
                <li>• <span className="text-green-600 font-semibold">Yeşil nokta</span>: Giriş tarafı (insanlar bu taraftan girecek)</li>
                <li>• <span className="text-red-600 font-semibold">Kırmızı nokta</span>: Çıkış tarafı (insanlar bu taraftan çıkacak)</li>
                <li>• Mavi çizgiyi kapı veya geçit üzerine çizin</li>
              </ul>
            </div>
          </div>

          {/* Canvas */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full cursor-crosshair"
              style={{ maxHeight: '60vh' }}
            />
          </div>

          {/* Direction Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Giriş Yönü
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'up_to_down', label: 'Yukarıdan Aşağı ↓' },
                { value: 'down_to_up', label: 'Aşağıdan Yukarı ↑' },
                { value: 'left_to_right', label: 'Soldan Sağa →' },
                { value: 'right_to_left', label: 'Sağdan Sola ←' }
              ].map((dir) => (
                <button
                  key={dir.value}
                  onClick={() => setDirection(dir.value as any)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    direction === dir.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Sıfırla
            </button>
            <div className="flex-1"></div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!startPoint || !endPoint || saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
