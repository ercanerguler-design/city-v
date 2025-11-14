import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/business/cameras/recent-activity
 * Business kullanıcısının kameralarındaki son aktiviteleri getir
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessUserId = searchParams.get('businessUserId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!businessUserId) {
      return NextResponse.json(
        { success: false, error: 'businessUserId gerekli' },
        { status: 400 }
      );
    }

    console.log(`📋 Fetching recent activities for business user ${businessUserId}, limit: ${limit}`);

    // Son aktiviteleri getir - iot_ai_analysis + business_cameras join
    const result = await sql`
      SELECT 
        ia.id,
        ia.person_count,
        ia.crowd_density,
        ia.detection_objects,
        ia.created_at,
        bc.camera_name,
        bc.id as camera_id,
        bc.location_description
      FROM iot_ai_analysis ia
      INNER JOIN business_cameras bc ON ia.camera_id = bc.id
      WHERE bc.business_user_id = ${businessUserId}
      ORDER BY ia.created_at DESC
      LIMIT ${limit}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        activities: [],
        message: 'Henüz aktivite yok'
      });
    }

    console.log(`✅ ${result.rows.length} aktivite bulundu`);

    return NextResponse.json({
      success: true,
      activities: result.rows,
      count: result.rows.length
    });

  } catch (error: any) {
    console.error('❌ Recent activity fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Aktiviteler getirilemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
