import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const { businessUserId } = await request.json();

    if (!businessUserId) {
      return NextResponse.json(
        { error: 'Business User ID gerekli' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🧹 FULL CLEANUP for business user ${businessUserId}...`);

    // 1. IoT AI Analysis
    const iotResult = await sql`
      DELETE FROM iot_crowd_analysis 
      WHERE camera_id IN (
        SELECT id FROM business_cameras WHERE business_user_id = ${businessUserId}
      )
    `;

    // 2. IoT Crowd Analysis
    const crowdResult = await sql`
      DELETE FROM iot_crowd_analysis 
      WHERE camera_id IN (
        SELECT id FROM business_cameras WHERE business_user_id = ${businessUserId}
      )
    `;

    // 3. Daily Summaries
    const summaryResult = await sql`
      DELETE FROM daily_business_summaries 
      WHERE business_user_id = ${businessUserId}
    `;

    // 4. Business Interactions (reviews, sentiments)
    const interactionsResult = await sql`
      DELETE FROM business_interactions 
      WHERE business_user_id = ${businessUserId}
    `;

    // 5. Location Reviews (eğer location_id ile ilişkiliyse)
    const reviewsResult = await sql`
      DELETE FROM location_reviews 
      WHERE location_id IN (
        SELECT location_id FROM business_profiles WHERE user_id = ${businessUserId}
      )
    `;

    console.log('✅ Full cleanup completed:', {
      iotRecords: iotResult.rowCount,
      crowdRecords: crowdResult.rowCount,
      summaries: summaryResult.rowCount,
      interactions: interactionsResult.rowCount,
      reviews: reviewsResult.rowCount
    });

    return NextResponse.json({
      success: true,
      message: 'Full business data cleanup completed',
      deleted: {
        iotRecords: iotResult.rowCount,
        crowdRecords: crowdResult.rowCount,
        summaries: summaryResult.rowCount,
        interactions: interactionsResult.rowCount,
        reviews: reviewsResult.rowCount
      }
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
