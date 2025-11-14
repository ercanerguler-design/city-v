import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required', success: false },
        { status: 400 }
      );
    }

    // business_favorites_stats view'ini kullan
    const result = await query(
      `SELECT 
        COALESCE(total_favorites, 0) as "totalFavorites",
        COALESCE(today_favorites, 0) as "todayFavorites",
        COALESCE(week_favorites, 0) as "weekFavorites",
        COALESCE(month_favorites, 0) as "monthFavorites",
        COALESCE(cafe_favorites, 0) as "cafeFavorites",
        COALESCE(restaurant_favorites, 0) as "restaurantFavorites",
        COALESCE(bank_favorites, 0) as "bankFavorites"
      FROM business_favorites_stats
      WHERE business_id = $1`,
      [businessId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        totalFavorites: 0,
        todayFavorites: 0,
        weekFavorites: 0,
        monthFavorites: 0,
        cafeFavorites: 0,
        restaurantFavorites: 0,
        bankFavorites: 0
      });
    }

    return NextResponse.json({
      success: true,
      ...result.rows[0]
    });
  } catch (error) {
    console.error('❌ Favorites stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load favorites stats', success: false },
      { status: 500 }
    );
  }
}
