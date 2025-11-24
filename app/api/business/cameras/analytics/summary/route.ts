import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 📊 Camera Analytics Summary
 * Kullanıcının tüm kameralarından real-time özet
 * GET /api/business/cameras/analytics/summary?businessUserId=20
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUserId = searchParams.get('businessUserId');

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'Business User ID gerekli' },
        { status: 400 }
      );
    }

    console.log('📊 Camera Analytics Summary for user:', businessUserId);

    // Son 5 dakikadaki real-time analytics (iot_crowd_analysis tablosundan)
    // ✅ FIX: iot_devices tablosu üzerinden doğru join yap
    const realtimeResult = await query(
      `SELECT 
        bc.id as camera_id,
        bc.camera_name,
        ica.current_occupancy as people_count,
        ica.current_occupancy,
        ica.people_in as entries_count,
        ica.people_out as exits_count,
        ica.crowd_level as crowd_density,
        ica.analysis_metadata,
        ica.created_at as timestamp
       FROM business_cameras bc
       LEFT JOIN iot_devices id ON id.business_camera_id = bc.id
       LEFT JOIN iot_crowd_analysis ica ON ica.device_id = id.device_id
       WHERE bc.business_user_id = $1
         AND ica.created_at >= NOW() - INTERVAL '5 minutes'
       ORDER BY ica.created_at DESC`,
      [businessUserId]
    );

    // Bugünkü toplam istatistikler (iot_crowd_analysis tablosundan)
    // ✅ FIX: iot_devices tablosu üzerinden doğru join yap
    const dailyResult = await query(
      `SELECT 
        COUNT(DISTINCT bc.id) FILTER (WHERE ica.created_at >= NOW() - INTERVAL '5 minutes') as active_cameras,
        SUM(COALESCE(ica.current_occupancy, 0)) as total_people,
        SUM(COALESCE(ica.people_in, 0)) as total_entries,
        SUM(COALESCE(ica.people_out, 0)) as total_exits,
        AVG(COALESCE(ica.current_occupancy, 0)) as avg_occupancy,
        MAX(COALESCE(ica.current_occupancy, 0)) as peak_occupancy,
        MAX(ica.created_at) as last_update
       FROM business_cameras bc
       LEFT JOIN iot_devices id ON id.business_camera_id = bc.id
       LEFT JOIN iot_crowd_analysis ica ON ica.device_id = id.device_id
       WHERE bc.business_user_id = $1
         AND DATE(ica.created_at) = CURRENT_DATE`,
      [businessUserId]
    );

    // Toplam kamera sayısı
    const totalCamerasResult = await query(
      `SELECT COUNT(*) as total FROM business_cameras WHERE business_user_id = $1`,
      [businessUserId]
    );

    const dailyStats = dailyResult.rows[0];
    const totalCameras = parseInt(totalCamerasResult.rows[0]?.total || 0);
    const activeCameras = parseInt(dailyStats?.active_cameras || 0);
    const totalPeople = parseInt(dailyStats?.total_people || 0);
    const totalEntries = parseInt(dailyStats?.total_entries || 0);
    const totalExits = parseInt(dailyStats?.total_exits || 0);
    const avgOccupancy = parseFloat(dailyStats?.avg_occupancy || 0);
    const peakOccupancy = parseInt(dailyStats?.peak_occupancy || 0);
    const lastUpdate = dailyStats?.last_update;

    // Crowd level hesapla
    let crowdLevel = 'low';
    if (avgOccupancy > 15) crowdLevel = 'high';
    else if (avgOccupancy > 8) crowdLevel = 'medium';

    // Ortalama kalış süresi (basit hesaplama)
    const avgStayMinutes = avgOccupancy > 0 ? Math.round(avgOccupancy * 2.5) : 0;

    // Her kameradan son veri
    const cameraMap = new Map();
    realtimeResult.rows.forEach(row => {
      if (!cameraMap.has(row.camera_id)) {
        cameraMap.set(row.camera_id, {
          cameraId: row.camera_id,
          cameraName: row.camera_name,
          currentPeople: row.people_count,
          currentOccupancy: row.current_occupancy,
          densityLevel: row.density_level,
          lastUpdate: row.timestamp,
          zoneData: row.zone_data
        });
      }
    });

    const cameras = Array.from(cameraMap.values());

    const summary = {
      activeCameras,
      totalCameras,
      totalPeople,
      totalEntries,
      totalExits,
      avgOccupancy: Math.round(avgOccupancy),
      peakOccupancy,
      crowdLevel,
      avgStayMinutes,
      lastUpdate,
      cameras
    };

    console.log('✅ Analytics Summary:', summary);

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Analytics summary error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Analytics özeti alınamadı',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

