import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

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
    console.log('🍽️ Business Menu GET API başladı');
    
    // JWT token authentication - optional for menu viewing
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        user = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
        console.log('✅ Token doğrulandı:', user.email);
      } catch (error) {
        console.log('⚠️ Token geçersiz, anonim erişim');
      }
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    console.log('📋 Menu GET request:', { businessId, hasAuth: !!user });

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    // Business sahibi kontrolü (sadece authenticated users için)
    if (user) {
      const ownershipCheck = await sql`
        SELECT id FROM business_users 
        WHERE id = ${user.userId}
      `;

      if (ownershipCheck.length === 0) {
        console.log('❌ Business user not found');
        return NextResponse.json(
          { error: 'Business kullanıcısı bulunamadı' },
          { status: 403 }
        );
      }
      
      // businessId parametresi ile JWT userId eşleşmeli
      if (parseInt(businessId) !== user.userId) {
        console.log('❌ Business ID mismatch:', { businessId, userId: user.userId });
        return NextResponse.json(
          { error: 'Bu menüyü görme yetkiniz yok' },
          { status: 403 }
        );
      }
    }

    console.log('🔍 Menu kategorileri alınıyor...');

    // Get business profile from business_users.id → business_profiles.user_id
    // businessId can be either business_users.id OR business_profiles.id
    // Try both to support backward compatibility
    let profileId = businessId;
    
    // First check if it's a business_profiles.id
    const directProfileCheck = await sql`
      SELECT id FROM business_profiles WHERE id = ${businessId}
    `;
    
    if (directProfileCheck.length === 0) {
      // If not found, try as business_users.id
      const userToProfileResult = await sql`
        SELECT id FROM business_profiles WHERE user_id = ${businessId}
      `;
      
      if (userToProfileResult.length === 0) {
        console.log('❌ Business profile not found for businessId:', businessId);
        return NextResponse.json(
          { error: 'İşletme bulunamadı' },
          { status: 404 }
        );
      }
      
      profileId = userToProfileResult[0].id;
      console.log(`✅ Converted business_users.id ${businessId} → business_profiles.id ${profileId}`);
    }

    // Kategorileri getir - business_id kullan (business_profiles.id ile aynı)
    const categoriesResult = await sql`
      SELECT id, name, display_order, is_active, icon
      FROM business_menu_categories
      WHERE business_id = ${profileId}
      ORDER BY display_order ASC, name ASC
    `;

    // Tüm ürünleri getir (category_id üzerinden)
    const itemsResult = await sql`
      SELECT 
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
       WHERE mc.business_id = ${businessId}
       ORDER BY mi.display_order ASC, mi.name ASC
    `;

    console.log(`✅ Menu data loaded: ${categoriesResult.length} categories, ${itemsResult.length} items`);

    // Kategorilere ürünleri grupla
    const categoriesWithItems = categoriesResult.map(category => ({
      ...category,
      items: itemsResult.filter(item => item.category_id === category.id)
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithItems,
      totalItems: itemsResult.length,
      totalCategories: categoriesResult.length
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

    const result = await sql`
      INSERT INTO business_menu_items (
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
      ) VALUES (
        ${businessId},
        ${categoryId},
        ${name},
        ${description},
        ${price},
        ${originalPrice},
        ${imageUrl},
        ${allergens},
        ${dietaryInfo},
        ${preparationTime},
        ${calories},
        ${isFeatured}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      item: result[0],
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

