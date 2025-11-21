import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Business Menu Categories API - Simplified for production
 */

// GET - List categories
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Menu Categories GET started');

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🔍 Getting categories for business:', businessId);

    const result = await sql`
      SELECT id, name, display_order, is_active, icon, created_at
      FROM business_menu_categories
      WHERE business_id = ${businessId}
      ORDER BY display_order ASC, name ASC
    `;

    console.log('✅ Found categories:', result.length);

    return NextResponse.json({
      success: true,
      categories: result
    });

  } catch (error: any) {
    console.error('❌ Categories GET error:', error);
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Menu Categories POST started');

    const body = await request.json();
    const { businessId, name, icon = '📦', displayOrder = 0 } = body;

    if (!businessId || !name) {
      return NextResponse.json(
        { error: 'Business ID ve kategori adı gerekli' },
        { status: 400 }
      );
    }

    console.log('📝 Creating category:', { businessId, name, icon, displayOrder });

    const result = await sql`
      INSERT INTO business_menu_categories (business_id, name, icon, display_order, is_active)
      VALUES (${businessId}, ${name}, ${icon}, ${displayOrder}, true)
      RETURNING *
    `;

    console.log('✅ Category created:', result[0]);

    return NextResponse.json({
      success: true,
      category: result[0],
      message: 'Kategori başarıyla eklendi'
    });

  } catch (error: any) {
    console.error('❌ Category POST error:', error);
    return NextResponse.json(
      { error: 'Kategori eklenemedi', details: error.message },
      { status: 500 }
    );
  }
}
