import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Location stats (rating, reviews) for sidebar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationIds = searchParams.get('locationIds'); // Comma-separated IDs

    if (!locationIds) {
      return NextResponse.json(
        { error: 'Location IDs required', success: false },
        { status: 400 }
      );
    }

    console.log('📊 Loading location stats for:', locationIds);

    // Convert comma-separated IDs to array
    const locationIdArray = locationIds.split(',').map(id => id.trim());
    
    // Get review stats for all locations at once - Using tagged template
    const stats = await sql`
      SELECT 
        location_id,
        COUNT(*) as total_reviews,
        COALESCE(ROUND(AVG(CASE WHEN rating > 0 THEN rating END), 1), 0) as avg_rating,
        COUNT(DISTINCT user_email) as unique_reviewers,
        COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
        COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
        COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
        MAX(created_at) as last_review_at
      FROM location_reviews
      WHERE location_id = ANY(${locationIdArray})
      GROUP BY location_id
    `;

    console.log(`✅ Found stats for ${stats.length} locations`);

    // Create stats map by location_id
    const statsMap = stats.reduce((acc: any, stat: any) => {
      acc[stat.location_id] = {
        rating: parseFloat(stat.avg_rating) || 0,
        reviewCount: parseInt(stat.total_reviews) || 0,
        uniqueReviewers: parseInt(stat.unique_reviewers) || 0,
        sentimentBreakdown: {
          positive: parseInt(stat.positive_count) || 0,
          negative: parseInt(stat.negative_count) || 0,
          neutral: parseInt(stat.neutral_count) || 0
        },
        lastReviewAt: stat.last_review_at
      };
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      stats: statsMap
    });

  } catch (error: any) {
    console.error('❌ Location stats error:', error);
    return NextResponse.json(
      { 
        error: 'Location stats yüklenemedi', 
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}