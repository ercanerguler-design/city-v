import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Business Notifications API
 * İşletmelere gelen yorum, favori bildirimleri
 */

// GET - Bildirimleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUserId = searchParams.get('businessUserId');
    const limit = searchParams.get('limit') || '50';
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'businessUserId gerekli' },
        { status: 400 }
      );
    }

    console.log(`🔔 Fetching notifications for business user ${businessUserId}`);

    // Build query
    let queryText = `
      SELECT 
        id,
        type,
        title,
        message,
        data,
        is_read,
        created_at
      FROM business_notifications
      WHERE business_user_id = $1
    `;

    if (unreadOnly) {
      queryText += ` AND is_read = false`;
    }

    queryText += `
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await query(queryText, [businessUserId, parseInt(limit)]);

    // Get unread count
    const unreadResult = await query(
      `SELECT COUNT(*) as unread_count
       FROM business_notifications
       WHERE business_user_id = $1 AND is_read = false`,
      [businessUserId]
    );

    console.log(`✅ Found ${result.rows.length} notifications (${unreadResult.rows[0].unread_count} unread)`);

    return NextResponse.json({
      success: true,
      notifications: result.rows,
      unreadCount: parseInt(unreadResult.rows[0].unread_count)
    });

  } catch (error: any) {
    console.error('❌ Notifications GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirimler getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Bildirimi okundu olarak işaretle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, notificationIds, markAllRead, businessUserId } = body;

    if (markAllRead && businessUserId) {
      // Tüm bildirimleri okundu işaretle
      await query(
        `UPDATE business_notifications
         SET is_read = true
         WHERE business_user_id = $1 AND is_read = false`,
        [businessUserId]
      );

      return NextResponse.json({
        success: true,
        message: 'Tüm bildirimler okundu olarak işaretlendi'
      });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Birden fazla bildirimi okundu işaretle
      await query(
        `UPDATE business_notifications
         SET is_read = true
         WHERE id = ANY($1::int[])`,
        [notificationIds]
      );

      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} bildirim okundu olarak işaretlendi`
      });
    }

    if (notificationId) {
      // Tek bir bildirimi okundu işaretle
      await query(
        `UPDATE business_notifications
         SET is_read = true
         WHERE id = $1`,
        [notificationId]
      );

      return NextResponse.json({
        success: true,
        message: 'Bildirim okundu olarak işaretlendi'
      });
    }

    return NextResponse.json(
      { success: false, error: 'notificationId, notificationIds veya markAllRead gerekli' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ Notifications POST error:', error);
    return NextResponse.json(
      { success: false, error: 'İşlem yapılamadı' },
      { status: 500 }
    );
  }
}

// DELETE - Bildirimi sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'notificationId gerekli' },
        { status: 400 }
      );
    }

    await query(
      `DELETE FROM business_notifications WHERE id = $1`,
      [notificationId]
    );

    return NextResponse.json({
      success: true,
      message: 'Bildirim silindi'
    });

  } catch (error: any) {
    console.error('❌ Notifications DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Bildirim silinemedi' },
      { status: 500 }
    );
  }
}

