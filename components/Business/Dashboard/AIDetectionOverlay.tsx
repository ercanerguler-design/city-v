'use client';

import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

interface Detection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

interface AIDetectionOverlayProps {
  streamUrl: string;
  enablePersonDetection: boolean;
  enableObjectDetection: boolean;
  onDetectionUpdate?: (detections: Detection[]) => void;
}

export default function AIDetectionOverlay({
  streamUrl,
  enablePersonDetection,
  enableObjectDetection,
  onDetectionUpdate
}: AIDetectionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(0);

  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;

  // TensorFlow.js ve COCO-SSD modelini yükle
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('🧠 AI Model yükleniyor...');
        await tf.ready();
        const loadedModel = await cocoSsd.load({
          base: 'mobilenet_v2' // Daha hızlı inference için
        });
        setModel(loadedModel);
        setIsLoading(false);
        console.log('✅ AI Model yüklendi');
      } catch (error) {
        console.error('❌ AI Model yüklenemedi:', error);
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  // Stream'i çiz ve detection yap
  useEffect(() => {
    if (!model || isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // MJPEG stream
    const img = new Image();
    img.style.display = 'none';
    img.src = streamUrl;
    document.body.appendChild(img);

    let animationFrameId: number;
    let lastFrameTime = Date.now();
    let frameCount = 0;

    const detectAndDraw = async () => {
      if (img.complete && img.naturalWidth > 0) {
        // Stream frame'i çiz
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        try {
          // AI Detection (her 5 frame'de bir - performans için)
          if (frameCount % 5 === 0) {
            const predictions = await model.detect(canvas);
            
            // Filtreleme
            const filteredDetections: Detection[] = predictions
              .filter(pred => {
                if (enablePersonDetection && pred.class === 'person') {
                  return pred.score > 0.6; // Kişi için %60 eşik
                }
                if (enableObjectDetection && pred.class !== 'person') {
                  return pred.score > 0.5; // Diğer objeler için %50 eşik
                }
                return false;
              })
              .map(pred => ({
                bbox: pred.bbox as [number, number, number, number],
                class: pred.class,
                score: pred.score
              }));

            setDetections(filteredDetections);
            if (onDetectionUpdate) {
              onDetectionUpdate(filteredDetections);
            }
          }

          // Detectionları çiz
          detections.forEach(detection => {
            drawDetection(ctx, detection);
          });

          // FPS hesapla
          const now = Date.now();
          if (now - lastFrameTime > 1000) {
            setFps(frameCount);
            frameCount = 0;
            lastFrameTime = now;
          }
          frameCount++;

        } catch (error) {
          console.error('Detection hatası:', error);
        }
      }

      animationFrameId = requestAnimationFrame(detectAndDraw);
    };

    img.onload = () => {
      console.log('✅ AI Detection stream başladı');
      detectAndDraw();
    };

    img.onerror = () => {
      console.error('❌ Stream bağlantısı kurulamadı');
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
  }, [model, isLoading, streamUrl, enablePersonDetection, enableObjectDetection, detections]);

  // Detection'ı çiz (bounding box + label)
  const drawDetection = (ctx: CanvasRenderingContext2D, detection: Detection) => {
    const [x, y, width, height] = detection.bbox;
    
    // Renk seçimi
    const isPerson = detection.class === 'person';
    const boxColor = isPerson ? '#10B981' : '#3B82F6'; // Yeşil: kişi, Mavi: nesne
    const textColor = '#ffffff';

    // Bounding box (kalın)
    ctx.strokeStyle = boxColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    // Semi-transparent fill (sadece kişiler için)
    if (isPerson) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(x, y, width, height);
    }

    // Label background
    const label = `${getLabel(detection.class)} ${(detection.score * 100).toFixed(0)}%`;
    ctx.font = 'bold 16px Arial';
    const textWidth = ctx.measureText(label).width;
    const textHeight = 24;

    ctx.fillStyle = boxColor;
    ctx.fillRect(x, y - textHeight - 4, textWidth + 16, textHeight + 4);

    // Label text
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + 8, y - textHeight);

    // Confidence circle (sağ üst köşe)
    const circleX = x + width - 20;
    const circleY = y + 20;
    const confidence = detection.score;
    
    ctx.fillStyle = getConfidenceColor(confidence);
    ctx.beginPath();
    ctx.arc(circleX, circleY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Türkçe label
  const getLabel = (className: string): string => {
    const labels: { [key: string]: string } = {
      'person': '👤 Kişi',
      'chair': '🪑 Sandalye',
      'dining table': '🍽️ Masa',
      'bottle': '🍾 Şişe',
      'cup': '☕ Fincan',
      'bowl': '🥣 Kase',
      'laptop': '💻 Laptop',
      'cell phone': '📱 Telefon',
      'book': '📚 Kitap',
      'clock': '🕐 Saat',
      'vase': '🏺 Vazo',
      'backpack': '🎒 Çanta',
      'handbag': '👜 El Çantası',
      'tv': '📺 TV',
      'refrigerator': '🧊 Buzdolabı',
      'oven': '🍳 Fırın',
      'microwave': '📟 Mikrodalga',
      'sink': '🚰 Lavabo',
      'potted plant': '🪴 Saksı',
      'couch': '🛋️ Kanepe',
      'bed': '🛏️ Yatak'
    };
    return labels[className] || `📦 ${className}`;
  };

  // Confidence rengini hesapla
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return '#10B981'; // Yeşil - çok yüksek
    if (confidence >= 0.7) return '#3B82F6'; // Mavi - yüksek
    if (confidence >= 0.5) return '#F59E0B'; // Turuncu - orta
    return '#EF4444'; // Kırmızı - düşük
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white font-semibold">🧠 AI Model Yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      {!isLoading && (
        <div className="absolute top-4 right-4 bg-black/75 rounded-lg px-4 py-2 text-white">
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-green-400">⚡ FPS:</span>
              <span className="font-bold">{fps}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">🎯 Tespit:</span>
              <span className="font-bold">{detections.length}</span>
            </div>
            {enablePersonDetection && (
              <div className="flex items-center gap-2">
                <span className="text-green-400">👤 Kişi:</span>
                <span className="font-bold">
                  {detections.filter(d => d.class === 'person').length}
                </span>
              </div>
            )}
            {enableObjectDetection && (
              <div className="flex items-center gap-2">
                <span className="text-purple-400">📦 Nesne:</span>
                <span className="font-bold">
                  {detections.filter(d => d.class !== 'person').length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
