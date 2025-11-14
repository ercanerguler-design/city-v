import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Business'ın sentiment istatistiklerini getir
export async function GET(request: NextRequest) {
  try {
    const businessUserId = request.nextUrl.searchParams.get('businessUserId');
    const timeRange = request.nextUrl.searchParams.get('timeRange') || '24h'; // 24h, 7d, 30d

    if (!businessUserId) {
      return NextResponse.json({ error: 'businessUserId gerekli' }, { status: 400 });
    }

    // Zaman aralığı hesapla
    let intervalQuery = "INTERVAL '24 hours'";
    if (timeRange === '7d') intervalQuery = "INTERVAL '7 days'";
    if (timeRange === '30d') intervalQuery = "INTERVAL '30 days'";

    // Sentiment istatistikleri
    const statsResult = await query(`
      SELECT 
        sentiment,
        COUNT(*) as count
      FROM business_interactions
      WHERE business_user_id = $1
        AND interaction_type = 'sentiment'
        AND sentiment IS NOT NULL
        AND created_at >= NOW() - ${intervalQuery}
      GROUP BY sentiment
      ORDER BY count DESC
    `, [businessUserId]);

    // Son sentimentler (detaylı)
    const recentResult = await query(`
      SELECT 
        id,
        sentiment,
        location_id,
        user_email,
        created_at
      FROM business_interactions
      WHERE business_user_id = $1
        AND interaction_type = 'sentiment'
        AND sentiment IS NOT NULL
        AND created_at >= NOW() - ${intervalQuery}
      ORDER BY created_at DESC
      LIMIT 50
    `, [businessUserId]);

    // Toplam sentiment sayısı
    const totalResult = await query(`
      SELECT COUNT(*) as total
      FROM business_interactions
      WHERE business_user_id = $1
        AND interaction_type = 'sentiment'
        AND sentiment IS NOT NULL
        AND created_at >= NOW() - ${intervalQuery}
    `, [businessUserId]);

    // Sentiment dağılımı
    const stats = {
      happy: 0,
      neutral: 0,
      sad: 0,
      angry: 0
    };

    statsResult.rows.forEach(row => {
      if (row.sentiment === 'happy') stats.happy = parseInt(row.count);
      if (row.sentiment === 'neutral') stats.neutral = parseInt(row.count);
      if (row.sentiment === 'sad') stats.sad = parseInt(row.count);
      if (row.sentiment === 'angry') stats.angry = parseInt(row.count);
    });

    return NextResponse.json({
      success: true,
      timeRange,
      totalSentiments: parseInt(totalResult.rows[0]?.total || '0'),
      stats,
      recent: recentResult.rows
    });

  } catch (error) {
    console.error('❌ Business sentiment API error:', error);
    return NextResponse.json(
      { error: 'Sentiment verileri alınamadı' },
      { status: 500 }
    );
  }
}
