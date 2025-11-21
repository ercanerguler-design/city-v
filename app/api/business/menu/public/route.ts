import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Public Business Menu API
 * CityV anasayfasında işletme fiyatlarını göstermek için
 */

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

    console.log('🍽️ Public menu GET for businessId:', businessId);

    // Business bilgilerini çek
    const businessResult = await sql`
      SELECT bp.business_name, bp.business_type, bp.description, bp.logo_url, bp.address, bp.phone
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      WHERE bp.id = ${businessId} AND bu.is_active = true
    `;

    if (businessResult.length === 0) {
      console.log('❌ Business profile not found or inactive:', businessId);
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    const businessInfo = businessResult[0];
    console.log('✅ Business found:', businessInfo.business_name);

    // Kategorileri ve ürünleri çek
    const categoriesResult = await sql`
      SELECT id, name, icon, display_order
      FROM business_menu_categories
      WHERE business_id = ${businessId} AND is_active = true
      ORDER BY display_order ASC, name ASC
    `;

    console.log(`📋 Found ${categoriesResult.length} categories`);

    if (categoriesResult.length === 0) {
      return NextResponse.json({
        success: true,
        hasMenu: false,
        business: businessInfo,
        categories: []
      });
    }

    // Her kategori için ürünleri çek
    const categoriesWithItems = await Promise.all(
      categoriesResult.map(async (category) => {
        const itemsResult = await sql`
          SELECT id, name, description, price, original_price, image_url, is_available
          FROM business_menu_items
          WHERE category_id = ${category.id}
          ORDER BY display_order ASC, name ASC
        `;

        console.log(`  ${category.name}: ${itemsResult.length} items`);

        return {
          ...category,
          items: itemsResult
        };
      })
    );

    return NextResponse.json({
      success: true,
      hasMenu: true,
      business: businessInfo,
      categories: categoriesWithItems,
      totalItems: categoriesWithItems.reduce((sum, cat) => sum + cat.items.length, 0)
    });

  } catch (error: any) {
    console.error('❌ Public menu GET error:', error);
    return NextResponse.json(
      { error: 'Menü getirilemedi' },
      { status: 500 }
    );
  }
}
