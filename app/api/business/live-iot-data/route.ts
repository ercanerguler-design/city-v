import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/business/live-iot-data
 * 
 * Business üyelerin aktif IoT kamera verilerini döndürür
 * LiveCrowdSidebar component'i için tasarlanmıştır
 * 
 * Döndürülen format:
 * - Business profil bilgileri (business_name, address, coordinates)
 * - Kamera verileri (camera_count, last_seen)
 * - Crowd analysis (people_count, current_occupancy, crowd_level)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Business Live IoT Data API çağrıldı');

    // Business üyelerin aktif kameralarını getir
    // iot_crowd_analysis tablosundan gerçek verileri al
    const result = await sql`
      SELECT 
        bp.id as business_id,
        bp.business_name,
        bp.business_type,
        bp.address,
        bp.city,
        bp.district,
        bp.latitude,
        bp.longitude,
        bp.phone,
        bu.id as user_id,
        bu.company_name,
        bu.is_active as business_active,
        bu.added_by_admin,
        
        -- Kamera bilgileri (business_cameras.business_user_id = business_users.id)
        bc.id as camera_id,
        bc.camera_name,
        bc.ip_address,
        bc.stream_url,
        bc.location_description,
        bc.is_active as camera_active,
        bc.ai_enabled,
        bc.created_at as camera_created_at,
        
        -- Crowd analysis bilgileri (son 5 dakika) - iot_crowd_analysis tablosu
        -- NOT: device_id kullanılıyor (camera_id değil), people_count kullanılıyor (person_count değil)
        ca.people_count,
        ca.crowd_density,
        ca.current_occupancy,
        ca.analysis_timestamp
        
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      LEFT JOIN business_cameras bc ON bu.id = bc.business_user_id AND bc.is_active = true
      LEFT JOIN LATERAL (
        SELECT people_count, crowd_density, current_occupancy, analysis_timestamp
        FROM iot_crowd_analysis
        WHERE device_id = bc.id
          AND analysis_timestamp >= NOW() - INTERVAL '5 minutes'
        ORDER BY analysis_timestamp DESC
        LIMIT 1
      ) ca ON true
      
      WHERE bu.is_active = true
        AND bc.id IS NOT NULL
      
      ORDER BY ca.analysis_timestamp DESC NULLS LAST, bc.created_at DESC
    `;

    console.log(`✅ ${result.length} aktif business IoT cihazı bulundu`);
    
    if (result.length === 0) {
      console.log('⚠️ Hiç IoT cihazı bulunamadı. Veritabanı kontrol edin:');
      console.log('   - business_users tablosunda added_by_admin=true kayıt var mı?');
      console.log('   - business_cameras tablosunda kayıt var mı?');
    } else {
      console.log('📊 İlk kayıt örneği:', {
        business_id: result[0].business_id,
        business_name: result[0].business_name,
        camera_id: result[0].camera_id,
        camera_name: result[0].camera_name,
        has_analysis: !!result[0].analysis_timestamp
      });
    }

    // Verileri business bazında grupla
    const businessMap = new Map();
    
    result.forEach(row => {
      const businessId = row.business_id;
      
      if (!businessMap.has(businessId)) {
        // Menu bilgisi için ayrı sorgu - profile_id ile
        const menuQuery = sql`
          SELECT COUNT(*) as category_count 
          FROM business_menu_categories 
          WHERE business_id = ${businessId} AND is_active = true
        `;
        
        businessMap.set(businessId, {
          id: businessId,
          business_profile_id: businessId, // Menu modal için profile ID ekle
          location_id: `business-${businessId}`, // Map üzerinde eşleşmesi için
          name: row.business_name || row.company_name,
          type: row.business_type,
          address: row.address,
          city: row.city,
          district: row.district,
          latitude: parseFloat(row.latitude) || null,
          longitude: parseFloat(row.longitude) || null,
          phone: row.phone,
          isActive: row.business_active,
          cameras: [],
          menuPromise: menuQuery // Menu bilgisi promise olarak sakla
        });
      }
      
      const business = businessMap.get(businessId);
      
      // Kamera verisini ekle
      if (row.camera_id) {
        business.cameras.push({
          id: row.camera_id,
          name: row.camera_name,
          location: row.location_description,
          streamUrl: row.stream_url,
          isActive: row.camera_active,
          aiEnabled: row.ai_enabled,
          createdAt: row.camera_created_at,
          
          // Crowd analysis verisi (son 5 dakika) - iot_crowd_analysis'ten
          // NOT: people_count ve crowd_density kolonları kullanılıyor
          analysis: row.people_count !== null ? {
            personCount: row.people_count || 0,
            crowdDensity: row.crowd_density || 'empty',
            currentOccupancy: row.current_occupancy || 0,
            timestamp: row.analysis_timestamp
          } : null
        });
      }
    });

    // Map'i array'e çevir
    const businesses = Array.from(businessMap.values());

    // Menu bilgilerini çöz (Promise.all ile)
    const businessesWithMenu = await Promise.all(
      businesses.map(async (business) => {
        const menuResult = await business.menuPromise;
        const categoryCount = parseInt(menuResult[0]?.category_count || '0');
        
        console.log(`  ${business.name}: ${categoryCount} menu categories`);
        
        return {
          ...business,
          hasMenu: categoryCount > 0,
          menuCategoryCount: categoryCount,
          menuPromise: undefined // Promise'i temizle
        };
      })
    );

    // Her business için özet istatistikler
    const enrichedBusinesses = businessesWithMenu.map(business => {
      const activeCameras = business.cameras.filter((c: any) => c.isActive);
      const camerasWithData = business.cameras.filter((c: any) => c.analysis !== null);
      
      // Gerçek crowd analysis verilerinden hesapla
      const totalPeople = camerasWithData.reduce((sum: number, cam: any) => 
        sum + (cam.analysis?.personCount || 0), 0);
      
      const avgOccupancy = camerasWithData.length > 0 
        ? Math.round(totalPeople / camerasWithData.length) 
        : 0;
      
      // En yüksek crowd level'ı bul
      const crowdLevels = camerasWithData.map((c: any) => c.analysis?.crowdDensity || 'empty');
      const maxCrowdLevel = crowdLevels.includes('overcrowded') ? 'overcrowded'
        : crowdLevels.includes('high') ? 'high'
        : crowdLevels.includes('medium') ? 'medium'
        : crowdLevels.includes('low') ? 'low'
        : 'empty';
      
      // Son güncelleme zamanı (analysis timestamp veya camera createdAt)
      const lastUpdate = business.cameras.reduce((latest: any, cam: any) => {
        const camTime = cam.analysis?.timestamp || cam.createdAt;
        if (!camTime) return latest;
        return !latest || new Date(camTime) > new Date(latest) ? camTime : latest;
      }, null);
      
      console.log(`  ${business.name}: ${camerasWithData.length}/${activeCameras.length} cameras with data, ${totalPeople} people, level: ${maxCrowdLevel}`);

      return {
        ...business,
        summary: {
          totalCameras: business.cameras.length,
          activeCameras: activeCameras.length,
          camerasWithData: camerasWithData.length,
          totalPeople,
          avgOccupancy: Math.round(avgOccupancy),
          crowdLevel: maxCrowdLevel,
          lastUpdate,
          hasRealtimeData: camerasWithData.length > 0
        }
      };
    });

    // Sadece canlı veri olanları filtrele (opsiyonel - query param ile kontrol)
    const { searchParams } = new URL(request.url);
    const onlyWithData = searchParams.get('onlyWithData') === 'true';
    
    const finalBusinesses = onlyWithData 
      ? enrichedBusinesses.filter(b => b.summary.hasRealtimeData)
      : enrichedBusinesses;

    console.log(`📡 Canlı veri olan business sayısı: ${finalBusinesses.filter(b => b.summary.hasRealtimeData).length}`);
    
    return NextResponse.json({
      success: true,
      businesses: finalBusinesses,
      count: finalBusinesses.length,
      totalWithData: finalBusinesses.filter(b => b.summary.hasRealtimeData).length
    });

  } catch (error) {
    console.error('❌ Business Live IoT Data hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Live IoT verileri alınamadı',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
