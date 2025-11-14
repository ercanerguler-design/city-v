'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, RotateCcw, Info } from 'lucide-react';

interface CalibrationLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number; // Çizginin eğimi (derece)
}

interface CalibrationToolProps {
  videoRef: React.RefObject<HTMLVideoElement | HTMLImageElement | null>;
  cameraId: number;
  existingLine?: CalibrationLine;
  onSaveLine?: (line: CalibrationLine) => Promise<void>;
  onSave?: (line: CalibrationLine) => void;
  onClose: () => void;
}

export default function CalibrationTool({
  videoRef,
  cameraId,
  existingLine,
  onSaveLine,
  onSave,
  onClose
}: CalibrationToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [line, setLine] = useState<CalibrationLine | null>(existingLine || null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
        canvas.width = 640;
        canvas.height = 480;
      }
      drawCalibrationLine();
    }
  }, [line, startPoint, videoRef]);

  const drawCalibrationLine = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas'ı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mevcut çizgiyi çiz
    if (line) {
      // Ana çizgi
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();

      // Ok uçları (giriş/çıkış yönünü göster)
      drawArrow(ctx, line.x1, line.y1, line.x2, line.y2, '#FF0000');

      // Noktaları işaretle
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(line.x1, line.y1, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(line.x2, line.y2, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Açı bilgisini göster
      const midX = (line.x1 + line.x2) / 2;
      const midY = (line.y1 + line.y2) / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${line.angle.toFixed(1)}°`, midX + 10, midY - 10);

      // Giriş/Çıkış etiketleri
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('GİRİŞ ↓', line.x1 - 30, line.y1 - 15);
      
      ctx.fillStyle = '#FF4444';
      ctx.fillText('ÇIKIŞ ↑', line.x2 - 30, line.y2 - 15);
    }

    // Çizim sırasında geçici çizgi göster
    if (startPoint && !line) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#00FF00';
      ctx.fill();
    }
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) => {
    const headLength = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Ok başı
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const calculateAngle = (x1: number, y1: number, x2: number, y2: number): number => {
    const angleRad = Math.atan2(y2 - y1, x2 - x1);
    const angleDeg = (angleRad * 180) / Math.PI;
    // 0-360 arası normalize et
    return (angleDeg + 360) % 360;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvas.height) / rect.height;

    if (!startPoint) {
      // İlk nokta (giriş)
      setStartPoint({ x, y });
      setIsDrawing(true);
    } else {
      // İkinci nokta (çıkış) - çizgiyi tamamla
      const angle = calculateAngle(startPoint.x, startPoint.y, x, y);
      setLine({
        x1: startPoint.x,
        y1: startPoint.y,
        x2: x,
        y2: y,
        angle
      });
      setStartPoint(null);
      setIsDrawing(false);
    }
  };

  const handleReset = () => {
    setLine(null);
    setStartPoint(null);
    setIsDrawing(false);
  };

  const handleSave = async () => {
    if (!line) {
      alert('Lütfen önce kalibrasyon çizgisi çizin!');
      return;
    }

    try {
      if (onSaveLine) {
        await onSaveLine(line);
      } else if (onSave) {
        onSave(line);
      }
      onClose();
    } catch (error) {
      console.error('Kalibrasyon kaydetme hatası:', error);
      alert('Kalibrasyon çizgisi kaydedilemedi!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-white/20 max-w-5xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Giriş-Çıkış Kalibrasyon</h2>
            <p className="text-orange-100 mt-1">İnsan giriş-çıkış sayımı için çizgi çizin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Info */}
          <div className="mb-4 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">Nasıl çizilir?</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Birinci tıklama: Giriş noktası (insanların içeri girdiği taraf)</li>
                <li>İkinci tıklama: Çıkış noktası (insanların dışarı çıktığı taraf)</li>
                <li>Çizgi eğimli olabilir, kapı veya geçiş noktasını tam ortadan geçmeli</li>
                <li>Çizginin üzerinden geçen kişiler giriş/çıkış olarak sayılacak</li>
              </ul>
            </div>
          </div>

          {/* Canvas Drawing Area */}
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

          {/* Controls */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Sıfırla
            </button>

            <div className="flex-1" />

            {line && (
              <div className="px-4 py-2 bg-green-900/30 border border-green-500/50 rounded-lg text-green-300">
                <span className="font-semibold">Çizgi Açısı:</span> {line.angle.toFixed(1)}°
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!line}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Kalibrasyonu Kaydet
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
