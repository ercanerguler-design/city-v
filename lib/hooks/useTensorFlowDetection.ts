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
   * Canvas'a tespit sonuçlarını çiz
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

    // Her tespit için çerçeve çiz
    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;

      // Renk seçimi (sınıfa göre)
      let color = 'rgba(255, 255, 255, 0.8)';
      if (detection.class === 'person') color = 'rgba(255, 0, 0, 0.8)'; // Kırmızı
      if (detection.class === 'dining table') color = 'rgba(0, 0, 255, 0.8)'; // Mavi
      if (detection.class === 'chair') color = 'rgba(255, 255, 0, 0.8)'; // Sarı

      // Çerçeve çiz
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Label arka planı
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 25, width, 25);

      // Label text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(
        `${detection.class} ${(detection.score * 100).toFixed(0)}%`,
        x + 5,
        y - 7
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
