import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      businessId,
      cameraIp,
      currentPeople,
      entriesCount,
      exitsCount,
      densityLevel,
      heatmapData,
      zones,
      averageDwellTime
    } = await request.json();

    // Kamera ID'sini bul
    const cameraResult = await sql`
      SELECT id FROM business_cameras 
      WHERE camera_ip = ${cameraIp} AND business_id = ${businessId}
    `;

    if (cameraResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kamera bulunamadı' },
        { status: 404 }
      );
    }

    const cameraId = cameraResult.rows[0].id;

    // Device ID'yi al
    const deviceResult = await sql`
      SELECT device_id FROM iot_devices WHERE business_camera_id = ${cameraId} LIMIT 1
    `;

    if (deviceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'IoT device bulunamadı' },
        { status: 404 }
      );
    }

    const deviceId = deviceResult.rows[0].device_id;

    // iot_crowd_analysis tablosuna kaydet
    await sql`
      INSERT INTO iot_crowd_analysis (
        device_id, current_occupancy, people_in, people_out,
        confidence_score, crowd_level, analysis_metadata
      )
      VALUES (
        ${deviceId}, ${currentPeople}, ${entriesCount}, ${exitsCount},
        95.0, ${densityLevel}, 
        ${JSON.stringify({
          people_count: currentPeople,
          heatmap_data: heatmapData,
          zones: zones,
          avg_dwell_time: averageDwellTime,
          source: 'api'
        })}
      )
    `;

    // Kamera son görülme zamanını güncelle
    await sql`
      UPDATE business_cameras 
      SET last_seen = NOW()
      WHERE id = ${cameraId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Analytics kaydedildi'
    });

  } catch (error: any) {
    console.error('Analytics kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Analytics kaydedilemedi', details: error.message },
      { status: 500 }
    );
  }
}

// Analytics geçmişini getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraIp = searchParams.get('cameraIp');
    const hours = parseInt(searchParams.get('hours') || '24');

    if (!cameraIp) {
      return NextResponse.json(
        { error: 'Camera IP gerekli' },
        { status: 400 }
      );
    }

    // iot_crowd_analysis tablosundan veri çek
    const result = await sql`
      SELECT 
        ica.id,
        ica.timestamp,
        ica.current_occupancy as people_count,
        ica.people_in as entries_count,
        ica.people_out as exits_count,
        ica.current_occupancy,
        ica.crowd_level as density_level,
        ica.analysis_metadata
      FROM iot_crowd_analysis ica
      JOIN iot_devices id ON ica.device_id = id.device_id
      JOIN business_cameras bc ON id.business_camera_id = bc.id
      WHERE bc.camera_ip = ${cameraIp}
        AND ica.timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY ica.timestamp DESC
      LIMIT 1000
    `;

    return NextResponse.json({
      success: true,
      analytics: result.rows
    });

  } catch (error: any) {
    console.error('Analytics getirme hatası:', error);
    return NextResponse.json(
      { error: 'Analytics getirilemedi', details: error.message },
      { status: 500 }
    );
  }
}

