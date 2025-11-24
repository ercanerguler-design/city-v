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
    console.log('🔍 Debugging JOIN queries...');

    // Debug: business_cameras sayısı
    const debugCameras = await query(
      `SELECT COUNT(*) as total FROM business_cameras WHERE business_user_id = $1`,
      [businessUserId]
    );
    console.log('  📹 Business cameras:', debugCameras.rows[0]?.total || 0);

    // Debug: iot_devices sayısı
    const debugDevices = await query(
      `SELECT COUNT(*) as total FROM iot_devices WHERE business_camera_id IN (SELECT id FROM business_cameras WHERE business_user_id = $1)`,
      [businessUserId]
    );
    console.log('  🔌 IoT devices:', debugDevices.rows[0]?.total || 0);

    // Debug: iot_crowd_analysis sayısı (son 10 dakika)
    const debugAnalysis = await query(
      `SELECT COUNT(*) as total, MAX(analysis_timestamp) as last_ts FROM iot_crowd_analysis WHERE analysis_timestamp >= NOW() - INTERVAL '10 minutes'`,
      []
    );
    console.log('  📊 Recent analysis:', debugAnalysis.rows[0]?.total || 0, 'Last:', debugAnalysis.rows[0]?.last_ts);

    // Son 5 dakikadaki real-time analytics (iot_crowd_analysis tablosundan)
    // ✅ FIX: iot_devices tablosu üzerinden doğru join yap + analysis_timestamp kullan
    // ✅ FIX: SADECE ONLINE KAMERALARIN VERİLERİNİ GETİR (last_seen < 5 dakika)
    const realtimeResult = await query(
      `SELECT 
        bc.id as camera_id,
        bc.camera_name,
        bc.last_seen as camera_last_seen,
        bc.is_active as camera_is_active,
        ica.people_count,
        ica.current_occupancy,
        ica.entry_count as entries_count,
        ica.exit_count as exits_count,
        ica.crowd_density,
        ica.crowd_density as density_level,
        ica.confidence_score,
        ica.analysis_timestamp as timestamp,
        CASE 
          WHEN bc.last_seen >= NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
       FROM business_cameras bc
       LEFT JOIN iot_devices id ON id.business_camera_id = bc.id
       LEFT JOIN iot_crowd_analysis ica ON CAST(ica.device_id AS INTEGER) = id.id
       WHERE bc.business_user_id = $1
         AND bc.is_active = true
         AND bc.last_seen >= NOW() - INTERVAL '5 minutes'
         AND ica.analysis_timestamp >= NOW() - INTERVAL '10 minutes'
       ORDER BY ica.analysis_timestamp DESC`,
      [businessUserId]
    );

    // Bugünkü toplam istatistikler (iot_crowd_analysis tablosundan)
    // ✅ FIX: iot_devices tablosu üzerinden doğru join yap + analysis_timestamp kullan
    // ✅ FIX: SADECE ONLINE KAMERALARIN BUGÜNKÜ VERİLERİNİ HESAPLA
    const dailyResult = await query(
      `SELECT 
        COUNT(DISTINCT bc.id) FILTER (WHERE ica.analysis_timestamp >= NOW() - INTERVAL '10 minutes' AND bc.last_seen >= NOW() - INTERVAL '5 minutes') as active_cameras,
        SUM(COALESCE(ica.people_count, 0)) as total_people,
        SUM(COALESCE(ica.entry_count, 0)) as total_entries,
        SUM(COALESCE(ica.exit_count, 0)) as total_exits,
        AVG(COALESCE(ica.current_occupancy, 0)) as avg_occupancy,
        MAX(COALESCE(ica.current_occupancy, 0)) as peak_occupancy,
        MAX(ica.analysis_timestamp) as last_update
       FROM business_cameras bc
       LEFT JOIN iot_devices id ON id.business_camera_id = bc.id
       LEFT JOIN iot_crowd_analysis ica ON CAST(ica.device_id AS INTEGER) = id.id
       WHERE bc.business_user_id = $1
         AND bc.is_active = true
         AND DATE(ica.analysis_timestamp) = CURRENT_DATE`,
      [businessUserId]
    );

    // Toplam kamera sayısı ve online/offline durumu
    const totalCamerasResult = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active_total,
        COUNT(*) FILTER (WHERE is_active = true AND last_seen >= NOW() - INTERVAL '5 minutes') as online_total,
        COUNT(*) FILTER (WHERE is_active = true AND last_seen < NOW() - INTERVAL '5 minutes') as offline_total
       FROM business_cameras 
       WHERE business_user_id = $1`,
      [businessUserId]
    );

    const dailyStats = dailyResult.rows[0];
    const cameraStats = totalCamerasResult.rows[0];
    
    const totalCameras = parseInt(cameraStats?.total || 0);
    const activeTotalCameras = parseInt(cameraStats?.active_total || 0);
    const onlineCameras = parseInt(cameraStats?.online_total || 0);
    const offlineCameras = parseInt(cameraStats?.offline_total || 0);
    
    const activeCameras = parseInt(dailyStats?.active_cameras || 0);
    const totalPeople = parseInt(dailyStats?.total_people || 0);
    const totalEntries = parseInt(dailyStats?.total_entries || 0);
    const totalExits = parseInt(dailyStats?.total_exits || 0);
    const avgOccupancy = parseFloat(dailyStats?.avg_occupancy || 0);
    const peakOccupancy = parseInt(dailyStats?.peak_occupancy || 0);
    const lastUpdate = dailyStats?.last_update;

    console.log('📊 Camera Status:', {
      total: totalCameras,
      active: activeTotalCameras,
      online: onlineCameras,
      offline: offlineCameras,
      withData: activeCameras
    });

    // Crowd level hesapla
    let crowdLevel = 'low';
    if (avgOccupancy > 15) crowdLevel = 'high';
    else if (avgOccupancy > 8) crowdLevel = 'medium';

    // Ortalama kalış süresi (basit hesaplama)
    const avgStayMinutes = avgOccupancy > 0 ? Math.round(avgOccupancy * 2.5) : 0;

    // Her kameradan son veri (SADECE ONLINE OLANLAR)
    const cameraMap = new Map();
    realtimeResult.rows.forEach(row => {
      // Sadece online kameraları ekle
      if (row.is_online && !cameraMap.has(row.camera_id)) {
        cameraMap.set(row.camera_id, {
          cameraId: row.camera_id,
          cameraName: row.camera_name,
          currentPeople: row.people_count,
          currentOccupancy: row.current_occupancy,
          densityLevel: row.density_level,
          lastUpdate: row.timestamp,
          cameraLastSeen: row.camera_last_seen,
          isOnline: row.is_online,
          zoneData: row.zone_data
        });
      }
    });

    const cameras = Array.from(cameraMap.values());

    const summary = {
      activeCameras, // Veri gönderen online kamera sayısı
      totalCameras, // Toplam kayıtlı kamera
      onlineCameras, // Son 5 dakikada görülen kamera
      offlineCameras, // Offline kamera sayısı
      totalPeople,
      totalEntries,
      totalExits,
      avgOccupancy: Math.round(avgOccupancy),
      peakOccupancy,
      crowdLevel,
      avgStayMinutes,
      lastUpdate,
      cameras // Sadece online kameraların verileri
    };

    console.log('✅ Analytics Summary:', {
      ...summary,
      cameraDetails: `${activeCameras} with data / ${onlineCameras} online / ${totalCameras} total`
    });

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

