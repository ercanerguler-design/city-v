import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Bildirim İşaretleme API
 * - POST: Tek bildirimi okundu işaretle
 * - PUT: Tüm bildirimleri okundu işaretle
 * - DELETE: Bildirimleri temizle
 */

// Tek bildirimi okundu işaretle
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID gerekli' },
        { status: 400 }
      );
    }

    // push_notifications tablosunda is_read sütunu yoksa ekleyelim
    // Önce sütunun var olup olmadığını kontrol et
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'push_notifications' 
      AND column_name = 'is_read'
    `;

    if (columnCheck.rows.length === 0) {
      // is_read sütunu yoksa ekle
      await sql`
        ALTER TABLE push_notifications 
        ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false
      `;
      console.log('✅ is_read sütunu eklendi');
    }

    // Bildirimi okundu işaretle
    await sql`
      UPDATE push_notifications 
      SET is_read = true 
      WHERE id = ${notificationId}
    `;

    console.log(`✅ Notification ${notificationId} marked as read`);

    return NextResponse.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi'
    });

  } catch (error: any) {
    console.error('❌ Mark as read error:', error);
    return NextResponse.json(
      { error: 'Bildirim işaretlenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// Tüm bildirimleri okundu işaretle
export async function PUT(req: NextRequest) {
  try {
    // Tüm bildirimleri okundu işaretle
    await sql`
      UPDATE push_notifications 
      SET is_read = true 
      WHERE is_read = false OR is_read IS NULL
    `;

    console.log('✅ All notifications marked as read');

    return NextResponse.json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi'
    });

  } catch (error: any) {
    console.error('❌ Mark all as read error:', error);
    return NextResponse.json(
      { error: 'Bildirimler işaretlenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// Bildirimleri temizle (okunmuş olanları sil)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clearAll = searchParams.get('all') === 'true';

    if (clearAll) {
      // Tüm bildirimleri sil
      await sql`DELETE FROM push_notifications`;
      console.log('✅ All notifications deleted');
    } else {
      // Sadece okunmuş bildirimleri sil
      await sql`DELETE FROM push_notifications WHERE is_read = true`;
      console.log('✅ Read notifications deleted');
    }

    return NextResponse.json({
      success: true,
      message: clearAll ? 'Tüm bildirimler temizlendi' : 'Okunmuş bildirimler temizlendi'
    });

  } catch (error: any) {
    console.error('❌ Delete notifications error:', error);
    return NextResponse.json(
      { error: 'Bildirimler silinemedi', details: error.message },
      { status: 500 }
    );
  }
}
