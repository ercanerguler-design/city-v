import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/mall/list
 * Business user'ın AVM'lerini listeler
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Token'dan user_id al
    const userResult = await query(
      'SELECT id, business_profile_id FROM business_users WHERE id = (SELECT user_id FROM business_auth_tokens WHERE token = $1)',
      [token]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = userResult.rows[0].id;
    const businessProfileId = userResult.rows[0].business_profile_id;

    // Business profile ID'den AVM'leri listele
    const mallsResult = await query(
      `SELECT 
        m.*,
        (SELECT COUNT(*) FROM mall_floors WHERE mall_id = m.id) AS total_floors_count,
        (SELECT COUNT(*) FROM mall_shops WHERE mall_id = m.id AND is_active = true) AS active_shops_count
      FROM malls m
      WHERE m.business_profile_id = $1
      ORDER BY m.created_at DESC`,
      [businessProfileId]
    );

    return NextResponse.json({
      success: true,
      malls: mallsResult.rows,
      count: mallsResult.rows.length
    });

  } catch (error: any) {
    console.error('❌ Mall list error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/mall/list
 * Yeni AVM oluştur
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Token'dan user_id al
    const userResult = await query(
      'SELECT id, business_profile_id FROM business_users WHERE id = (SELECT user_id FROM business_auth_tokens WHERE token = $1)',
      [token]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const businessProfileId = userResult.rows[0].business_profile_id;
    const body = await request.json();

    const { mall_name, total_floors, address, city, location_lat, location_lng } = body;

    if (!mall_name || !address) {
      return NextResponse.json({
        success: false,
        error: 'Mall name and address are required'
      }, { status: 400 });
    }

    // Yeni AVM oluştur
    const result = await query(
      `INSERT INTO malls (business_profile_id, mall_name, total_floors, address, city, location_lat, location_lng)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [businessProfileId, mall_name, total_floors || 3, address, city, location_lat, location_lng]
    );

    return NextResponse.json({
      success: true,
      mall: result.rows[0]
    });

  } catch (error: any) {
    console.error('❌ Mall create error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
