import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * DELETE /api/food/cart/items/[itemId]
 * Sepetten ürün sil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;

    await query('DELETE FROM cart_items WHERE id = $1', [itemId]);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error: any) {
    console.error('❌ Cart item delete error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * PATCH /api/food/cart/items/[itemId]
 * Sepetteki ürün miktarını güncelle
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json({
        success: false,
        error: 'Valid quantity is required'
      }, { status: 400 });
    }

    const result = await query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [quantity, itemId]
    );

    return NextResponse.json({
      success: true,
      item: result.rows[0]
    });

  } catch (error: any) {
    console.error('❌ Cart item update error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
