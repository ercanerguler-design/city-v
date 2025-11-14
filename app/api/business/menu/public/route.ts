import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

    // Business bilgilerini çek
    const businessResult = await query(
      `SELECT bp.business_name, bp.business_type, bp.description, bp.logo_url, bp.address, bp.phone
       FROM business_profiles bp
       INNER JOIN business_users bu ON bp.user_id = bu.id
       WHERE bp.id = $1 AND bu.is_active = true`,
      [businessId]
    );

    if (businessResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    const businessInfo = businessResult.rows[0];

    // Kategorileri ve ürünleri çek
    const categoriesResult = await query(
      `SELECT id, name, icon, display_order
       FROM business_menu_categories
       WHERE business_id = $1 AND is_active = true
       ORDER BY display_order ASC, name ASC`,
      [businessId]
    );

    if (categoriesResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        hasMenu: false,
        business: businessInfo,
        categories: []
      });
    }

    // Her kategori için ürünleri çek
    const categoriesWithItems = await Promise.all(
      categoriesResult.rows.map(async (category) => {
        const itemsResult = await query(
          `SELECT id, name, description, price, original_price, image_url, is_available
           FROM business_menu_items
           WHERE category_id = $1
           ORDER BY display_order ASC, name ASC`,
          [category.id]
        );

        return {
          ...category,
          items: itemsResult.rows
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
