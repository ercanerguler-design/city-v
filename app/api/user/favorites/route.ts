import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Kullanıcı Favorileri API
 * Giriş yapmış kullanıcılar için favori yönetimi
 */

// GET - Kullanıcının favorilerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID gerekli' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT location_id
       FROM user_favorites
       WHERE user_id = $1
       ORDER BY added_at DESC`,
      [userId]
    );

    const favorites = result.rows.map(row => row.location_id);

    return NextResponse.json({
      success: true,
      favorites
    });

  } catch (error: any) {
    console.error('❌ Favorites GET error:', error);
    return NextResponse.json(
      { error: 'Favoriler getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Favori ekle/çıkar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, locationId, action } = body;

    if (!userId || !locationId || !action) {
      return NextResponse.json(
        { error: 'User ID, location ID ve action gerekli' },
        { status: 400 }
      );
    }

    if (action === 'add') {
      // Favori ekle (duplicate kontrolü ON CONFLICT ile)
      const favoriteResult = await query(
        `INSERT INTO user_favorites (user_id, location_id, added_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id, location_id) DO NOTHING
         RETURNING id`,
        [userId, locationId]
      );

      // 🔔 Create notification for business owner (only if not duplicate)
      if (favoriteResult.rows.length > 0) {
        try {
          // Get user name
          const userResult = await query(
            `SELECT name, full_name, email FROM users WHERE id = $1`,
            [userId]
          );
          const userName = userResult.rows[0]?.full_name || userResult.rows[0]?.name || 'Bir kullanıcı';

          // Find business_user_id from location_id
          const businessResult = await query(
            `SELECT bp.user_id, bp.business_name
             FROM business_profiles bp
             WHERE bp.location_id = $1`,
            [locationId]
          );

          if (businessResult.rows.length > 0) {
            const businessUserId = businessResult.rows[0].user_id;
            const businessName = businessResult.rows[0].business_name;

            await query(
              `INSERT INTO business_notifications (
                business_user_id, type, title, message, data
              ) VALUES ($1, $2, $3, $4, $5)`,
              [
                businessUserId,
                'favorite',
                'Yeni Favori!',
                `${userName}, ${businessName} işletmenizi favorilerine ekledi ❤️`,
                JSON.stringify({
                  locationId,
                  userId,
                  userName
                })
              ]
            );

            console.log(`🔔 Favorite notification created for business user ${businessUserId}`);
          }
        } catch (notifError) {
          // Don't fail the favorite if notification fails
          console.error('⚠️ Notification creation failed:', notifError.message);
        }
      }

      return NextResponse.json({
        success: true,
        action: 'added',
        message: 'Favorilere eklendi'
      });

    } else if (action === 'remove') {
      // Favori çıkar
      await query(
        `DELETE FROM user_favorites
         WHERE user_id = $1 AND location_id = $2`,
        [userId, locationId]
      );

      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Favorilerden çıkarıldı'
      });

    } else {
      return NextResponse.json(
        { error: 'Geçersiz action. add veya remove olmalı' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('❌ Favorites POST error:', error);
    return NextResponse.json(
      { error: 'İşlem yapılamadı' },
      { status: 500 }
    );
  }
}
