import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 🗺️ Location Crowd Data API
 * Harita üzerindeki işletmelerin real-time crowd level'larını getirir
 * GET /api/locations/crowd?locationId=starbucks-kizilay
 * GET /api/locations/crowd?all=true (tüm işletmeler)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');
    const getAll = searchParams.get('all') === 'true';

    console.log('🗺️ Location Crowd API:', { locationId, getAll });

    if (!getAll && !locationId) {
      return NextResponse.json(
        { success: false, error: 'locationId veya all=true gerekli' },
        { status: 400 }
      );
    }

    if (getAll) {
      // Tüm işletmelerin crowd data'sını getir
      const result = await query(
        `SELECT 
          bp.location_id,
          bp.business_name,
          bp.business_type,
          bp.user_id,
          COUNT(DISTINCT bc.id) as total_cameras,
          COUNT(DISTINCT CASE WHEN bc.status = 'active' THEN bc.id END) as active_cameras,
          COALESCE(SUM(ia.person_count), 0) as total_people,
          COALESCE(SUM(COALESCE((ia.detection_objects->>'current_occupancy')::INTEGER, 0)), 0) as total_occupancy,
          COALESCE(AVG(ia.person_count), 0) as avg_occupancy,
          MAX(ia.created_at) as last_update,
          CASE 
            WHEN AVG(ia.person_count) > 20 THEN 'very_high'
            WHEN AVG(ia.person_count) > 15 THEN 'high'
            WHEN AVG(ia.person_count) > 8 THEN 'moderate'
            WHEN AVG(ia.person_count) > 3 THEN 'low'
            ELSE 'empty'
          END as crowd_level
         FROM business_profiles bp
         LEFT JOIN business_cameras bc ON bc.business_user_id = bp.user_id
         LEFT JOIN iot_ai_analysis ia ON ia.camera_id = bc.id 
           AND ia.created_at >= NOW() - INTERVAL '5 minutes'
         WHERE bp.location_id IS NOT NULL
         GROUP BY bp.location_id, bp.business_name, bp.business_type, bp.user_id
         HAVING COUNT(DISTINCT bc.id) > 0`,
        []
      );

      const locations: Record<string, any> = {};
      result.rows.forEach(row => {
        locations[row.location_id] = {
          locationId: row.location_id,
          businessName: row.business_name,
          businessType: row.business_type,
          totalCameras: parseInt(row.total_cameras),
          activeCameras: parseInt(row.active_cameras),
          currentPeople: parseInt(row.total_people),
          avgOccupancy: Math.round(parseFloat(row.avg_occupancy)),
          crowdLevel: row.crowd_level,
          lastUpdate: row.last_update,
          isLive: !!row.last_update
        };
      });

      console.log(`✅ Returned ${Object.keys(locations).length} locations with crowd data`);

      return NextResponse.json({
        success: true,
        locations,
        count: Object.keys(locations).length,
        timestamp: new Date().toISOString()
      });

    } else {
      // Tek bir işletmenin crowd data'sını getir
      const result = await query(
        `SELECT 
          bp.location_id,
          bp.business_name,
          bp.business_type,
          bp.user_id,
          COUNT(DISTINCT bc.id) as total_cameras,
          COUNT(DISTINCT CASE WHEN bc.status = 'active' THEN bc.id END) as active_cameras,
          COALESCE(SUM(ia.person_count), 0) as total_people,
          COALESCE(SUM(COALESCE((ia.detection_objects->>'people_in')::INTEGER, 0)), 0) as total_entries,
          COALESCE(SUM(COALESCE((ia.detection_objects->>'people_out')::INTEGER, 0)), 0) as total_exits,
          COALESCE(AVG(ia.person_count), 0) as avg_occupancy,
          MAX(ia.person_count) as peak_occupancy,
          MAX(ia.created_at) as last_update,
          CASE 
            WHEN AVG(ia.person_count) > 20 THEN 'very_high'
            WHEN AVG(ia.person_count) > 15 THEN 'high'
            WHEN AVG(ia.person_count) > 8 THEN 'moderate'
            WHEN AVG(ia.person_count) > 3 THEN 'low'
            ELSE 'empty'
          END as crowd_level,
          json_agg(
            json_build_object(
              'cameraId', bc.id,
              'cameraName', bc.camera_name,
              'status', bc.status,
              'lastPeople', ia.person_count,
              'lastOccupancy', COALESCE((ia.detection_objects->>'current_occupancy')::INTEGER, 0)
            ) ORDER BY ia.created_at DESC
          ) FILTER (WHERE bc.id IS NOT NULL) as cameras
         FROM business_profiles bp
         LEFT JOIN business_cameras bc ON bc.business_user_id = bp.user_id
         LEFT JOIN iot_ai_analysis ia ON ia.camera_id = bc.id 
           AND ia.created_at >= NOW() - INTERVAL '5 minutes'
         WHERE bp.location_id = $1
         GROUP BY bp.location_id, bp.business_name, bp.business_type, bp.user_id`,
        [locationId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: true,
          location: null,
          message: 'Bu işletme için kamera verisi yok'
        });
      }

      const row = result.rows[0];
      const locationData = {
        locationId: row.location_id,
        businessName: row.business_name,
        businessType: row.business_type,
        totalCameras: parseInt(row.total_cameras),
        activeCameras: parseInt(row.active_cameras),
        currentPeople: parseInt(row.total_people),
        totalEntries: parseInt(row.total_entries),
        totalExits: parseInt(row.total_exits),
        avgOccupancy: Math.round(parseFloat(row.avg_occupancy)),
        peakOccupancy: parseInt(row.peak_occupancy || 0),
        crowdLevel: row.crowd_level,
        lastUpdate: row.last_update,
        isLive: !!row.last_update,
        cameras: row.cameras || []
      };

      console.log('✅ Location crowd data:', locationData);

      return NextResponse.json({
        success: true,
        location: locationData,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('❌ Location crowd API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Crowd data alınamadı',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
