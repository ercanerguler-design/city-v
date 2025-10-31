import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// AI Object Detection API - YOLO v8 benzeri detection simülasyonu
// Gerçek production'da TensorFlow.js, YOLO API veya Python mikroservis kullanılacak

const DETECTABLE_OBJECTS = [
  'person', 'chair', 'table', 'laptop', 'phone', 
  'bottle', 'cup', 'book', 'bag', 'clock'
];

interface DetectedObject {
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    const cameraId = params.cameraId;
    const body = await request.json();
    const { frame_base64, timestamp } = body;

    // Kamera bilgilerini al
    const cameraResult = await query(
      'SELECT * FROM iot_devices WHERE device_id = $1',
      [cameraId]
    );

    if (cameraResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Camera not found' },
        { status: 404 }
      );
    }

    const camera = cameraResult.rows[0];

    // *** DEMO MODE: Gerçekçi detection simülasyonu ***
    // Production'da burada gerçek AI model çağrılacak
    const detectedObjects = generateMockDetections(camera);

    // Detection sonuçlarını veritabanına kaydet
    await query(
      `UPDATE iot_crowd_analysis 
       SET detected_objects = $1,
           confidence_score = $2,
           processing_time_ms = $3
       WHERE device_id = $4 
         AND timestamp = (SELECT MAX(timestamp) FROM iot_crowd_analysis WHERE device_id = $4)`,
      [
        JSON.stringify(detectedObjects),
        calculateAverageConfidence(detectedObjects),
        Math.floor(Math.random() * 50) + 20, // 20-70ms processing time
        cameraId
      ]
    );

    // İnsan sayısını güncelle (person detection'larından)
    const personCount = detectedObjects.filter(obj => obj.class === 'person').length;
    await query(
      `UPDATE iot_devices 
       SET current_occupancy = $1 
       WHERE device_id = $2`,
      [personCount, cameraId]
    );

    return NextResponse.json({
      success: true,
      camera_id: cameraId,
      timestamp: new Date().toISOString(),
      detections: {
        total: detectedObjects.length,
        objects: detectedObjects,
        person_count: personCount,
        processing_time_ms: Math.floor(Math.random() * 50) + 20
      }
    });
  } catch (error: any) {
    console.error('❌ Object detection error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    const cameraId = params.cameraId;

    // Son detection sonuçlarını al
    const result = await query(
      `SELECT 
        ica.detected_objects,
        ica.confidence_score,
        ica.processing_time_ms,
        ica.current_occupancy,
        ica.timestamp
       FROM iot_crowd_analysis ica
       WHERE ica.device_id = $1
       ORDER BY ica.timestamp DESC
       LIMIT 1`,
      [cameraId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        detections: {
          total: 0,
          objects: [],
          person_count: 0
        }
      });
    }

    const data = result.rows[0];
    const objects = data.detected_objects || [];
    const personCount = objects.filter((obj: any) => obj.class === 'person').length;

    return NextResponse.json({
      success: true,
      camera_id: cameraId,
      timestamp: data.timestamp,
      detections: {
        total: objects.length,
        objects: objects,
        person_count: personCount,
        confidence_score: data.confidence_score,
        processing_time_ms: data.processing_time_ms
      }
    });
  } catch (error: any) {
    console.error('❌ Get detections error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// *** HELPER FUNCTIONS ***

function generateMockDetections(camera: any): DetectedObject[] {
  // Kamera konumuna göre gerçekçi detection üret
  const location = camera.location_name?.toLowerCase() || '';
  const objects: DetectedObject[] = [];

  // Kişi detection'ları (current_occupancy'den)
  const personCount = camera.current_occupancy || Math.floor(Math.random() * 15);
  for (let i = 0; i < personCount; i++) {
    objects.push({
      class: 'person',
      confidence: 0.85 + Math.random() * 0.14, // 0.85-0.99
      bbox: {
        x: Math.random() * 1600,
        y: Math.random() * 900,
        width: 80 + Math.random() * 60,
        height: 150 + Math.random() * 100
      }
    });
  }

  // Lokasyon bazlı objeler
  if (location.includes('giriş') || location.includes('giris')) {
    // Giriş: Çanta, telefon, saat
    addRandomObjects(objects, ['bag', 'phone', 'clock'], 2, 4);
  } else if (location.includes('kasa') || location.includes('checkout')) {
    // Kasa: Telefon, çanta, şişe
    addRandomObjects(objects, ['phone', 'bag', 'bottle'], 3, 6);
  } else if (location.includes('salon') || location.includes('hall')) {
    // Salon: Masa, sandalye, laptop
    addRandomObjects(objects, ['table', 'chair', 'laptop', 'book'], 5, 10);
  } else if (location.includes('cafe') || location.includes('restoran')) {
    // Cafe/Restoran: Fincan, şişe, masa, sandalye
    addRandomObjects(objects, ['cup', 'bottle', 'table', 'chair'], 8, 15);
  } else {
    // Genel: Mix
    addRandomObjects(objects, DETECTABLE_OBJECTS.filter(o => o !== 'person'), 3, 8);
  }

  return objects;
}

function addRandomObjects(
  objects: DetectedObject[],
  classes: string[],
  min: number,
  max: number
) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  
  for (let i = 0; i < count; i++) {
    const objClass = classes[Math.floor(Math.random() * classes.length)];
    objects.push({
      class: objClass,
      confidence: 0.70 + Math.random() * 0.25, // 0.70-0.95
      bbox: {
        x: Math.random() * 1600,
        y: Math.random() * 900,
        width: 50 + Math.random() * 100,
        height: 50 + Math.random() * 100
      }
    });
  }
}

function calculateAverageConfidence(objects: DetectedObject[]): number {
  if (objects.length === 0) return 0;
  const sum = objects.reduce((acc, obj) => acc + obj.confidence, 0);
  return Math.round((sum / objects.length) * 100) / 100;
}
