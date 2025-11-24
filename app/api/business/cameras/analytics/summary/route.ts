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

    // Debug: iot_ai_analysis sayısı (son 10 dakika)
    const debugAnalysis = await query(
      `SELECT COUNT(*) as total, MAX(created_at) as last_ts 
       FROM iot_ai_analysis 
       WHERE camera_id IN (SELECT id FROM business_cameras WHERE business_user_id = $1)
         AND created_at >= NOW() - INTERVAL '10 minutes'`,
      [businessUserId]
    );
    console.log('  📊 Recent analysis:', debugAnalysis.rows[0]?.total || 0, 'Last:', debugAnalysis.rows[0]?.last_ts);

    // ✅ TAMAMEN YENİDEN YAZILMIŞ QUERY - HATA GİDERİLMİŞ
    // Son 10 dakikadaki real-time analytics (crowd_density string hatası çözüldü)
    const realtimeResult = await query(
      `SELECT 
        bc.id as camera_id,
        bc.camera_name,
        bc.last_seen as camera_last_seen,
        bc.is_active as camera_is_active,
        COALESCE(ica.person_count, 0) as people_count,
        COALESCE(bc.current_occupancy, 0) as current_occupancy,
        COALESCE(bc.total_entries, 0) as entries_count,
        COALESCE(bc.total_exits, 0) as exits_count,
        -- String to numeric conversion for crowd_density
        CASE 
          WHEN ica.crowd_density::text = 'high' THEN 15.0
          WHEN ica.crowd_density::text = 'medium' THEN 8.0
          WHEN ica.crowd_density::text = 'low' THEN 3.0
          ELSE 0.0
        END as crowd_density_numeric,
        ica.crowd_density as density_level_text,
        95 as confidence_score,
        ica.created_at as timestamp,
        CASE 
          WHEN bc.last_seen >= NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
       FROM business_cameras bc
       LEFT JOIN iot_ai_analysis ica ON ica.camera_id = bc.id
       WHERE bc.business_user_id = $1
         AND bc.is_active = true
         AND ica.created_at >= NOW() - INTERVAL '10 minutes'
       ORDER BY ica.created_at DESC`,
      [businessUserId]
    );

    // Bugünkü toplam istatistikler (hata giderilmiş)
    const dailyResult = await query(
      `SELECT 
        COUNT(DISTINCT bc.id) FILTER (WHERE ica.created_at >= NOW() - INTERVAL '10 minutes') as active_cameras,
        SUM(COALESCE(ica.person_count, 0)) as total_people,
        SUM(COALESCE(bc.total_entries, 0)) as total_entries,
        SUM(COALESCE(bc.total_exits, 0)) as total_exits,
        AVG(COALESCE(bc.current_occupancy, 0)) as avg_occupancy,
        MAX(COALESCE(bc.current_occupancy, 0)) as peak_occupancy,
        MAX(ica.created_at) as last_update
       FROM business_cameras bc
       LEFT JOIN iot_ai_analysis ica ON ica.camera_id = bc.id
       WHERE bc.business_user_id = $1
         AND bc.is_active = true
         AND DATE(ica.created_at) = CURRENT_DATE`,
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
          currentPeople: row.people_count || 0,
          currentOccupancy: row.current_occupancy || 0,
          densityLevel: row.density_level_text || 'low', // Düzeltildi
          lastUpdate: row.timestamp,
          cameraLastSeen: row.camera_last_seen,
          isOnline: row.is_online
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

