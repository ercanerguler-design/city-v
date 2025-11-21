import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * 🗺️ Locations API
 * City-V anasayfa haritası için tüm lokasyonları getirir
 * Static locations + Business locations (otomatik entegrasyon)
 * 
 * Query Parameters:
 * - lat: User latitude (for distance filtering)
 * - lng: User longitude (for distance filtering)
 * - radius: Search radius in km (default: 7km)
 */

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userLat = searchParams.get('lat');
    const userLng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '7'); // Default 7km

    console.log('🗺️ Locations API - Global Mode', { userLat, userLng, radius });

    // Önce static location'ları al (ankaraData'dan)
    const { ankaraLocations } = await import('@/lib/ankaraData');
    const staticLocations = ankaraLocations.map(loc => ({
      ...loc,
      source: 'static',
      isBusiness: false
    }));

    console.log('📍 Static locations loaded:', staticLocations.length);

    // Business locations'ı almayı dene, hata olursa static ile devam et
    let businessLocations: any[] = [];
    
    try {
      const businessResult = await sql`
        SELECT 
          bp.id as location_id,
          bp.business_name as name,
          bp.business_type as category,
          bp.latitude,
          bp.longitude,
          bp.address,
          bp.phone,
          bp.working_hours,
          bp.created_at
         FROM business_profiles bp
         WHERE bp.latitude IS NOT NULL
           AND bp.longitude IS NOT NULL
      `;

      businessLocations = businessResult.map(row => ({
        id: row.location_id,
        name: row.name,
        coordinates: [parseFloat(row.latitude), parseFloat(row.longitude)],
        category: row.category || 'business',
        address: row.address || '',
        phone: row.phone || '',
        working_hours: row.working_hours || null,
        currentCrowdLevel: 'moderate',
        source: 'business',
        isBusiness: true,
        created_at: row.created_at
      }));

      console.log('✅ Business locations loaded:', businessLocations.length);
    } catch (dbError) {
      console.error('⚠️ Database error, using static only:', dbError);
      // Business location'lar alınamazsa sadece static kullan
    }

    // Combine both
    let allLocations = [...businessLocations, ...staticLocations];

    // Apply distance filtering if user location provided
    if (userLat && userLng) {
      const lat = parseFloat(userLat);
      const lng = parseFloat(userLng);
      
      allLocations = allLocations
        .map(loc => {
          const [locLat, locLng] = loc.coordinates;
          const distance = calculateDistance(lat, lng, locLat, locLng);
          return { ...loc, distance };
        })
        .filter(loc => loc.distance <= radius)
        .sort((a, b) => a.distance - b.distance); // Sort by distance
      
      console.log(`📍 Filtered to ${allLocations.length} locations within ${radius}km of user`);
    }

    console.log('📊 Total locations returned:', allLocations.length);
    console.log('   ↳ Business:', businessLocations.filter(b => !userLat || allLocations.some(a => a.id === b.id)).length);
    console.log('   ↳ Static:', staticLocations.filter(s => !userLat || allLocations.some(a => a.id === s.id)).length);

    return NextResponse.json({
      success: true,
      locations: allLocations,
      total: allLocations.length,
      business: businessLocations.length,
      static: staticLocations.length,
      mode: businessLocations.length > 0 ? 'full' : 'static-only'
    });

  } catch (error: any) {
    console.error('❌ Locations API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Lokasyonlar getirilemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * 🔍 Get Single Location
 * GET /api/locations/starbucks-kizilay
 */
export async function POST(req: NextRequest) {
  try {
    const { locationId } = await req.json();

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'Location ID gerekli' },
        { status: 400 }
      );
    }

    // Try business location first
    const result = await sql(
      `SELECT 
        location_id as id,
        business_name as name,
        category,
        latitude,
        longitude,
        address,
        current_crowd_level as "currentCrowdLevel",
        average_wait_time as "averageWaitTime",
        description,
        working_hours as "workingHours",
        rating,
        review_count as "reviewCount",
        phone,
        website,
        photos,
        business_type as "businessType",
        user_id as "businessUserId"
       FROM business_profiles
       WHERE location_id = $1`,
      [locationId]
    );

    if (result.length > 0) {
      const row = result[0];
      const location = {
        id: row.id,
        name: row.name,
        category: row.category,
        coordinates: [parseFloat(row.latitude), parseFloat(row.longitude)],
        address: row.address,
        currentCrowdLevel: row.currentCrowdLevel,
        averageWaitTime: row.averageWaitTime,
        lastUpdated: new Date(),
        description: row.description,
        workingHours: row.workingHours,
        rating: parseFloat(row.rating || 0),
        reviewCount: parseInt(row.reviewCount || 0),
        phone: row.phone,
        website: row.website,
        photos: row.photos,
        verified: false, // Default false since column doesn't exist
        businessType: row.businessType,
        businessUserId: row.businessUserId,
        source: 'business'
      };

      return NextResponse.json({
        success: true,
        location
      });
    }

    // Fallback to static locations
    const { ankaraLocations } = await import('@/lib/ankaraData');
    const staticLocation = ankaraLocations.find(loc => loc.id === locationId);

    if (staticLocation) {
      return NextResponse.json({
        success: true,
        location: { ...staticLocation, source: 'static' }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Lokasyon bulunamadı' },
      { status: 404 }
    );

  } catch (error: any) {
    console.error('❌ Location fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Lokasyon getirilemedi',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
