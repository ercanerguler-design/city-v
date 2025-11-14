import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Testing database connection and business data...');

    // Test User ID 20
    const userResult = await query(
      `SELECT 
        id, 
        email, 
        full_name,
        membership_type, 
        campaign_credits,
        max_cameras
      FROM business_users 
      WHERE id = $1`,
      [20]
    );

    const profileResult = await query(
      `SELECT 
        id,
        business_name,
        is_visible_on_map,
        auto_sync_to_cityv
      FROM business_profiles 
      WHERE user_id = $1`,
      [20]
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: userResult.rows[0] || null,
      profile: profileResult.rows[0] || null,
      message: 'Database connection successful'
    });

  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
