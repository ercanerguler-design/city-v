import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Heatmap API - Zone occupancy visualization
// Her zone için doluluk hesaplama ve renk kodlama

export async function POST(
  request: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    const cameraId = params.cameraId;
    const body = await request.json();
    const { zones } = body;

    // Zones'ı kaydet (iot_devices tablosuna JSONB)
    await query(
      `UPDATE iot_devices 
       SET zones = $1 
       WHERE device_id = $2`,
      [JSON.stringify(zones), cameraId]
    );

    return NextResponse.json({
      success: true,
      camera_id: cameraId,
      zones_count: zones.length
    });
  } catch (error: any) {
    console.error('❌ Save zones error:', error);
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

    // Kamera bilgilerini ve zones'ları al
    const cameraResult = await query(
      'SELECT zones FROM iot_devices WHERE device_id = $1',
      [cameraId]
    );

    if (cameraResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Camera not found' },
        { status: 404 }
      );
    }

    const zones = cameraResult.rows[0].zones || [];

    // Son detection verilerini al (person locations)
    const detectionResult = await query(
      `SELECT detected_objects 
       FROM iot_crowd_analysis 
       WHERE device_id = $1 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [cameraId]
    );

    const detectedObjects = detectionResult.rows[0]?.detected_objects || [];
    const personLocations = detectedObjects
      .filter((obj: any) => obj.class === 'person')
      .map((obj: any) => ({
        x: obj.bbox.x + obj.bbox.width / 2,
        y: obj.bbox.y + obj.bbox.height
      }));

    // Her zone için doluluk hesapla
    const heatmapData = zones.map((zone: any) => {
      const peopleInZone = countPeopleInZone(zone.points, personLocations);
      const zoneArea = calculatePolygonArea(zone.points);
      const density = zoneArea > 0 ? (peopleInZone / (zoneArea / 10000)) : 0; // People per 100x100px

      return {
        zone_id: zone.id,
        zone_name: zone.name,
        people_count: peopleInZone,
        density: Math.round(density * 100) / 100,
        occupancy_level: getOccupancyLevel(density),
        color: getHeatmapColor(density)
      };
    });

    // Heatmap verisini veritabanına kaydet
    await query(
      `UPDATE iot_crowd_analysis 
       SET heatmap_data = $1 
       WHERE device_id = $2 
         AND timestamp = (SELECT MAX(timestamp) FROM iot_crowd_analysis WHERE device_id = $2)`,
      [JSON.stringify(heatmapData), cameraId]
    );

    return NextResponse.json({
      success: true,
      camera_id: cameraId,
      zones: zones,
      heatmap: heatmapData,
      total_people: personLocations.length
    });
  } catch (error: any) {
    console.error('❌ Get heatmap error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// *** HELPER FUNCTIONS ***

function countPeopleInZone(
  zonePoints: { x: number; y: number }[],
  personLocations: { x: number; y: number }[]
): number {
  return personLocations.filter(person => 
    isPointInPolygon(person, zonePoints)
  ).length;
}

function isPointInPolygon(
  point: { x: number; y: number },
  polygon: { x: number; y: number }[]
): boolean {
  // Ray casting algorithm
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y))
      && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }

  return inside;
}

function calculatePolygonArea(points: { x: number; y: number }[]): number {
  // Shoelace formula
  let area = 0;
  
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

function getOccupancyLevel(density: number): string {
  if (density < 0.5) return 'empty';
  if (density < 1.5) return 'low';
  if (density < 3.0) return 'medium';
  if (density < 5.0) return 'high';
  return 'overcrowded';
}

function getHeatmapColor(density: number): string {
  // Blue → Green → Yellow → Red gradient
  if (density < 0.5) return '#3B82F6'; // Blue (empty)
  if (density < 1.5) return '#10B981'; // Green (low)
  if (density < 3.0) return '#F59E0B'; // Yellow (medium)
  if (density < 5.0) return '#EF4444'; // Red (high)
  return '#991B1B'; // Dark red (overcrowded)
}
