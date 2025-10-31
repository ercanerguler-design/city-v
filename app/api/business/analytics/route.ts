import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Business Analytics API - Gerçek IoT Verilerinden Metrikler
 * GET /api/business/analytics?businessId=123
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    // 1. Bugünkü toplam ziyaretçi sayısı (iot_crowd_analysis)
    const todayVisitorsResult = await query(
      `SELECT 
        COALESCE(SUM(ica.current_occupancy), 0) as total_visitors,
        COUNT(DISTINCT ica.device_id) as active_cameras
       FROM iot_crowd_analysis ica
       JOIN iot_devices id ON ica.device_id = id.device_id
       WHERE id.business_id = $1 
         AND DATE(ica.timestamp) = CURRENT_DATE`,
      [businessId]
    );

    // 2. Dünkü ziyaretçi sayısı (büyüme hesabı için)
    const yesterdayVisitorsResult = await query(
      `SELECT COALESCE(SUM(ica.current_occupancy), 0) as total_visitors
       FROM iot_crowd_analysis ica
       JOIN iot_devices id ON ica.device_id = id.device_id
       WHERE id.business_id = $1 
         AND DATE(ica.timestamp) = CURRENT_DATE - INTERVAL '1 day'`,
      [businessId]
    );

    // 3. Toplam kamera sayısı
    const totalCamerasResult = await query(
      `SELECT COUNT(*) as total FROM iot_devices WHERE business_id = $1`,
      [businessId]
    );

    // 4. Son 1 saatteki ortalama yoğunluk
    const avgOccupancyResult = await query(
      `SELECT 
        COALESCE(AVG(ica.current_occupancy), 0) as avg_occupancy,
        MAX(ica.current_occupancy) as max_occupancy
       FROM iot_crowd_analysis ica
       JOIN iot_devices id ON ica.device_id = id.device_id
       WHERE id.business_id = $1 
         AND ica.timestamp >= NOW() - INTERVAL '1 hour'`,
      [businessId]
    );

    // 5. Ortalama kalış süresi tahmini (giriş-çıkış farkı)
    const avgStayResult = await query(
      `SELECT 
        CASE 
          WHEN SUM(total_exits) > 0 
          THEN ROUND((SUM(total_entries)::numeric / SUM(total_exits)::numeric) * 15, 0)
          ELSE 0 
        END as avg_stay_minutes
       FROM iot_devices 
       WHERE business_id = $1`,
      [businessId]
    );

    // Verileri hazırla
    const todayVisitors = parseInt(todayVisitorsResult.rows[0]?.total_visitors || 0);
    const yesterdayVisitors = parseInt(yesterdayVisitorsResult.rows[0]?.total_visitors || 0);
    const activeCameras = parseInt(todayVisitorsResult.rows[0]?.active_cameras || 0);
    const totalCameras = parseInt(totalCamerasResult.rows[0]?.total || 0);
    const avgOccupancy = parseFloat(avgOccupancyResult.rows[0]?.avg_occupancy || 0);
    const maxOccupancy = parseFloat(avgOccupancyResult.rows[0]?.max_occupancy || 0);
    const avgStayMinutes = parseInt(avgStayResult.rows[0]?.avg_stay_minutes || 0);

    // Büyüme hesapla
    const visitorGrowth = yesterdayVisitors > 0 
      ? Math.round(((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100)
      : 0;

    // Yoğunluk seviyesi
    let crowdLevel = 'Düşük';
    if (avgOccupancy > 20) crowdLevel = 'Çok Yüksek';
    else if (avgOccupancy > 10) crowdLevel = 'Yüksek';
    else if (avgOccupancy > 5) crowdLevel = 'Orta';

    // Ortalama yoğunluk yüzdesi (max kapasiteye göre)
    const averageOccupancy = maxOccupancy > 0 
      ? Math.round((avgOccupancy / maxOccupancy) * 100)
      : Math.round(avgOccupancy);

    return NextResponse.json({
      success: true,
      todayVisitors,
      visitorGrowth,
      activeCameras,
      totalCameras,
      averageOccupancy,
      crowdLevel,
      avgStayMinutes,
      stayGrowth: 0, // Gelecekte önceki gün ile karşılaştırılabilir
      rawData: {
        avgOccupancy,
        maxOccupancy
      }
    });

  } catch (error) {
    console.error('❌ Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
