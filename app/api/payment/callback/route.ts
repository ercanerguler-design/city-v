import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createPaymentProvider } from '@/lib/payment';

/**
 * POST /api/payment/callback
 * Ödeme callback'i - İyzico veya PayTR'dan dönen sonuç
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, status, provider = 'iyzico' } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' },
        { status: 400 }
      );
    }

    // Payment provider ile verify et
    const paymentProvider = createPaymentProvider(provider, true);
    const isValid = await paymentProvider.verifyPayment(token);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ödeme' },
        { status: 400 }
      );
    }

    // Sipariş durumunu güncelle
    const updateResult = await query(
      `UPDATE food_orders 
       SET payment_status = $1, 
           status = CASE WHEN $1 = 'completed' THEN 'preparing' ELSE status END,
           updated_at = NOW()
       WHERE payment_token = $2
       RETURNING *`,
      [status === 'success' ? 'completed' : 'failed', token]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    const order = updateResult.rows[0];

    // TODO: Business'a bildirim gönder
    // TODO: Kullanıcıya email/SMS gönder

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.payment_status
      }
    });

  } catch (error) {
    console.error('❌ Payment callback error:', error);
    return NextResponse.json(
      { success: false, error: 'Ödeme callback hatası' },
      { status: 500 }
    );
  }
}
