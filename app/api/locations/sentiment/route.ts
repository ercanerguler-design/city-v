import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { locationId, sentiment, timestamp } = await request.json();

    if (!locationId || !sentiment) {
      return NextResponse.json(
        { error: 'Location ID and sentiment required', success: false },
        { status: 400 }
      );
    }

    console.log('📊 Sentiment kaydediliyor:', { locationId, sentiment });

    // Business location kontrolü - location_id veya businessUserId ile eşleşme
    const businessCheck = await query(
      `SELECT bp.user_id, bp.business_name, bp.location_id
       FROM business_profiles bp
       WHERE bp.location_id = $1 
          OR bp.user_id::text = $1
          OR bp.id::text = $1`,
      [locationId]
    );

    if (businessCheck.rows.length > 0) {
      const business = businessCheck.rows[0];
      
      // business_interactions tablosuna kaydet
      await query(
        `INSERT INTO business_interactions 
         (business_user_id, interaction_type, location_id, sentiment, created_at)
         VALUES ($1, 'sentiment', $2, $3, $4)`,
        [
          business.user_id,
          locationId,
          sentiment,
          timestamp || new Date().toISOString()
        ]
      );

      console.log('✅ Sentiment kaydedildi:', business.business_name);

      return NextResponse.json({
        success: true,
        message: 'Sentiment recorded successfully',
        businessName: business.business_name
      });
    } else {
      console.log('⚠️ Business bulunamadı:', locationId);
      return NextResponse.json({
        success: false,
        error: 'Business location not found'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Sentiment API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record sentiment', 
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
