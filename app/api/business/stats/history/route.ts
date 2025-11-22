import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/business/stats/history
 * Business kullanıcısının geçmiş günlük istatistiklerini getir
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUserId = searchParams.get('businessUserId');
    const days = parseInt(searchParams.get('days') || '30'); // Son 30 gün

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'businessUserId gerekli' },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching stats history for user ${businessUserId}, last ${days} days`);

    const result = await sql`
      SELECT 
        stat_date,
        total_visitors,
        total_entries,
        total_exits,
        peak_occupancy,
        avg_occupancy,
        total_cameras_active,
        busiest_hour,
        busiest_hour_count,
        favorites_added,
        archived_at
      FROM business_daily_stats
      WHERE business_user_id = ${businessUserId}
        AND stat_date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY stat_date DESC
    `;

    console.log(`✅ ${result.rows.length} günlük kayıt bulundu`);

    return NextResponse.json({
      success: true,
      history: result.rows,
      count: result.rows.length
    });

  } catch (error: any) {
    console.error('❌ Stats history fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'İstatistikler getirilemedi', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/business/stats/history
 * Manuel olarak bugünkü verileri arşivle (test için)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessUserId } = body;

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'businessUserId gerekli' },
        { status: 400 }
      );
    }

    console.log(`📦 Manual archiving for user ${businessUserId}`);

    // Bugünkü istatistikleri hesapla
    const stats = await sql`
      SELECT 
        COALESCE(SUM(ia.person_count), 0)::INTEGER as total_visitors,
        COALESCE(SUM((ia.detection_objects->>'people_in')::INTEGER), 0)::INTEGER as total_entries,
        COALESCE(SUM((ia.detection_objects->>'people_out')::INTEGER), 0)::INTEGER as total_exits,
        COALESCE(MAX(ia.person_count), 0)::INTEGER as peak_occupancy,
        COALESCE(AVG(ia.person_count), 0)::NUMERIC as avg_occupancy,
        COUNT(DISTINCT bc.id)::INTEGER as active_cameras
      FROM iot_ai_analysis ia
      JOIN business_cameras bc ON ia.camera_id = bc.id
      WHERE bc.business_user_id = ${businessUserId}
        AND DATE(ia.created_at) = CURRENT_DATE
    `;

    const statData = stats.rows[0];

    // Arşivle
    await sql`
      INSERT INTO business_daily_stats (
        business_user_id,
        stat_date,
        total_visitors,
        total_entries,
        total_exits,
        peak_occupancy,
        avg_occupancy,
        total_cameras_active,
        archived_at
      ) VALUES (
        ${businessUserId},
        CURRENT_DATE,
        ${statData.total_visitors},
        ${statData.total_entries},
        ${statData.total_exits},
        ${statData.peak_occupancy},
        ${statData.avg_occupancy},
        ${statData.active_cameras},
        NOW()
      )
      ON CONFLICT (business_user_id, stat_date) 
      DO UPDATE SET
        total_visitors = EXCLUDED.total_visitors,
        total_entries = EXCLUDED.total_entries,
        total_exits = EXCLUDED.total_exits,
        peak_occupancy = EXCLUDED.peak_occupancy,
        avg_occupancy = EXCLUDED.avg_occupancy,
        total_cameras_active = EXCLUDED.total_cameras_active,
        archived_at = NOW()
    `;

    console.log(`✅ Stats archived for user ${businessUserId}`);

    return NextResponse.json({
      success: true,
      message: 'Bugünkü veriler arşivlendi',
      stats: statData
    });

  } catch (error: any) {
    console.error('❌ Manual archive error:', error);
    return NextResponse.json(
      { success: false, error: 'Arşivleme başarısız', details: error.message },
      { status: 500 }
    );
  }
}

