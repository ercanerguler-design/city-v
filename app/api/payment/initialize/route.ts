import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createPaymentProvider, PaymentRequest } from '@/lib/payment';

/**
 * POST /api/payment/initialize
 * Ödeme işlemini başlat - İyzico veya PayTR
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, provider = 'iyzico' } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID gerekli' },
        { status: 400 }
      );
    }

    // Sipariş bilgilerini al
    const orderResult = await query(
      `SELECT 
        o.*,
        u.email as user_email,
        bp.business_name
      FROM food_orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN business_profiles bp ON o.business_profile_id = bp.id
      WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    // Ödeme isteği hazırla
    const paymentRequest: PaymentRequest = {
      orderId: order.id,
      amount: parseFloat(order.total_amount),
      currency: 'TRY',
      customerName: order.customer_name,
      customerEmail: order.user_email || 'guest@cityv.app',
      customerPhone: order.customer_phone,
      customerAddress: order.delivery_address,
      items: order.items || []
    };

    // Payment provider seç (İyzico veya PayTR)
    const paymentProvider = createPaymentProvider(provider, true); // testMode: true

    // Ödemeyi başlat
    const paymentResponse = await paymentProvider.createPayment(paymentRequest);

    if (!paymentResponse.success) {
      return NextResponse.json(
        { success: false, error: paymentResponse.errorMessage },
        { status: 500 }
      );
    }

    // Ödeme token'ı veritabanına kaydet
    await query(
      `UPDATE food_orders 
       SET payment_token = $1, payment_status = 'pending'
       WHERE id = $2`,
      [paymentResponse.token, orderId]
    );

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.paymentUrl,
      token: paymentResponse.token
    });

  } catch (error) {
    console.error('❌ Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Ödeme başlatılamadı' },
      { status: 500 }
    );
  }
}
