import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/food/orders
 * Kullanıcının siparişlerini listele
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status');

    let queryText = 'SELECT * FROM food_orders WHERE 1=1';
    const queryParams: any[] = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      queryText += ` AND user_id = $${paramCount}`;
      queryParams.push(userId);
    }

    if (businessId) {
      paramCount++;
      queryText += ` AND business_profile_id = $${paramCount}`;
      queryParams.push(businessId);
    }

    if (status) {
      paramCount++;
      queryText += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }

    queryText += ' ORDER BY order_time DESC LIMIT 100';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      orders: result.rows,
      count: result.rows.length
    });

  } catch (error: any) {
    console.error('❌ Orders list error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/food/orders
 * Yeni sipariş oluştur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      businessId,
      addressId,
      items,
      totalAmount,
      deliveryFee,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryNotes,
      paymentMethod
    } = body;

    if (!userId || !businessId || !items || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User ID, Business ID, and items are required'
      }, { status: 400 });
    }

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;

    // Teslimat süresi hesapla (business ayarlarından)
    const settingsResult = await query(
      'SELECT estimated_prep_time_minutes FROM business_delivery_settings WHERE business_profile_id = $1',
      [businessId]
    );

    const prepTime = settingsResult.rows[0]?.estimated_prep_time_minutes || 30;
    const estimatedDeliveryTime = new Date(Date.now() + prepTime * 60 * 1000);

    const finalAmount = totalAmount + deliveryFee;

    // Sipariş oluştur
    const result = await query(
      `INSERT INTO food_orders (
        order_number, user_id, business_profile_id, address_id,
        items, total_amount, delivery_fee, final_amount,
        customer_name, customer_phone, delivery_address, delivery_notes,
        payment_method, status, payment_status, estimated_delivery_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        orderNumber, userId, businessId, addressId,
        JSON.stringify(items), totalAmount, deliveryFee, finalAmount,
        customerName, customerPhone, deliveryAddress, deliveryNotes,
        paymentMethod || 'cash', 'pending', 'pending', estimatedDeliveryTime
      ]
    );

    // Sipariş durum geçmişine ekle
    await query(
      `INSERT INTO order_status_history (order_id, status, changed_by, notes)
      VALUES ($1, $2, $3, $4)`,
      [result.rows[0].id, 'pending', 'customer', 'Sipariş oluşturuldu']
    );

    // Sepeti temizle
    const cartResult = await query(
      'SELECT id FROM shopping_carts WHERE user_id = $1 AND business_profile_id = $2',
      [userId, businessId]
    );

    if (cartResult.rows.length > 0) {
      await query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
    }

    return NextResponse.json({
      success: true,
      order: result.rows[0]
    });

  } catch (error: any) {
    console.error('❌ Order create error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
