import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Business View Tracking API
 * POST /api/business/track-view
 * Body: { businessId: number, source: 'map' | 'list' | 'search' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, location, source = 'map' } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    console.log('👁️ View tracking:', { businessId, location: location?.name, source });

    // business_views tablosuna location bilgileriyle kaydet
    const result = await query(
      `INSERT INTO business_views 
       (business_id, location_id, location_name, location_category, source, viewed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [
        businessId, 
        location?.id || null,
        location?.name || null,
        location?.category || null,
        source
      ]
    );

    // Toplam görüntülenme sayısını güncelle
    const countResult = await query(
      `SELECT COUNT(*) as total_views
       FROM business_views
       WHERE business_id = $1`,
      [businessId]
    );

    const totalViews = parseInt(countResult.rows[0]?.total_views || 0);

    console.log('✅ View tracked successfully:', { businessId, location: location?.name, totalViews });

    return NextResponse.json({
      success: true,
      totalViews,
      message: 'Görüntülenme kaydedildi'
    });

  } catch (error: any) {
    console.error('❌ Track view error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * Get Business View Stats
 * GET /api/business/track-view?businessId=123
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    // Toplam görüntülenme
    const totalResult = await query(
      `SELECT COUNT(*) as total_views
       FROM business_views
       WHERE business_id = $1`,
      [businessId]
    );

    // Bugünkü görüntülenme
    const todayResult = await query(
      `SELECT COUNT(*) as today_views
       FROM business_views
       WHERE business_id = $1 
         AND DATE(viewed_at) = CURRENT_DATE`,
      [businessId]
    );

    // Son 7 günün günlük görüntülenmeleri
    const weeklyResult = await query(
      `SELECT 
        DATE(viewed_at) as date,
        COUNT(*) as views
       FROM business_views
       WHERE business_id = $1 
         AND viewed_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(viewed_at)
       ORDER BY date DESC`,
      [businessId]
    );

    // Kaynak bazlı dağılım
    const sourceResult = await query(
      `SELECT 
        source,
        COUNT(*) as views
       FROM business_views
       WHERE business_id = $1
       GROUP BY source`,
      [businessId]
    );

    // En çok görüntülenen lokasyonlar
    const topLocationsResult = await query(
      `SELECT 
        location_id,
        location_name,
        location_category,
        COUNT(*) as view_count
       FROM business_views
       WHERE business_id = $1 
         AND location_id IS NOT NULL
       GROUP BY location_id, location_name, location_category
       ORDER BY view_count DESC
       LIMIT 10`,
      [businessId]
    );

    return NextResponse.json({
      success: true,
      totalViews: parseInt(totalResult.rows[0]?.total_views || 0),
      todayViews: parseInt(todayResult.rows[0]?.today_views || 0),
      weeklyViews: weeklyResult.rows.map(row => ({
        date: row.date,
        views: parseInt(row.views || 0)
      })),
      sourceBreakdown: sourceResult.rows.map(row => ({
        source: row.source,
        views: parseInt(row.views || 0)
      })),
      topLocations: topLocationsResult.rows.map(row => ({
        locationId: row.location_id,
        locationName: row.location_name,
        category: row.location_category,
        viewCount: parseInt(row.view_count || 0)
      }))
    });

  } catch (error: any) {
    console.error('❌ Get view stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

