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

    // Analytics verisini kaydet
    await sql`
      INSERT INTO camera_analytics (
        camera_id, people_count, entries_count, exits_count,
        current_occupancy, density_level, heatmap_data, zone_data, average_dwell_time
      )
      VALUES (
        ${cameraId}, ${currentPeople}, ${entriesCount}, ${exitsCount},
        ${currentPeople}, ${densityLevel}, ${JSON.stringify(heatmapData)},
        ${JSON.stringify(zones)}, ${averageDwellTime}
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

    const result = await sql`
      SELECT ca.* 
      FROM camera_analytics ca
      JOIN business_cameras bc ON ca.camera_id = bc.id
      WHERE bc.camera_ip = ${cameraIp}
        AND ca.timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY ca.timestamp DESC
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
