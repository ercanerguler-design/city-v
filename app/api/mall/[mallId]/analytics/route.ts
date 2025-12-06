import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/mall/[mallId]/analytics
 * AVM'nin yoğunluk analizleri
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { mallId: string } }
) {
  try {
    const mallId = params.mallId;
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');

    // Saatlik yoğunluk trendi
    const hourlyTrend = await query(
      `SELECT 
        hour_of_day,
        AVG(people_count)::INTEGER AS avg_people,
        MAX(people_count) AS peak_people,
        COUNT(*) AS sample_count
      FROM mall_crowd_analysis
      WHERE mall_id = $1
        AND timestamp > NOW() - INTERVAL '${hours} hours'
      GROUP BY hour_of_day
      ORDER BY hour_of_day ASC`,
      [mallId]
    );

    // Kat bazlı yoğunluk
    const floorCrowd = await query(
      `SELECT 
        mf.id AS floor_id,
        mf.floor_number,
        mf.floor_name,
        AVG(mca.people_count)::INTEGER AS avg_crowd,
        MAX(mca.people_count) AS peak_crowd,
        COUNT(DISTINCT mca.camera_id) AS camera_count
      FROM mall_floors mf
      LEFT JOIN mall_crowd_analysis mca ON mf.id = mca.floor_id
        AND mca.timestamp > NOW() - INTERVAL '1 hour'
      WHERE mf.mall_id = $1
      GROUP BY mf.id, mf.floor_number, mf.floor_name
      ORDER BY mf.floor_number ASC`,
      [mallId]
    );

    // Toplam istatistikler
    const totalStats = await query(
      `SELECT 
        COUNT(DISTINCT mf.id) AS total_floors,
        COUNT(DISTINCT ms.id) AS total_shops,
        COUNT(DISTINCT mc.camera_id) AS total_cameras,
        COALESCE(SUM(ms.area_sqm), 0) AS total_area_sqm
      FROM malls m
      LEFT JOIN mall_floors mf ON m.id = mf.mall_id
      LEFT JOIN mall_shops ms ON m.id = ms.mall_id AND ms.is_active = true
      LEFT JOIN mall_cameras mc ON m.id = mc.mall_id
      WHERE m.id = $1`,
      [mallId]
    );

    return NextResponse.json({
      success: true,
      analytics: {
        hourlyTrend: hourlyTrend.rows,
        floorCrowd: floorCrowd.rows,
        totalStats: totalStats.rows[0] || {}
      }
    });

  } catch (error: any) {
    console.error('❌ Mall analytics error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/mall/[mallId]/analytics
 * Yeni yoğunluk verisi kaydet (ESP32'den)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { mallId: string } }
) {
  try {
    const mallId = params.mallId;
    const body = await request.json();

    const {
      floor_id,
      camera_id,
      zone_name,
      people_count,
      density_level
    } = body;

    if (!floor_id || !camera_id || people_count === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Floor ID, camera ID, and people count are required'
      }, { status: 400 });
    }

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    const result = await query(
      `INSERT INTO mall_crowd_analysis (
        mall_id, floor_id, camera_id, zone_name, people_count,
        density_level, hour_of_day, day_of_week
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [mallId, floor_id, camera_id, zone_name, people_count, density_level, hour, day]
    );

    return NextResponse.json({
      success: true,
      analysis: result.rows[0]
    });

  } catch (error: any) {
    console.error('❌ Crowd analysis save error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
