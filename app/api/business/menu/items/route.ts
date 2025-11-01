import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Business Menü Ürünleri Yönetimi API
 */

// POST - Yeni ürün ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, name, description, price, originalPrice, imageUrl, isAvailable = true, displayOrder = 0 } = body;

    if (!categoryId || !name || !price) {
      return NextResponse.json(
        { error: 'Kategori ID, ürün adı ve fiyat gerekli' },
        { status: 400 }
      );
    }

    // Fiyat validasyonu
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: 'Geçerli bir fiyat girin' },
        { status: 400 }
      );
    }

    // Category'den business_id'yi al
    const categoryResult = await query(
      `SELECT business_id FROM business_menu_categories WHERE id = $1`,
      [categoryId]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    const businessId = categoryResult.rows[0].business_id;

    const result = await query(
      `INSERT INTO business_menu_items 
       (business_id, category_id, name, description, price, original_price, image_url, is_available, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [businessId, categoryId, name, description || null, priceNum, originalPrice || null, imageUrl || null, isAvailable, displayOrder]
    );

    return NextResponse.json({
      success: true,
      item: result.rows[0],
      message: 'Ürün başarıyla eklendi'
    });

  } catch (error: any) {
    console.error('❌ Menu item POST error:', error);
    return NextResponse.json(
      { error: 'Ürün eklenemedi' },
      { status: 500 }
    );
  }
}

// PUT - Ürün güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, name, description, price, originalPrice, imageUrl, isAvailable, displayOrder } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli' },
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
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: 'Geçerli bir fiyat girin' },
          { status: 400 }
        );
      }
      updateFields.push(`price = $${paramCount++}`);
      updateValues.push(priceNum);
    }
    if (originalPrice !== undefined) {
      updateFields.push(`original_price = $${paramCount++}`);
      updateValues.push(originalPrice);
    }
    if (imageUrl !== undefined) {
      updateFields.push(`image_url = $${paramCount++}`);
      updateValues.push(imageUrl);
    }
    if (isAvailable !== undefined) {
      updateFields.push(`is_available = $${paramCount++}`);
      updateValues.push(isAvailable);
    }
    if (displayOrder !== undefined) {
      updateFields.push(`display_order = $${paramCount++}`);
      updateValues.push(displayOrder);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek alan bulunamadı' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(itemId);

    const sqlQuery = `
      UPDATE business_menu_items
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sqlQuery, updateValues);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: result.rows[0],
      message: 'Ürün başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('❌ Menu item PUT error:', error);
    return NextResponse.json(
      { error: 'Ürün güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Ürün sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM business_menu_items WHERE id = $1 RETURNING name',
      [itemId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.rows[0].name} silindi`
    });

  } catch (error: any) {
    console.error('❌ Menu item DELETE error:', error);
    return NextResponse.json(
      { error: 'Ürün silinemedi' },
      { status: 500 }
    );
  }
}
