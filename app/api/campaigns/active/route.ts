import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Aktif İşletme Kampanyalarını Getir (CityV Anasayfası için)
 * 
 * - Sadece gerçek business kampanyalarını döndürür
 * - Demo bildirimleri içermez
 * - Son 24 saatteki aktif kampanyalar
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📢 Active campaigns API çağrıldı');

    // push_notifications tablosundan son 24 saatteki kampanyaları çek
    const result = await query(
      `SELECT 
        pn.id as notification_id,
        pn.campaign_id,
        pn.title,
        pn.message as description,
        pn.sent_at as created_at,
        bc.discount_percent,
        bc.discount_amount,
        bc.start_date,
        bc.end_date,
        bc.is_active,
        bp.id as business_id,
        bp.business_name,
        bp.category as business_type,
        bp.latitude,
        bp.longitude,
        bp.address
       FROM push_notifications pn
       INNER JOIN business_campaigns bc ON pn.campaign_id = bc.id
       INNER JOIN business_profiles bp ON pn.business_id = bp.id
       WHERE pn.notification_type = 'campaign'
         AND bc.is_active = true
         AND bc.start_date <= NOW()
         AND bc.end_date >= NOW()
         AND pn.sent_at >= NOW() - INTERVAL '24 hours'
       ORDER BY pn.sent_at DESC
       LIMIT 10`
    );

    console.log(`✅ ${result.rows.length} aktif kampanya bulundu`);

    const campaigns = result.rows.map(row => ({
      id: row.campaign_id,
      businessId: row.business_id,
      businessName: row.business_name,
      businessType: row.business_type,
      title: row.title,
      description: row.description,
      value: row.discount_percent || row.discount_amount,
      type: row.discount_percent ? 'percent' : 'amount',
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at,
      // ✅ Location string olarak döndür (React Error #31 fix)
      location: row.address || (row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : null)
    }));

    return NextResponse.json({
      success: true,
      campaigns,
      count: campaigns.length
    });

  } catch (error: any) {
    console.error('❌ Active campaigns error:', error);
    return NextResponse.json(
      { 
        success: false, 
        campaigns: [],
        error: error.message 
      },
      { status: 500 }
    );
  }
}
