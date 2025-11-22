import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 📊 Real-time Camera Analytics Saver
 * ESP32 kamera analiz verilerini database'e kaydeder
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cameraId,
      peopleCount,
      entriesCount,
      exitsCount,
      currentOccupancy,
      densityLevel,
      objectsDetected,
      tablesOccupied,
      tablesTotal
    } = body;

    console.log('💾 Saving camera analytics:', {
      cameraId,
      peopleCount,
      entriesCount,
      exitsCount,
      currentOccupancy,
      densityLevel
    });

    // 1. Kamera var mı kontrol et
    const cameraCheck = await query(
      `SELECT id FROM business_cameras WHERE id = $1`,
      [cameraId]
    );

    if (cameraCheck.rows.length === 0) {
      console.warn('⚠️ Camera not found:', cameraId);
      return NextResponse.json({
        success: false,
        error: 'Kamera bulunamadı'
      }, { status: 404 });
    }

    // 2. iot_ai_analysis tablosuna kaydet (mevcut tablo kullanılıyor)
    const result = await query(
      `INSERT INTO iot_ai_analysis (
        camera_id,
        person_count,
        crowd_density,
        detection_objects,
        created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, created_at`,
      [
        cameraId,
        peopleCount || 0,
        densityLevel ? (parseFloat(densityLevel) / 100.0) : 0,
        JSON.stringify({
          people_in: entriesCount || 0,
          people_out: exitsCount || 0,
          current_occupancy: currentOccupancy || 0,
          total_objects: objectsDetected || 0,
          tables_occupied: tablesOccupied || 0,
          tables_total: tablesTotal || 0,
          source: 'web_viewer'
        })
      ]
    );

    // 3. business_cameras tablosunu güncelle (last_checked sadece)
    await query(
      `UPDATE business_cameras
       SET last_checked = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [cameraId]
    );

    console.log('✅ Analytics saved successfully:', {
      cameraId,
      peopleCount,
      analyticsId: result.rows[0].id
    });

    return NextResponse.json({
      success: true,
      analyticsId: result.rows[0].id,
      timestamp: result.rows[0].timestamp,
      message: 'Analytics kaydedildi'
    });

  } catch (error: any) {
    console.error('❌ Analytics save error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Analytics kaydedilemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * 📈 Get Analytics History
 * GET /api/business/cameras/save-analytics?cameraId=40&hours=24
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cameraId = searchParams.get('cameraId');
    const businessUserId = searchParams.get('businessUserId');
    const hours = searchParams.get('hours') || '24';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Either cameraId or businessUserId required
    if (!cameraId && !businessUserId) {
      return NextResponse.json(
        { success: false, error: 'Camera ID veya Business User ID gerekli' },
        { status: 400 }
      );
    }

    let whereClause = '';
    let params: any[] = [];

    // Query for all cameras of a business user
    if (cameraId === 'all' && businessUserId) {
      whereClause = `WHERE camera_id IN (
        SELECT id FROM business_cameras WHERE business_user_id = $1
      )`;
      params = [businessUserId];
    } else if (cameraId) {
      whereClause = 'WHERE camera_id = $1';
      params = [cameraId];
    }

    // Tarih aralığı varsa kullan, yoksa son X saat
    if (startDate && endDate) {
      whereClause += ` AND timestamp BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(startDate, endDate);
    } else {
      whereClause += ` AND timestamp >= NOW() - INTERVAL '${hours} hours'`;
    }

    // iot_ai_analysis tablosundan veri çek
    let query_text = '';
    if (cameraId === 'all' && businessUserId) {
      query_text = `SELECT 
        ia.id,
        ia.created_at as timestamp,
        ia.person_count as people_count,
        COALESCE((ia.detection_objects->>'people_in')::INTEGER, 0) as entries_count,
        COALESCE((ia.detection_objects->>'people_out')::INTEGER, 0) as exits_count,
        COALESCE((ia.detection_objects->>'current_occupancy')::INTEGER, 0) as current_occupancy,
        ROUND((ia.crowd_density * 100)::numeric, 1) as density_level,
        ia.detection_objects as zone_data
       FROM iot_ai_analysis ia
       JOIN business_cameras bc ON ia.camera_id = bc.id
       WHERE bc.business_user_id = $1
       ORDER BY ia.created_at DESC
       LIMIT 100`;
    } else {
      query_text = `SELECT 
        ia.id,
        ia.created_at as timestamp,
        ia.person_count as people_count,
        COALESCE((ia.detection_objects->>'people_in')::INTEGER, 0) as entries_count,
        COALESCE((ia.detection_objects->>'people_out')::INTEGER, 0) as exits_count,
        COALESCE((ia.detection_objects->>'current_occupancy')::INTEGER, 0) as current_occupancy,
        ROUND((ia.crowd_density * 100)::numeric, 1) as density_level,
        ia.detection_objects as zone_data
       FROM iot_ai_analysis ia
       WHERE ia.camera_id = $1
       ORDER BY ia.created_at DESC
       LIMIT 100`;
    }

    // Tarih filtreleri
    if (startDate && endDate) {
      query_text += ` AND ica.timestamp BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(startDate, endDate);
    } else {
      query_text += ` AND ica.timestamp >= NOW() - INTERVAL '${hours} hours'`;
    }

    query_text += ` ORDER BY ica.timestamp DESC LIMIT 10000`;

    const result = await query(query_text, params);

    // İstatistikleri hesapla
    const stats = {
      totalRecords: result.rows.length,
      totalVisitors: result.rows.reduce((sum, row) => sum + (row.people_count || 0), 0),
      totalEntries: result.rows.reduce((sum, row) => sum + (row.entries_count || 0), 0),
      totalExits: result.rows.reduce((sum, row) => sum + (row.exits_count || 0), 0),
      avgOccupancy: result.rows.length > 0 
        ? Math.round(result.rows.reduce((sum, row) => sum + (row.current_occupancy || 0), 0) / result.rows.length)
        : 0,
      peakOccupancy: Math.max(...result.rows.map(row => row.current_occupancy || 0)),
      peakTime: result.rows.reduce((peak, row) => 
        (row.current_occupancy || 0) > (peak.current_occupancy || 0) ? row : peak
      , result.rows[0])?.timestamp
    };

    console.log('📊 Analytics retrieved:', stats);

    return NextResponse.json({
      success: true,
      analytics: result.rows,
      stats
    });

  } catch (error: any) {
    console.error('❌ Analytics fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Analytics getirilemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

