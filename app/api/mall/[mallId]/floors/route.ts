import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/mall/[mallId]/floors
 * AVM'nin katlarını ve istatistiklerini getir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { mallId: string } }
) {
  try {
    const mallId = params.mallId;

    // Kat listesi ve istatistikler
    const floorsResult = await query(
      `SELECT 
        mf.*,
        COUNT(DISTINCT ms.id) AS shop_count,
        COUNT(DISTINCT mc.camera_id) AS camera_count,
        COALESCE(AVG(mca.people_count), 0)::INTEGER AS avg_crowd,
        COALESCE(MAX(mca.people_count), 0) AS peak_crowd
      FROM mall_floors mf
      LEFT JOIN mall_shops ms ON mf.id = ms.floor_id AND ms.is_active = true
      LEFT JOIN mall_cameras mc ON mf.id = mc.floor_id
      LEFT JOIN mall_crowd_analysis mca ON mf.id = mca.floor_id 
        AND mca.timestamp > NOW() - INTERVAL '1 hour'
      WHERE mf.mall_id = $1
      GROUP BY mf.id
      ORDER BY mf.floor_number ASC`,
      [mallId]
    );

    return NextResponse.json({
      success: true,
      floors: floorsResult.rows
    });

  } catch (error: any) {
    console.error('❌ Mall floors error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/mall/[mallId]/floors
 * Yeni kat ekle
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { mallId: string } }
) {
  try {
    const mallId = params.mallId;
    const body = await request.json();
    const { floor_number, floor_name, total_area_sqm } = body;

    if (floor_number === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Floor number is required'
      }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO mall_floors (mall_id, floor_number, floor_name, total_area_sqm)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [mallId, floor_number, floor_name, total_area_sqm]
    );

    return NextResponse.json({
      success: true,
      floor: result.rows[0]
    });

  } catch (error: any) {
    console.error('❌ Floor create error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
