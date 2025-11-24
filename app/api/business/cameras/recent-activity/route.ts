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

    // ✅ ESP32 FIRMWARE: iot_crowd_analysis tablosu kullanılıyor
    // Son aktiviteleri getir - iot_crowd_analysis + business_cameras join
    const result = await sql`
      SELECT 
        ca.id,
        ca.people_count,
        ca.crowd_density,
        ca.current_occupancy,
        ca.analysis_timestamp,
        bc.camera_name,
        bc.id as camera_id,
        bc.location_description
      FROM iot_crowd_analysis ca
      INNER JOIN business_cameras bc ON CAST(bc.id AS VARCHAR) = ca.device_id
      WHERE bc.business_user_id = ${businessUserId}
        AND bc.is_active = true
      ORDER BY ca.analysis_timestamp DESC
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

