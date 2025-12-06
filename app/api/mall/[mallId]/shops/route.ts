import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/mall/[mallId]/shops
 * AVM'nin mağazalarını listele (opsiyonel floor filter)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { mallId: string } }
) {
  try {
    const mallId = params.mallId;
    const { searchParams } = new URL(request.url);
    const floorId = searchParams.get('floorId');

    let queryText = `
      SELECT 
        ms.*,
        mf.floor_number,
        mf.floor_name
      FROM mall_shops ms
      LEFT JOIN mall_floors mf ON ms.floor_id = mf.id
      WHERE ms.mall_id = $1
    `;
    
    const queryParams: any[] = [mallId];

    if (floorId) {
      queryText += ' AND ms.floor_id = $2';
      queryParams.push(floorId);
    }

    queryText += ' ORDER BY mf.floor_number ASC, ms.shop_name ASC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      shops: result.rows,
      count: result.rows.length
    });

  } catch (error: any) {
    console.error('❌ Mall shops error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/mall/[mallId]/shops
 * Yeni mağaza ekle
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
      shop_name,
      shop_number,
      category,
      brand_name,
      area_sqm,
      monthly_rent,
      tenant_contact_name,
      tenant_contact_phone,
      location_zone
    } = body;

    if (!floor_id || !shop_name || !area_sqm) {
      return NextResponse.json({
        success: false,
        error: 'Floor ID, shop name, and area are required'
      }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO mall_shops (
        mall_id, floor_id, shop_name, shop_number, category, brand_name,
        area_sqm, monthly_rent, tenant_contact_name, tenant_contact_phone,
        location_zone, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING *`,
      [
        mallId, floor_id, shop_name, shop_number, category, brand_name,
        area_sqm, monthly_rent, tenant_contact_name, tenant_contact_phone,
        location_zone
      ]
    );

    return NextResponse.json({
      success: true,
      shop: result.rows[0]
    });

  } catch (error: any) {
    console.error('❌ Shop create error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
