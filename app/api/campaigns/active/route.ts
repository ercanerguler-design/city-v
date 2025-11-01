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

    // Son 24 saatte oluşturulmuş, aktif, gerçek business kampanyaları
    const result = await query(
      `SELECT 
        bc.id as campaign_id,
        bc.title,
        bc.description,
        bc.discount_percent,
        bc.discount_amount,
        bc.start_date,
        bc.end_date,
        bc.created_at,
        bp.id as business_id,
        bp.business_name,
        bp.business_type,
        bp.latitude,
        bp.longitude,
        bp.address,
        bp.logo_url
       FROM business_campaigns bc
       INNER JOIN business_profiles bp ON bc.business_id = bp.id
       INNER JOIN business_users bu ON bp.user_id = bu.id
       WHERE bc.is_active = true
         AND bc.start_date <= NOW()
         AND bc.end_date >= NOW()
         AND bu.is_active = true
         AND bu.added_by_admin = true
         AND bc.created_at >= NOW() - INTERVAL '24 hours'
       ORDER BY bc.created_at DESC
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
      location: {
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude),
        address: row.address
      },
      logoUrl: row.logo_url
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
