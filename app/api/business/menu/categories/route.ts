import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

/**
 * Business Menü Kategori Yönetimi API
 */

// GET - Kategorileri listele
export async function GET(request: NextRequest) {
  try {
    // JWT token authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    
    try {
      user = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT id, name, display_order, is_active, icon, created_at
       FROM business_menu_categories
       WHERE business_id = $1
       ORDER BY display_order ASC, name ASC`,
      [businessId]
    );

    return NextResponse.json({
      success: true,
      categories: result.rows
    });

  } catch (error: any) {
    console.error('❌ Categories GET error:', error);
    return NextResponse.json(
      { error: 'Kategoriler getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni kategori ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, name, icon = '📦', displayOrder = 0 } = body;

    if (!businessId || !name) {
      return NextResponse.json(
        { error: 'Business ID ve kategori adı gerekli' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO business_menu_categories (business_id, name, icon, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [businessId, name, icon, displayOrder]
    );

    return NextResponse.json({
      success: true,
      category: result.rows[0],
      message: 'Kategori başarıyla eklendi'
    });

  } catch (error: any) {
    console.error('❌ Category POST error:', error);
    return NextResponse.json(
      { error: 'Kategori eklenemedi' },
      { status: 500 }
    );
  }
}

// PUT - Kategori güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, name, icon, displayOrder, isActive } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategori ID gerekli' },
        { status: 400 }
      );
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    if (icon !== undefined) {
      updateFields.push(`icon = $${paramCount++}`);
      updateValues.push(icon);
    }
    if (displayOrder !== undefined) {
      updateFields.push(`display_order = $${paramCount++}`);
      updateValues.push(displayOrder);
    }
    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(isActive);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(categoryId);

    const sqlQuery = `
      UPDATE business_menu_categories
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sqlQuery, updateValues);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: result.rows[0],
      message: 'Kategori başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('❌ Category PUT error:', error);
    return NextResponse.json(
      { error: 'Kategori güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Kategori sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategori ID gerekli' },
        { status: 400 }
      );
    }

    // Kategori altında ürün var mı kontrol et
    const itemsCheck = await query(
      'SELECT COUNT(*) as count FROM business_menu_items WHERE category_id = $1',
      [categoryId]
    );

    if (parseInt(itemsCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Bu kategoride ürünler var. Önce ürünleri silmelisiniz.' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM business_menu_categories WHERE id = $1 RETURNING name',
      [categoryId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.rows[0].name} kategorisi silindi`
    });

  } catch (error: any) {
    console.error('❌ Category DELETE error:', error);
    return NextResponse.json(
      { error: 'Kategori silinemedi' },
      { status: 500 }
    );
  }
}
