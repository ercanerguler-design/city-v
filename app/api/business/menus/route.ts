import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

// Menü oluştur
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: number;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, menuName, menuType, items } = body;

    // Menü oluştur
    const menuResult = await query(
      `INSERT INTO business_menus (business_id, menu_name, menu_type, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id`,
      [businessId, menuName, menuType || 'food']
    );

    const menuId = menuResult.rows[0].id;

    // Menü ürünlerini ekle
    if (items && items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO menu_items (
            menu_id, item_name, description, price, currency,
            image_url, category, is_available, allergens, calories, preparation_time
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            menuId,
            item.itemName,
            item.description || null,
            item.price,
            item.currency || 'TRY',
            item.imageUrl || null,
            item.category || null,
            item.isAvailable !== false,
            item.allergens || null,
            item.calories || null,
            item.preparationTime || null
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      menuId,
      message: 'Menü başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('❌ Menü oluşturma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// Menüleri listele
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID gerekli' }, { status: 400 });
    }

    // Menüleri ve ürünleri getir
    const menusResult = await query(
      `SELECT * FROM business_menus WHERE business_id = $1 AND is_active = true ORDER BY display_order, created_at`,
      [businessId]
    );

    const menus = await Promise.all(
      menusResult.rows.map(async (menu) => {
        const itemsResult = await query(
          `SELECT * FROM menu_items WHERE menu_id = $1 AND is_available = true ORDER BY display_order, created_at`,
          [menu.id]
        );

        return {
          ...menu,
          items: itemsResult.rows
        };
      })
    );

    return NextResponse.json({
      success: true,
      menus
    });

  } catch (error) {
    console.error('❌ Menü listeleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// Menü sil
export async function DELETE(req: NextRequest) {
  try {
    // Auth kontrolü
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const menuId = searchParams.get('menuId');

    if (!menuId) {
      return NextResponse.json({ success: false, error: 'Menu ID gerekli' }, { status: 400 });
    }

    console.log('🗑️ Deleting menu:', menuId);

    // Menü sil (CASCADE ile items de silinir)
    const result = await query(
      `DELETE FROM business_menus WHERE id = $1 RETURNING menu_name`,
      [menuId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Menü bulunamadı' }, { status: 404 });
    }

    console.log('✅ Menu deleted:', result.rows[0].menu_name);

    return NextResponse.json({
      success: true,
      message: `${result.rows[0].menu_name} menüsü silindi`
    });

  } catch (error: any) {
    console.error('❌ Menü silme hatası:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

