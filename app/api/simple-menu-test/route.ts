import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Simple Menu Categories Test - No JWT
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Simple Menu Categories Test started');
    
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🔍 Querying categories for business ID:', businessId);
    
    const result = await sql`
      SELECT id, name, display_order, is_active, icon, created_at
      FROM business_menu_categories
      WHERE business_id = ${businessId}
      ORDER BY display_order ASC, name ASC
    `;
    
    console.log('✅ Query result:', result);
    
    return NextResponse.json({
      success: true,
      categories: result,
      count: result.length,
      businessId: businessId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Simple Menu Test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple Menu Categories POST Test started');
    
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

    console.log('✅ Insert result:', result[0]);

    return NextResponse.json({
      success: true,
      category: result[0],
      message: 'Kategori başarıyla eklendi'
    });

  } catch (error: any) {
    console.error('❌ Simple Menu POST error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}