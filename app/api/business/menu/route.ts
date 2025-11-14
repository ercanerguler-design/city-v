import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Business Menü Yönetimi API
 * - GET: Tüm menü ürünlerini listele (kategorileriyle)
 * - POST: Yeni ürün ekle
 * - PUT: Ürün güncelle
 * - DELETE: Ürün sil
 */

// GET - Menüyü getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    // Kategorileri getir
    const categoriesResult = await query(
      `SELECT id, name, display_order, is_active, icon
       FROM business_menu_categories
       WHERE business_id = $1
       ORDER BY display_order ASC, name ASC`,
      [businessId]
    );

    // Tüm ürünleri getir (category_id üzerinden)
    const itemsResult = await query(
      `SELECT 
        mi.id,
        mi.category_id,
        mi.name,
        mi.description,
        mi.price,
        mi.original_price,
        mi.currency,
        mi.image_url,
        mi.is_available,
        mi.is_featured,
        mi.allergens,
        mi.dietary_info,
        mi.preparation_time,
        mi.calories,
        mi.display_order
       FROM business_menu_items mi
       INNER JOIN business_menu_categories mc ON mi.category_id = mc.id
       WHERE mc.business_id = $1
       ORDER BY mi.display_order ASC, mi.name ASC`,
      [businessId]
    );

    // Kategorilere ürünleri grupla
    const categoriesWithItems = categoriesResult.rows.map(category => ({
      ...category,
      items: itemsResult.rows.filter(item => item.category_id === category.id)
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithItems,
      totalItems: itemsResult.rows.length,
      totalCategories: categoriesResult.rows.length
    });

  } catch (error: any) {
    console.error('❌ Menu GET error:', error);
    return NextResponse.json(
      { error: 'Menü getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni ürün ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      categoryId,
      name,
      description,
      price,
      originalPrice,
      imageUrl,
      allergens = [],
      dietaryInfo = [],
      preparationTime,
      calories,
      isFeatured = false
    } = body;

    if (!businessId || !categoryId || !name || !price) {
      return NextResponse.json(
        { error: 'Business ID, kategori, ürün adı ve fiyat gerekli' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO business_menu_items (
        business_id,
        category_id,
        name,
        description,
        price,
        original_price,
        image_url,
        allergens,
        dietary_info,
        preparation_time,
        calories,
        is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        businessId,
        categoryId,
        name,
        description,
        price,
        originalPrice,
        imageUrl,
        allergens,
        dietaryInfo,
        preparationTime,
        calories,
        isFeatured
      ]
    );

    return NextResponse.json({
      success: true,
      item: result.rows[0],
      message: 'Ürün başarıyla eklendi'
    });

  } catch (error: any) {
    console.error('❌ Menu POST error:', error);
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
    const {
      itemId,
      name,
      description,
      price,
      originalPrice,
      imageUrl,
      isAvailable,
      isFeatured,
      allergens,
      dietaryInfo,
      preparationTime,
      calories,
      displayOrder
    } = body;

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
      updateFields.push(`price = $${paramCount++}`);
      updateValues.push(price);
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
    if (isFeatured !== undefined) {
      updateFields.push(`is_featured = $${paramCount++}`);
      updateValues.push(isFeatured);
    }
    if (allergens !== undefined) {
      updateFields.push(`allergens = $${paramCount++}`);
      updateValues.push(allergens);
    }
    if (dietaryInfo !== undefined) {
      updateFields.push(`dietary_info = $${paramCount++}`);
      updateValues.push(dietaryInfo);
    }
    if (preparationTime !== undefined) {
      updateFields.push(`preparation_time = $${paramCount++}`);
      updateValues.push(preparationTime);
    }
    if (calories !== undefined) {
      updateFields.push(`calories = $${paramCount++}`);
      updateValues.push(calories);
    }
    if (displayOrder !== undefined) {
      updateFields.push(`display_order = $${paramCount++}`);
      updateValues.push(displayOrder);
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
    console.error('❌ Menu PUT error:', error);
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
      message: `${result.rows[0].name} başarıyla silindi`
    });

  } catch (error: any) {
    console.error('❌ Menu DELETE error:', error);
    return NextResponse.json(
      { error: 'Ürün silinemedi' },
      { status: 500 }
    );
  }
}
