import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/food/cart
 * Kullanıcının aktif sepetini getir
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const businessId = searchParams.get('businessId');

    if (!userId || !businessId) {
      return NextResponse.json({
        success: false,
        error: 'User ID and Business ID are required'
      }, { status: 400 });
    }

    // Sepeti bul veya oluştur
    let cartResult = await query(
      'SELECT * FROM shopping_carts WHERE user_id = $1 AND business_profile_id = $2',
      [userId, businessId]
    );

    if (cartResult.rows.length === 0) {
      // Sepet yoksa oluştur
      cartResult = await query(
        'INSERT INTO shopping_carts (user_id, business_profile_id) VALUES ($1, $2) RETURNING *',
        [userId, businessId]
      );
    }

    const cart = cartResult.rows[0];

    // Sepet içeriğini getir (menu item detayları ile)
    const itemsResult = await query(
      `SELECT 
        ci.*,
        bmi.item_name,
        bmi.description,
        bmi.category,
        bmi.image_url
      FROM cart_items ci
      LEFT JOIN business_menu_items bmi ON ci.menu_item_id = bmi.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC`,
      [cart.id]
    );

    // Toplam hesapla
    const subtotal = itemsResult.rows.reduce((sum, item) => 
      sum + (item.unit_price * item.quantity), 0
    );

    // Business teslimat ayarları
    const deliverySettings = await query(
      'SELECT * FROM business_delivery_settings WHERE business_profile_id = $1',
      [businessId]
    );

    const settings = deliverySettings.rows[0] || {
      delivery_fee: 10.00,
      min_order_amount: 0
    };

    const deliveryFee = subtotal >= (settings.free_delivery_threshold || 999999) 
      ? 0 
      : settings.delivery_fee;

    return NextResponse.json({
      success: true,
      cart: {
        ...cart,
        items: itemsResult.rows,
        total_items: itemsResult.rows.length,
        subtotal,
        delivery_fee: deliveryFee,
        final_total: subtotal + deliveryFee
      }
    });

  } catch (error: any) {
    console.error('❌ Cart get error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/food/cart
 * Sepete ürün ekle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, businessId, menuItemId, quantity, unitPrice, notes } = body;

    if (!userId || !businessId || !menuItemId) {
      return NextResponse.json({
        success: false,
        error: 'User ID, Business ID, and Menu Item ID are required'
      }, { status: 400 });
    }

    // Sepeti bul veya oluştur
    let cartResult = await query(
      'SELECT * FROM shopping_carts WHERE user_id = $1 AND business_profile_id = $2',
      [userId, businessId]
    );

    if (cartResult.rows.length === 0) {
      cartResult = await query(
        'INSERT INTO shopping_carts (user_id, business_profile_id) VALUES ($1, $2) RETURNING *',
        [userId, businessId]
      );
    }

    const cartId = cartResult.rows[0].id;

    // Aynı ürün zaten sepette mi?
    const existingItem = await query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND menu_item_id = $2',
      [cartId, menuItemId]
    );

    if (existingItem.rows.length > 0) {
      // Miktarı güncelle
      const result = await query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [quantity || 1, existingItem.rows[0].id]
      );

      return NextResponse.json({
        success: true,
        item: result.rows[0],
        action: 'updated'
      });
    } else {
      // Yeni ürün ekle
      const result = await query(
        `INSERT INTO cart_items (cart_id, menu_item_id, quantity, unit_price, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [cartId, menuItemId, quantity || 1, unitPrice, notes]
      );

      return NextResponse.json({
        success: true,
        item: result.rows[0],
        action: 'added'
      });
    }

  } catch (error: any) {
    console.error('❌ Cart add error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * DELETE /api/food/cart
 * Sepeti temizle
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const businessId = searchParams.get('businessId');

    if (!userId || !businessId) {
      return NextResponse.json({
        success: false,
        error: 'User ID and Business ID are required'
      }, { status: 400 });
    }

    // Sepeti bul
    const cartResult = await query(
      'SELECT * FROM shopping_carts WHERE user_id = $1 AND business_profile_id = $2',
      [userId, businessId]
    );

    if (cartResult.rows.length === 0) {
      return NextResponse.json({ success: true, message: 'Cart already empty' });
    }

    // Sepetteki tüm ürünleri sil
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);

    return NextResponse.json({
      success: true,
      message: 'Cart cleared'
    });

  } catch (error: any) {
    console.error('❌ Cart clear error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
