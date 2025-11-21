import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    // Not: crowd_analysis tablosu henüz mevcut değil, sadece camera bilgilerini kullanıyoruz
    const result = await query(`
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
        
        -- Kamera bilgileri
        bc.id as camera_id,
        bc.camera_name,
        bc.ip_address,
        bc.location_description,
        bc.status as camera_status,
        bc.last_seen,
        bc.is_active as camera_active,
        bc.created_at as camera_created_at
        
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      LEFT JOIN business_cameras bc ON bu.id = bc.business_user_id
      
      WHERE bu.is_active = true
        AND bc.id IS NOT NULL
        AND (bc.status = 'active' OR bc.is_active = true)
      
      ORDER BY bc.last_seen DESC NULLS LAST, bc.created_at DESC
    `);

    console.log(`✅ ${result.rows.length} aktif business IoT cihazı bulundu`);
    
    if (result.rows.length === 0) {
      console.log('⚠️ Hiç IoT cihazı bulunamadı. Veritabanı kontrol edin:');
      console.log('   - business_users tablosunda added_by_admin=true kayıt var mı?');
      console.log('   - business_cameras tablosunda kayıt var mı?');
    } else {
      console.log('📊 İlk kayıt örneği:', {
        business_id: result.rows[0].business_id,
        business_name: result.rows[0].business_name,
        camera_id: result.rows[0].camera_id,
        camera_name: result.rows[0].camera_name,
        has_analysis: !!result.rows[0].analysis_timestamp
      });
    }

    // Verileri business bazında grupla
    const businessMap = new Map();
    
    result.rows.forEach(row => {
      const businessId = row.business_id;
      
      if (!businessMap.has(businessId)) {
        businessMap.set(businessId, {
          id: businessId,
          business_profile_id: businessId, // Menu modal için profile ID ekle
          name: row.business_name || row.company_name,
          type: row.business_type,
          address: row.address,
          city: row.city,
          district: row.district,
          latitude: parseFloat(row.latitude) || null,
          longitude: parseFloat(row.longitude) || null,
          phone: row.phone,
          isActive: row.business_active,
          cameras: []
        });
      }
      
      const business = businessMap.get(businessId);
      
      // Kamera verisini ekle
      if (row.camera_id) {
        business.cameras.push({
          id: row.camera_id,
          name: row.camera_name,
          location: row.location_description,
          status: row.camera_status,
          lastSeen: row.last_seen,
          isActive: row.camera_active,
          createdAt: row.camera_created_at,
          
          // Crowd analysis verisi (şimdilik null - tablo henüz yok)
          analysis: null
        });
      }
    });

    // Map'i array'e çevir
    const businesses = Array.from(businessMap.values());

    // Her business için özet istatistikler
    const enrichedBusinesses = businesses.map(business => {
      const activeCameras = business.cameras.filter((c: any) => c.status === 'active' || c.isActive);
      const camerasWithData = business.cameras.filter((c: any) => c.analysis !== null);
      
      // Şimdilik mock veriler (crowd_analysis tablosu olmadığı için)
      const totalPeople = 0;
      const avgOccupancy = 0;
      const maxCrowdLevel = 'empty';
      
      // Son güncelleme zamanı (kamera last_seen veya created_at)
      const lastUpdate = business.cameras.reduce((latest: any, cam: any) => {
        const camTime = cam.lastSeen || cam.createdAt;
        if (!camTime) return latest;
        return !latest || new Date(camTime) > new Date(latest) ? camTime : latest;
      }, null);

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
