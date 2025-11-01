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
      await query(
        `INSERT INTO user_favorites (user_id, location_id, added_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id, location_id) DO NOTHING`,
        [userId, locationId]
      );

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
