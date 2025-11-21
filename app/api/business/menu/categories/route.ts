import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-2024';

/**
 * Business Menu Categories API - With authentication
 */

// Authentication helper function
async function verifyBusinessUser(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                request.cookies.get('business_token')?.value;

  if (!token) {
    throw new Error('Token bulunamadı');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Geçersiz token');
  }

  const userId = decoded.userId;
  
  // User exists kontrolü
  const userResult = await sql`
    SELECT id, email 
    FROM business_users 
    WHERE id = ${userId}
  `;

  if (!userResult.length) {
    throw new Error('Kullanıcı bulunamadı');
  }

  return { userId, user: userResult[0] };
}

// GET - List categories
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Menu Categories GET started');

    // Authentication check
    const { userId } = await verifyBusinessUser(request);
    console.log('✅ Authenticated user:', userId);

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    // Check if user owns this business
    const businessCheck = await sql`
      SELECT id FROM business_profiles 
      WHERE id = ${businessId} AND user_id = ${userId}
    `;

    if (!businessCheck.length) {
      return NextResponse.json(
        { error: 'Bu işletmeye erişim yetkiniz yok' },
        { status: 403 }
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
    
    if (error.message.includes('Token') || error.message.includes('Geçersiz') || error.message.includes('Kullanıcı')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: error.message },
        { status: 401 }
      );
    }
    
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

    // Authentication check
    const { userId } = await verifyBusinessUser(request);
    console.log('✅ Authenticated user:', userId);

    const body = await request.json();
    const { businessId, name, icon = '📦', displayOrder = 0 } = body;

    if (!businessId || !name) {
      return NextResponse.json(
        { error: 'Business ID ve kategori adı gerekli' },
        { status: 400 }
      );
    }

    // Check if user owns this business
    const businessCheck = await sql`
      SELECT id FROM business_profiles 
      WHERE id = ${businessId} AND user_id = ${userId}
    `;

    if (!businessCheck.length) {
      return NextResponse.json(
        { error: 'Bu işletmeye erişim yetkiniz yok' },
        { status: 403 }
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
    
    if (error.message.includes('Token') || error.message.includes('Geçersiz') || error.message.includes('Kullanıcı')) {
      return NextResponse.json(
        { error: 'Unauthorized', details: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Kategori eklenemedi', details: error.message },
      { status: 500 }
    );
  }
}
