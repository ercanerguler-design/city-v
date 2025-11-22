import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

export async function GET(req: NextRequest) {
  try {
    // Auth kontrolü
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let businessId: number;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      businessId = decoded.id;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // İşletmeye ait tüm kameraları al
    const camerasResult = await query(
      `SELECT id, ip_address, port, camera_name, location_description 
       FROM business_cameras 
       WHERE business_id = $1 AND is_active = true`,
      [businessId]
    );

    const cameras = camerasResult.rows;

    if (cameras.length === 0) {
      return NextResponse.json({
        success: true,
        totalVisitors: 0,
        estimatedRevenue: 0,
        averageStayTime: 0,
        cameras: [],
        message: 'Henüz kamera eklenmemiş'
      });
    }

    // Son 1 saat içindeki crowd analysis verilerini al
    const analyticsResult = await query(
      `SELECT 
        ca.camera_id,
        ca.people_count,
        ca.crowd_level,
        ca.entry_count,
        ca.exit_count,
        ca.average_dwell_time,
        ca.zone_data,
        ca.timestamp,
        bc.camera_name,
        bc.location_description
       FROM crowd_analysis ca
       JOIN business_cameras bc ON ca.camera_id = bc.id
       WHERE bc.business_id = $1 
         AND ca.timestamp >= NOW() - INTERVAL '1 hour'
       ORDER BY ca.timestamp DESC`,
      [businessId]
    );

    const analytics = analyticsResult.rows;

    // Gerçek zamanlı istatistikleri hesapla
    let totalVisitors = 0;
    let totalStayTime = 0;
    let dataPointCount = 0;
    const cameraData: any[] = [];

    // Her kamera için en son veriyi al
    cameras.forEach(camera => {
      const cameraAnalytics = analytics.filter(a => a.camera_id === camera.id);
      
      if (cameraAnalytics.length > 0) {
        const latest = cameraAnalytics[0]; // En son veri
        
        totalVisitors += latest.people_count || 0;
        
        if (latest.average_dwell_time) {
          totalStayTime += latest.average_dwell_time;
          dataPointCount++;
        }

        cameraData.push({
          cameraId: camera.id,
          cameraName: camera.camera_name,
          location: camera.location_description,
          currentPeople: latest.people_count || 0,
          crowdLevel: latest.crowd_level || 'low',
          entryCount: latest.entry_count || 0,
          exitCount: latest.exit_count || 0,
          averageStayTime: latest.average_dwell_time || 0,
          lastUpdate: latest.timestamp
        });
      } else {
        cameraData.push({
          cameraId: camera.id,
          cameraName: camera.camera_name,
          location: camera.location_description,
          currentPeople: 0,
          crowdLevel: 'low',
          entryCount: 0,
          exitCount: 0,
          averageStayTime: 0,
          lastUpdate: null
        });
      }
    });

    // Ortalama bekleme süresi
    const averageStayTime = dataPointCount > 0 ? Math.round(totalStayTime / dataPointCount) : 0;

    // Tahmini gelir hesaplama (basit formül: ziyaretçi sayısı * ortalama harcama)
    const estimatedAverageSpending = 150; // TL (ayarlanabilir)
    const estimatedRevenue = totalVisitors * estimatedAverageSpending;

    // Crowd analysis tablosuna kaydet (her 1 dakikada bir)
    try {
      for (const data of cameraData) {
        if (data.currentPeople > 0) {
          await query(
            `INSERT INTO crowd_analysis (
              camera_id, people_count, crowd_level, entry_count, exit_count,
              average_dwell_time, zone_data, timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT DO NOTHING`,
            [
              data.cameraId,
              data.currentPeople,
              data.crowdLevel,
              data.entryCount,
              data.exitCount,
              data.averageStayTime,
              JSON.stringify({})
            ]
          );
        }
      }
    } catch (insertError) {
      console.warn('⚠️ Crowd analysis insert hatası:', insertError);
    }

    return NextResponse.json({
      success: true,
      totalVisitors,
      estimatedRevenue,
      averageStayTime,
      cameras: cameraData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Realtime analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

