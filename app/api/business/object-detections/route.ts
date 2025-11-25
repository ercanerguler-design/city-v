import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * 🤖 TensorFlow Object Detection API
 * ESP32-CAM TensorFlow/COCO verileri - Profesyonel analitik
 * GET /api/business/object-detections?businessUserId=23
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessUserId = searchParams.get('businessUserId');
    const timeRange = searchParams.get('timeRange') || '24h'; // 24h, 7d, 30d

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'Business User ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🤖 TensorFlow detections for business:', businessUserId, 'Range:', timeRange);

    // Time condition based on range
    let hoursAgo = 24;
    if (timeRange === '7d') hoursAgo = 168;
    else if (timeRange === '30d') hoursAgo = 720;

    // ✅ ESP32 FIRMWARE: iot_crowd_analysis.detection_objects JSONB içinde TensorFlow/COCO verileri
    // 1. Son deteksiyonlar (object_class, confidence, bbox)
    const recentDetectionsResult = await sql`
      SELECT 
        ca.id,
        ca.device_id,
        ca.people_count,
        ca.crowd_density,
        ca.detection_objects,
        ca.confidence_score,
        ca.analysis_timestamp,
        bc.camera_name,
        bc.location_description
      FROM iot_crowd_analysis ca
      JOIN business_cameras bc ON CAST(bc.id AS VARCHAR) = ca.device_id
      WHERE bc.business_user_id = ${businessUserId}
        AND bc.is_active = true
        AND ca.analysis_timestamp >= NOW() - INTERVAL '1 hour' * ${hoursAgo}
        AND ca.detection_objects IS NOT NULL
      ORDER BY ca.analysis_timestamp DESC
      LIMIT 100
    `;

    // 2. Nesne tipine göre istatistikler (COCO dataset: person, car, bicycle, etc.)
    // detection_objects is JSONB array, not object - skip this query for now
    const objectStatsResult = { rows: [] };

    // 3. Kamera bazlı detection analizi
    const cameraStatsResult = await sql`
      SELECT 
        bc.camera_name,
        bc.location_description,
        COUNT(ca.id) as total_detections,
        AVG(ca.people_count) as avg_people_count,
        MAX(ca.people_count) as max_people_count,
        AVG(ca.confidence_score) as avg_confidence
      FROM iot_crowd_analysis ca
      JOIN business_cameras bc ON CAST(bc.id AS VARCHAR) = ca.device_id
      WHERE bc.business_user_id = ${businessUserId}
        AND bc.is_active = true
        AND ca.analysis_timestamp >= NOW() - INTERVAL '1 hour' * ${hoursAgo}
      GROUP BY bc.camera_name, bc.location_description
      ORDER BY total_detections DESC
    `;

    // 4. Saatlik detection dağılımı
    const hourlyDetectionsResult = await sql`
      SELECT 
        EXTRACT(HOUR FROM ca.analysis_timestamp AT TIME ZONE 'Europe/Istanbul') as hour,
        COUNT(*) as detection_count,
        AVG(ca.people_count) as avg_people_count,
        AVG(ca.confidence_score) as avg_confidence
      FROM iot_crowd_analysis ca
      JOIN business_cameras bc ON CAST(bc.id AS VARCHAR) = ca.device_id
      WHERE bc.business_user_id = ${businessUserId}
        AND bc.is_active = true
        AND ca.analysis_timestamp >= NOW() - INTERVAL '1 hour' * ${hoursAgo}
      GROUP BY EXTRACT(HOUR FROM ca.analysis_timestamp AT TIME ZONE 'Europe/Istanbul')
      ORDER BY hour
    `;

    // 5. Yoğunluk seviyesi dağılımı
    const densityStatsResult = await sql`
      SELECT 
        ca.crowd_density,
        COUNT(*) as count,
        AVG(ca.people_count) as avg_people_count
      FROM iot_crowd_analysis ca
      JOIN business_cameras bc ON CAST(bc.id AS VARCHAR) = ca.device_id
      WHERE bc.business_user_id = ${businessUserId}
        AND bc.is_active = true
        AND ca.analysis_timestamp >= NOW() - INTERVAL '1 hour' * ${hoursAgo}
      GROUP BY ca.crowd_density
      ORDER BY count DESC
    `;

    // Parse detection_objects JSONB (BACKWARD COMPATIBLE)
    const parsedDetections = recentDetectionsResult.rows.map(row => {
      let detectedObjects: any[] = [];
      
      try {
        const detectionData = row.detection_objects;
        
        // ✅ HANDLE OLD DATA (NUMBER format) vs NEW DATA (JSONB array)
        if (typeof detectionData === 'number') {
          // Eski veri: sadece people_count
          detectedObjects = [{
            type: 'person',
            count: detectionData,
            confidence: row.confidence_score || 85
          }];
        } else if (Array.isArray(detectionData)) {
          // Yeni veri: TensorFlow/COCO detection array
          detectedObjects = detectionData.map((obj: any) => ({
            type: obj.type || 'person',
            count: 1,
            confidence: Math.round((parseFloat(obj.confidence) || row.confidence_score || 0.85) * 100),
            bbox: obj.bbox || null
          }));
        } else if (detectionData && typeof detectionData === 'object') {
          // Object format (başka bir format)
          detectedObjects = Object.entries(detectionData).map(([objectType, data]: [string, any]) => ({
            type: objectType,
            count: Array.isArray(data) ? data.length : (data.count || 1),
            confidence: data.confidence || row.confidence_score || 85,
            details: data
          }));
        }
      } catch (e) {
        console.warn('Detection parse error:', e);
        // Fallback: people_count kullan
        detectedObjects = [{
          type: 'person',
          count: row.people_count || 0,
          confidence: row.confidence_score || 85
        }];
      }

      return {
        id: row.id,
        timestamp: row.analysis_timestamp,
        cameraName: row.camera_name,
        location: row.location_description,
        peopleCount: row.people_count,
        crowdDensity: row.crowd_density,
        confidence: row.confidence_score,
        objects: detectedObjects
      };
    });

    // Object stats
    const objectStats = objectStatsResult.rows.map(row => ({
      objectType: row.object_type,
      detectionCount: parseInt(row.detection_count),
      avgConfidence: Math.round(parseFloat(row.avg_confidence || 95))
    }));

    // Camera stats
    const cameraStats = cameraStatsResult.rows.map(row => ({
      cameraName: row.camera_name,
      location: row.location_description,
      totalDetections: parseInt(row.total_detections),
      avgPeopleCount: Math.round(parseFloat(row.avg_people_count || 0)),
      maxPeopleCount: parseInt(row.max_people_count || 0),
      avgConfidence: Math.round(parseFloat(row.avg_confidence || 95))
    }));

    // Hourly detections
    const hourlyDetections = hourlyDetectionsResult.rows.map(row => ({
      hour: parseInt(row.hour),
      detectionCount: parseInt(row.detection_count),
      avgPeopleCount: Math.round(parseFloat(row.avg_people_count || 0)),
      avgConfidence: Math.round(parseFloat(row.avg_confidence || 95))
    }));

    // Density stats
    const densityStats = densityStatsResult.rows.map(row => ({
      density: row.crowd_density,
      count: parseInt(row.count),
      avgPeopleCount: Math.round(parseFloat(row.avg_people_count || 0))
    }));

    // Summary
    const summary = {
      totalDetections: parsedDetections.length,
      uniqueObjectTypes: objectStats.length,
      activeCameras: cameraStats.length,
      avgConfidence: Math.round(
        parsedDetections.reduce((sum, d) => sum + d.confidence, 0) / (parsedDetections.length || 1)
      ),
      timeRange,
      lastUpdate: parsedDetections[0]?.timestamp || new Date()
    };

    console.log('✅ TensorFlow detections:', {
      detections: parsedDetections.length,
      objectTypes: objectStats.length,
      cameras: cameraStats.length
    });

    return NextResponse.json({
      success: true,
      summary,
      recentDetections: parsedDetections.slice(0, 20),
      objectStats,
      cameraStats,
      hourlyDetections,
      densityStats
    });

  } catch (error: any) {
    console.error('❌ Object detections error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
