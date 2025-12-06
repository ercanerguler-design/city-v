import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz durum' },
        { status: 400 }
      );
    }

    // Update order status
    const result = await query(
      `UPDATE food_orders 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, orderId]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result[0]
    });

  } catch (error) {
    console.error('❌ Order update error:', error);
    return NextResponse.json(
      { success: false, error: 'Sipariş güncellenemedi' },
      { status: 500 }
    );
  }
}
