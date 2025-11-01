import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Favori ekle/kaldır
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, location, action = 'add', userEmail, source = 'map' } = body;

    if (!businessId || !location) {
      return NextResponse.json(
        { error: 'businessId ve location gerekli' },
        { status: 400 }
      );
    }

    console.log(`⭐ Favorite ${action} for business:`, businessId, 'location:', location.id);

    if (action === 'remove') {
      // Favoriden kaldır
      await query(
        `DELETE FROM business_favorites 
         WHERE business_id = $1 AND location_id = $2`,
        [businessId, location.id]
      );

      console.log('✅ Favorite removed successfully');
      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Favoriye ekle
      const result = await query(
        `INSERT INTO business_favorites 
         (business_id, location_id, location_name, location_category, location_address, location_coordinates, user_email, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (business_id, location_id) DO NOTHING
         RETURNING id`,
        [
          businessId,
          location.id,
          location.name,
          location.category,
          location.address || '',
          JSON.stringify(location.coordinates),
          userEmail || null,
          source
        ]
      );

      // Toplam favori sayısını al
      const countResult = await query(
        `SELECT COUNT(*) as total FROM business_favorites WHERE business_id = $1`,
        [businessId]
      );

      const totalFavorites = parseInt(countResult.rows[0]?.total || '0');

      console.log('✅ Favorite added successfully, total:', totalFavorites);
      return NextResponse.json({ 
        success: true, 
        action: 'added',
        totalFavorites 
      });
    }
  } catch (error: any) {
    console.error('❌ Favorite tracking error:', error);
    return NextResponse.json(
      { error: 'Favori işlemi başarısız', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Favori istatistiklerini al
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId gerekli' },
        { status: 400 }
      );
    }

    console.log('📊 Loading favorites for business:', businessId);

    // Toplam istatistikler
    const statsResult = await query(
      `SELECT * FROM business_favorites_stats WHERE business_id = $1`,
      [businessId]
    );

    const stats = statsResult.rows[0] || {
      total_favorites: 0,
      today_favorites: 0,
      week_favorites: 0,
      month_favorites: 0,
      cafe_favorites: 0,
      restaurant_favorites: 0,
      bank_favorites: 0
    };

    // Son favoriler (detaylı)
    const favoritesResult = await query(
      `SELECT 
        id,
        location_id,
        location_name,
        location_category,
        location_address,
        location_coordinates,
        added_at,
        source
       FROM business_favorites
       WHERE business_id = $1
       ORDER BY added_at DESC
       LIMIT 50`,
      [businessId]
    );

    // Kategori dağılımı
    const categoryBreakdown = await query(
      `SELECT 
        location_category,
        COUNT(*) as count
       FROM business_favorites
       WHERE business_id = $1
       GROUP BY location_category
       ORDER BY count DESC`,
      [businessId]
    );

    // Günlük trend (son 7 gün)
    const dailyTrend = await query(
      `SELECT 
        DATE(added_at) as date,
        COUNT(*) as count
       FROM business_favorites
       WHERE business_id = $1 
       AND added_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(added_at)
       ORDER BY date DESC`,
      [businessId]
    );

    console.log('✅ Favorites loaded:', {
      total: stats.total_favorites,
      today: stats.today_favorites
    });

    return NextResponse.json({
      totalFavorites: parseInt(stats.total_favorites),
      todayFavorites: parseInt(stats.today_favorites),
      weekFavorites: parseInt(stats.week_favorites),
      monthFavorites: parseInt(stats.month_favorites),
      categoryBreakdown: categoryBreakdown.rows,
      dailyTrend: dailyTrend.rows,
      recentFavorites: favoritesResult.rows,
      stats: {
        cafe: parseInt(stats.cafe_favorites || 0),
        restaurant: parseInt(stats.restaurant_favorites || 0),
        bank: parseInt(stats.bank_favorites || 0)
      }
    });
  } catch (error: any) {
    console.error('❌ Favorites loading error:', error);
    return NextResponse.json(
      { error: 'Favoriler yüklenemedi', details: error.message },
      { status: 500 }
    );
  }
}
