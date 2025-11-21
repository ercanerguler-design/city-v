import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Menu Categories V2 - Cache buster
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Menu Categories V2 GET started');

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🔍 Getting categories for business V2:', businessId);

    const result = await sql`
      SELECT id, name, display_order, is_active, icon, created_at
      FROM business_menu_categories
      WHERE business_id = ${businessId}
      ORDER BY display_order ASC, name ASC
    `;

    console.log('✅ Found categories V2:', result.length);

    return NextResponse.json({
      success: true,
      categories: result,
      version: 'v2',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Categories V2 GET error:', error);
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi V2', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Menu Categories V2 POST started');

    const body = await request.json();
    const { businessId, name, icon = '📦', displayOrder = 0 } = body;

    if (!businessId || !name) {
      return NextResponse.json(
        { error: 'Business ID ve kategori adı gerekli' },
        { status: 400 }
      );
    }

    console.log('📝 Creating category V2:', { businessId, name, icon, displayOrder });

    const result = await sql`
      INSERT INTO business_menu_categories (business_id, name, icon, display_order, is_active)
      VALUES (${businessId}, ${name}, ${icon}, ${displayOrder}, true)
      RETURNING *
    `;

    console.log('✅ Category created V2:', result[0]);

    return NextResponse.json({
      success: true,
      category: result[0],
      message: 'Kategori başarıyla eklendi V2',
      version: 'v2'
    });

  } catch (error: any) {
    console.error('❌ Category V2 POST error:', error);
    return NextResponse.json(
      { error: 'Kategori eklenemedi V2', details: error.message },
      { status: 500 }
    );
  }
}