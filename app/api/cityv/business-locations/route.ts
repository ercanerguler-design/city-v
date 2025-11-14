import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * City-V Ana Harita için Business Lokasyonları ve Gerçek Veri API
 * İşletmelerin konum, yoğunluk, menü ve kampanya bilgilerini döner
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🏢 Business locations API çağrıldı');
    
    // Database URL kontrolü
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not configured!');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not configured',
          locations: []
        },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const bounds = searchParams.get('bounds'); // "lat1,lng1,lat2,lng2"
    const category = searchParams.get('category'); // "restaurant", "cafe", "retail" vb.

    // SQL query oluştur - SADECE ADMIN TARAFINDAN EKLENMİŞ AKTİF BUSINESS'LARI GÖSTERcode
    let sqlQuery = `
      SELECT 
        bp.id as business_id,
        bp.business_name,
        bp.business_type,
        bp.description,
        bp.address,
        bp.city,
        bp.district,
        bp.latitude,
        bp.longitude,
        bp.phone,
        bp.email,
        bp.website,
        bp.working_hours,
        bp.logo_url,
        bp.photos,
        bp.social_media,
        bu.membership_type,
        bu.is_active
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      WHERE bp.latitude IS NOT NULL 
        AND bp.longitude IS NOT NULL
        AND bu.added_by_admin = true
        AND bu.is_active = true
    `;

    const params: any[] = [];
    let paramCount = 0;

    // Sınırlar içinde filtrele
    if (bounds) {
      const [lat1, lng1, lat2, lng2] = bounds.split(',').map(Number);
      paramCount += 4;
      sqlQuery += ` AND bp.latitude BETWEEN $${paramCount-3} AND $${paramCount-1}`;
      sqlQuery += ` AND bp.longitude BETWEEN $${paramCount-2} AND $${paramCount}`;
      params.push(Math.min(lat1, lat2), Math.max(lat1, lat2), Math.min(lng1, lng2), Math.max(lng1, lng2));
    }

    // Kategori filtresi
    if (category && category !== 'all') {
      paramCount++;
      sqlQuery += ` AND bp.business_type = $${paramCount}`;
      params.push(category);
    }

    sqlQuery += ` ORDER BY bp.created_at DESC LIMIT 100`;

    console.log('📊 SQL Query çalıştırılıyor...');
    const businessesResult = await query(sqlQuery, params);
    console.log('✅ Business profiles bulundu:', businessesResult.rows.length);

    // Her işletme için gerçek zamanlı verileri ekle
    const businessesWithData = await Promise.all(
      businessesResult.rows.map(async (business) => {
        // Crowd analysis verisi (son 10 dakika) - iot_crowd_analysis tablosundan
        let crowdData = { avg_people: 0, max_people: 0, data_points: 0 };
        
        try {
          const crowdResult = await query(
            `SELECT 
              COALESCE(AVG(ica.current_occupancy), 0) as avg_people,
              COALESCE(MAX(ica.current_occupancy), 0) as max_people,
              COUNT(*) as data_points
             FROM iot_crowd_analysis ica
             JOIN iot_devices id ON ica.device_id = id.device_id
             JOIN business_profiles bp ON id.business_id = bp.id
             WHERE bp.id = $1 
               AND ica.timestamp >= NOW() - INTERVAL '10 minutes'`,
            [business.business_id]
          );
          crowdData = crowdResult.rows[0] || crowdData;
        } catch (error) {
          // IoT data yoksa default değerler kullan
          console.log(`⚠️  No IoT data for business ${business.business_id}`);
        }

        const avgPeople = Math.round(parseFloat(String(crowdData.avg_people || 0)));

        // Yoğunluk seviyesi hesapla
        let crowdLevel = 'empty';
        if (avgPeople > 20) crowdLevel = 'very_crowded';
        else if (avgPeople > 10) crowdLevel = 'crowded';
        else if (avgPeople > 5) crowdLevel = 'moderate';
        else if (avgPeople > 0) crowdLevel = 'low';

        // Aktif kampanyalar
        let campaigns = [];
        try {
          const campaignsResult = await query(
            `SELECT id, title, description, discount_percent, discount_amount
             FROM business_campaigns
             WHERE business_id = $1 
               AND is_active = true
               AND start_date <= NOW()
               AND end_date >= NOW()
             ORDER BY created_at DESC
             LIMIT 3`,
            [business.business_id]
          );
          campaigns = campaignsResult.rows;
        } catch (error) {
          console.log(`⚠️ No campaigns for business ${business.business_id}`);
        }

        // Menü bilgisi - default false
        let hasMenu = false;
        // Gelecekte business_menus tablosu eklenince burası aktif olacak

        return {
          id: business.business_id, // DB'den gelen ID'yi direkt kullan
          businessId: business.business_id, // Backend için de sakla
          name: business.business_name,
          category: business.business_type || 'other',
          coordinates: [
            parseFloat(business.latitude),
            parseFloat(business.longitude)
          ], // [lat, lng] formatı - Leaflet ve Google Maps için
          address: business.address,
          city: business.city,
          district: business.district,
          phone: business.phone,
          email: business.email,
          website: business.website,
          logo: business.logo_url,
          photos: business.photos || [],
          description: business.description,
          workingHours: business.working_hours,
          socialMedia: business.social_media,
          // Gerçek zamanlı crowd data
          crowdLevel,
          currentPeople: avgPeople,
          isLive: (crowdData.data_points || 0) > 0,
          lastUpdate: new Date().toISOString(),
          // Kampanyalar
          hasCampaigns: campaigns.length > 0,
          campaigns: campaigns,
          // Menü
          hasMenu,
          // Özellikler
          features: {
            aiCamera: true,
            realTimeData: (crowdData.data_points || 0) > 0,
            campaigns: campaigns.length > 0,
            menu: hasMenu
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: businessesWithData.length,
      locations: businessesWithData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Business locations API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error details:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        locations: [] // Boş array döndür, frontend'de hata vermesin
      },
      { status: 500 }
    );
  }
}
