import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Giriş-Çıkış İnsan Sayımı - Line Crossing Detection
// Kalibrasyon çizgisini (calibration_line) kullanarak trajectory takibi

interface TrajectoryPoint {
  person_id: string;
  timestamp: number;
  position: { x: number; y: number };
}

// In-memory trajectory cache (Production'da Redis kullanılmalı)
const trajectories = new Map<string, TrajectoryPoint[]>();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ cameraId: string }> }
) {
  try {
    const params = await context.params;
    const cameraId = params.cameraId;
    const body = await request.json();
    const { detections } = body; // person detection'lar (bbox: {x, y, width, height})

    // Kamera ve kalibrasyon bilgilerini al
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
    const calibrationLine = camera.calibration_line;
    const entryDirection = camera.entry_direction || 'up_to_down';

    if (!calibrationLine || !calibrationLine.x1) {
      return NextResponse.json({
        success: false,
        error: 'Camera not calibrated. Please set calibration line first.'
      }, { status: 400 });
    }

    // Son crowd analysis verisini al
    const analysisResult = await query(
      `SELECT * FROM iot_crowd_analysis 
       WHERE device_id = $1 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [cameraId]
    );

    let currentEntry = analysisResult.rows[0]?.total_entries || 0;
    let currentExit = analysisResult.rows[0]?.total_exits || 0;
    let currentOccupancy = analysisResult.rows[0]?.current_occupancy || 0;

    // Person detection'ları işle
    const personDetections = detections.filter((d: any) => d.class === 'person');
    const crossings = processLineCrossings(
      cameraId,
      personDetections,
      calibrationLine,
      entryDirection
    );

    // Giriş/Çıkış sayılarını güncelle
    const newEntries = crossings.filter(c => c.type === 'entry').length;
    const newExits = crossings.filter(c => c.type === 'exit').length;

    currentEntry += newEntries;
    currentExit += newExits;
    currentOccupancy += (newEntries - newExits);

    // Negatif occupancy kontrolü
    if (currentOccupancy < 0) currentOccupancy = 0;

    // Veritabanını güncelle
    await query(
      `INSERT INTO iot_crowd_analysis (
        device_id, 
        business_id, 
        analysis_type,
        location_name,
        total_entries,
        total_exits,
        current_occupancy,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (device_id, timestamp) 
      DO UPDATE SET
        total_entries = $5,
        total_exits = $6,
        current_occupancy = $7`,
      [
        cameraId,
        camera.business_id,
        'line_crossing',
        camera.location_name,
        currentEntry,
        currentExit,
        currentOccupancy
      ]
    );

    // iot_devices tablosunu da güncelle
    await query(
      `UPDATE iot_devices 
       SET current_occupancy = $1 
       WHERE device_id = $2`,
      [currentOccupancy, cameraId]
    );

    return NextResponse.json({
      success: true,
      camera_id: cameraId,
      timestamp: new Date().toISOString(),
      counting: {
        new_entries: newEntries,
        new_exits: newExits,
        total_entries: currentEntry,
        total_exits: currentExit,
        current_occupancy: currentOccupancy,
        crossings: crossings.map(c => ({
          person_id: c.person_id,
          type: c.type,
          position: c.position,
          direction: c.direction
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ Line crossing error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cameraId: string }> }
) {
  try {
    const params = await context.params;
    const cameraId = params.cameraId;

    // Son sayım verilerini al
    const result = await query(
      `SELECT 
        ica.current_occupancy,
        ica.timestamp,
        bc.calibration_line,
        bc.entry_direction
       FROM iot_crowd_analysis ica
       JOIN business_cameras bc ON ica.device_id = bc.id::text
       WHERE bc.id = $1
       ORDER BY ica.timestamp DESC
       LIMIT 1`,
      [cameraId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        counting: {
          total_entries: 0,
          total_exits: 0,
          current_occupancy: 0,
          calibrated: false
        }
      });
    }

    const data = result.rows[0];
    const calibrated = !!(data.calibration_line && data.calibration_line.x1);

    return NextResponse.json({
      success: true,
      camera_id: cameraId,
      timestamp: data.timestamp,
      counting: {
        total_entries: data.total_entries || 0,
        total_exits: data.total_exits || 0,
        current_occupancy: data.current_occupancy || 0,
        max_capacity: data.max_capacity || null,
        occupancy_percent: data.max_capacity 
          ? Math.round((data.current_occupancy / data.max_capacity) * 100)
          : null,
        calibrated: calibrated,
        calibration_line: data.calibration_line,
        entry_direction: data.entry_direction
      }
    });
  } catch (error: any) {
    console.error('❌ Get counting error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// *** HELPER FUNCTIONS ***

function processLineCrossings(
  cameraId: string,
  personDetections: any[],
  calibrationLine: any,
  entryDirection: string
): any[] {
  const crossings: any[] = [];
  const now = Date.now();
  
  // Her person detection için trajectory güncellemesi
  personDetections.forEach((person, index) => {
    const personId = `${cameraId}-person-${index}`;
    const position = {
      x: person.bbox.x + person.bbox.width / 2,
      y: person.bbox.y + person.bbox.height
    };

    // Trajectory geçmişini al veya oluştur
    let trajectory = trajectories.get(personId) || [];
    trajectory.push({
      person_id: personId,
      timestamp: now,
      position: position
    });

    // Son 5 saniye tut
    trajectory = trajectory.filter(t => now - t.timestamp < 5000);
    trajectories.set(personId, trajectory);

    // Line crossing kontrolü (en az 2 point gerekli)
    if (trajectory.length >= 2) {
      const prev = trajectory[trajectory.length - 2];
      const curr = trajectory[trajectory.length - 1];

      const crossed = checkLineCrossing(
        prev.position,
        curr.position,
        calibrationLine
      );

      if (crossed) {
        const crossingType = determineCrossingType(
          prev.position,
          curr.position,
          calibrationLine,
          entryDirection
        );

        crossings.push({
          person_id: personId,
          type: crossingType,
          position: curr.position,
          direction: getMovementDirection(prev.position, curr.position),
          timestamp: now
        });

        // Trajectory'i temizle (aynı kişi tekrar sayılmasın)
        trajectories.delete(personId);
      }
    }
  });

  // Eski trajectory'leri temizle
  for (const [personId, trajectory] of trajectories.entries()) {
    if (now - trajectory[trajectory.length - 1].timestamp > 5000) {
      trajectories.delete(personId);
    }
  }

  return crossings;
}

function checkLineCrossing(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  line: { x1: number; y1: number; x2: number; y2: number }
): boolean {
  // Line segment intersection check
  const det = (x1: number, y1: number, x2: number, y2: number) => x1 * y2 - y1 * x2;
  
  const det1 = det(
    line.x2 - line.x1, 
    line.y2 - line.y1,
    p1.x - line.x1,
    p1.y - line.y1
  );
  
  const det2 = det(
    line.x2 - line.x1,
    line.y2 - line.y1,
    p2.x - line.x1,
    p2.y - line.y1
  );

  // Different signs means line crossed
  return (det1 > 0 && det2 < 0) || (det1 < 0 && det2 > 0);
}

function determineCrossingType(
  prev: { x: number; y: number },
  curr: { x: number; y: number },
  line: { x1: number; y1: number; x2: number; y2: number },
  entryDirection: string
): 'entry' | 'exit' {
  // Hareket yönünü hesapla
  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;

  // Entry direction'a göre giriş/çıkış belirle
  switch (entryDirection) {
    case 'up_to_down':
      return dy > 0 ? 'entry' : 'exit';
    case 'down_to_up':
      return dy < 0 ? 'entry' : 'exit';
    case 'left_to_right':
      return dx > 0 ? 'entry' : 'exit';
    case 'right_to_left':
      return dx < 0 ? 'entry' : 'exit';
    default:
      return dy > 0 ? 'entry' : 'exit';
  }
}

function getMovementDirection(
  prev: { x: number; y: number },
  curr: { x: number; y: number }
): string {
  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  if (angle >= -45 && angle < 45) return 'right';
  if (angle >= 45 && angle < 135) return 'down';
  if (angle >= -135 && angle < -45) return 'up';
  return 'left';
}
