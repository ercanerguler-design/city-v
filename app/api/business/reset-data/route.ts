import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * OPTIONS endpoint - Handle CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * DELETE endpoint - Reset business IoT data
 * Only for testing - removes all IoT analysis data for a business
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUserId = searchParams.get('businessUserId');

    if (!businessUserId) {
      return NextResponse.json(
        { error: 'Business User ID gerekli' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🗑️  Resetting data for business user ${businessUserId}...`);

    // 1. Delete all IoT AI analysis data
    const iotResult = await sql`
      DELETE FROM iot_crowd_analysis 
      WHERE camera_id IN (
        SELECT id FROM business_cameras WHERE business_user_id = ${businessUserId}
      )
    `;

    // 2. Delete daily summaries
    const summaryResult = await sql`
      DELETE FROM daily_business_summaries 
      WHERE business_user_id = ${businessUserId}
    `;

    console.log('✅ Data reset completed:', {
      iotRecords: iotResult.rowCount,
      summaries: summaryResult.rowCount
    });

    return NextResponse.json({
      success: true,
      message: 'Business data reset successfully',
      deleted: {
        iotRecords: iotResult.rowCount,
        summaries: summaryResult.rowCount
      }
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ Reset error:', error);
    return NextResponse.json(
      { error: 'Reset failed', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
