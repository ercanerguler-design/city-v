import { useEffect, useRef, useState, useCallback } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

/**
 * 🤖 TensorFlow.js COCO-SSD Object Detection Hook
 * 
 * City-V IoT stream'den gerçek zamanlı nesne tespiti yapar
 * Browser'da çalışır, backend'e ihtiyaç yok!
 * 
 * @author City-V Team
 * @version 1.0.0
 */

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface DetectionResult {
  objects: DetectedObject[];
  personCount: number;
  tableCount: number;
  chairCount: number;
  timestamp: number;
}

export function useTensorFlowDetection() {
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Model yükleme
  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        console.log('🤖 [TensorFlow] COCO-SSD modeli yükleniyor...');
        const model = await cocoSsd.load({
          base: 'mobilenet_v2' // Hızlı ve hafif (ESP32 stream için ideal)
        });
        
        if (mounted) {
          modelRef.current = model;
          setIsModelLoaded(true);
          console.log('✅ [TensorFlow] Model başarıyla yüklendi!');
        }
      } catch (err) {
        if (mounted) {
          const errorMsg = err instanceof Error ? err.message : 'Model yüklenemedi';
          setError(errorMsg);
          console.error('❌ [TensorFlow] Model yükleme hatası:', errorMsg);
        }
      }
    }

    loadModel();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Görüntüden nesne tespiti yap
   * 
   * @param imageElement - HTMLImageElement, HTMLCanvasElement veya HTMLVideoElement
   * @returns DetectionResult
   */
  const detect = useCallback(async (
    imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ): Promise<DetectionResult | null> => {
    if (!modelRef.current) {
      console.warn('⚠️ [TensorFlow] Model henüz yüklenmedi');
      return null;
    }

    if (isDetecting) {
      console.warn('⚠️ [TensorFlow] Tespit zaten devam ediyor, atlanıyor');
      return null;
    }

    try {
      setIsDetecting(true);
      
      // TensorFlow.js ile nesne tespiti
      const predictions = await modelRef.current.detect(imageElement);

      // Sonuçları işle
      const objects: DetectedObject[] = predictions.map(pred => ({
        class: pred.class,
        score: pred.score,
        bbox: pred.bbox
      }));

      // Kategori bazlı sayım
      let personCount = 0;
      let tableCount = 0;
      let chairCount = 0;

      objects.forEach(obj => {
        if (obj.class === 'person') personCount++;
        // COCO-SSD'de 'dining table' var ama 'table' yok
        if (obj.class === 'dining table') tableCount++;
        if (obj.class === 'chair') chairCount++;
      });

      const result: DetectionResult = {
        objects,
        personCount,
        tableCount,
        chairCount,
        timestamp: Date.now()
      };

      console.log(`🎯 [TensorFlow] ${objects.length} nesne tespit edildi: ${personCount} kişi, ${tableCount} masa, ${chairCount} sandalye`);

      return result;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Tespit hatası';
      console.error('❌ [TensorFlow] Tespit hatası:', errorMsg);
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, [isDetecting]);

  /**
   * Canvas'a tespit sonuçlarını çiz (GİRİŞ ÇİZGİSİ DAHİL)
   */
  const drawDetections = useCallback((
    canvas: HTMLCanvasElement,
    detections: DetectedObject[],
    imageWidth: number,
    imageHeight: number
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas boyutlarını ayarla
    canvas.width = imageWidth;
    canvas.height = imageHeight;

    // Temizle
    ctx.clearRect(0, 0, imageWidth, imageHeight);

    // 🚪 SANAL GİRİŞ ÇİZGİSİ (Ortada yeşil çizgi)
    const ENTRY_LINE_Y = imageHeight / 2;
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 10]); // Kesikli çizgi
    ctx.beginPath();
    ctx.moveTo(0, ENTRY_LINE_Y);
    ctx.lineTo(imageWidth, ENTRY_LINE_Y);
    ctx.stroke();
    ctx.setLineDash([]); // Normal çizgiye dön

    // Çizgi etiketi
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.fillRect(10, ENTRY_LINE_Y - 30, 150, 25);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('🚪 GİRİŞ ÇİZGİSİ', 20, ENTRY_LINE_Y - 12);

    // Her tespit için çerçeve çiz
    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;

      // Renk seçimi (sınıfa göre)
      let color = 'rgba(255, 255, 255, 0.8)';
      if (detection.class === 'person') color = 'rgba(255, 0, 0, 0.8)'; // Kırmızı
      if (detection.class === 'dining table') color = 'rgba(0, 0, 255, 0.8)'; // Mavi
      if (detection.class === 'chair') color = 'rgba(255, 255, 0, 0.8)'; // Sarı

      // Çerçeve çiz (Daha kalın ve belirgin)
      ctx.strokeStyle = color;
      ctx.lineWidth = 4; // ✅ 3'ten 4'e çıkarıldı
      ctx.strokeRect(x, y, width, height);

      // ✅ Merkez noktası çiz (tracking için)
      if (detection.class === 'person') {
        const centerX = x + (width / 2);
        const centerY = y + (height / 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Label arka planı
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 30, width, 30);

      // Label text (Daha büyük font)
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial'; // ✅ 14px'den 16px'e çıkarıldı
      ctx.fillText(
        `${detection.class} ${(detection.score * 100).toFixed(0)}%`,
        x + 5,
        y - 8
      );
    });
  }, []);

  return {
    isModelLoaded,
    isDetecting,
    error,
    detect,
    drawDetections
  };
}
