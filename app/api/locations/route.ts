import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * 🗺️ Locations API
 * City-V anasayfa haritası için tüm lokasyonları getirir
 * Static locations + Business locations (otomatik entegrasyon)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const cityParam = searchParams.get('city') || 'Ankara';
    // Normalize city name: capitalize first letter for database comparison
    const city = cityParam.charAt(0).toUpperCase() + cityParam.slice(1).toLowerCase();
    const includeBusiness = searchParams.get('includeBusiness') !== 'false'; // Default true

    console.log('🗺️ Locations API:', { cityParam, normalizedCity: city, category, includeBusiness });

    // Business locations from database
    let businessLocations: any[] = [];
    
    if (includeBusiness) {
      const result = await sql`
        SELECT 
          bp.location_id as id,
          bp.business_name as name,
          COALESCE(bp.category, 'other') as category,
          bp.latitude,
          bp.longitude,
          bp.address,
          COALESCE(bp.current_crowd_level, 'moderate') as "currentCrowdLevel",
          COALESCE(bp.average_wait_time, 0) as "averageWaitTime",
          NOW() as "lastUpdated",
          bp.description,
          bp.working_hours as "workingHours",
          bp.rating,
          bp.review_count as "reviewCount",
          bp.phone,
          bp.website,
          bp.photos,
          bp.business_type as "businessType",
          bp.user_id as "businessUserId",
          bp.id as "businessProfileId"
         FROM business_profiles bp
         WHERE bp.is_visible_on_map = true
           AND bp.latitude IS NOT NULL
           AND bp.longitude IS NOT NULL
           AND bp.auto_sync_to_cityv = true
         ORDER BY bp.created_at DESC
      `;

      businessLocations = result.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        coordinates: [parseFloat(row.latitude), parseFloat(row.longitude)],
        address: row.address,
        currentCrowdLevel: row.currentCrowdLevel,
        averageWaitTime: row.averageWaitTime,
        lastUpdated: row.lastUpdated,
        description: row.description,
        workingHours: row.workingHours,
        rating: parseFloat(row.rating || 0),
        reviewCount: parseInt(row.reviewCount || 0),
        phone: row.phone,
        website: row.website,
        photos: row.photos,
        verified: false, // Default false since column doesn't exist
        businessType: row.businessType,
        businessUserId: row.businessUserId, // user_id (20)
        businessProfileId: row.businessProfileId, // profile id (15) - for menu API
        currentPeopleCount: 0, // Simplified - no real-time data for now
        source: 'business' // Business kaynaklı
      }));
    }

    // Only show business locations (no mock data)
    const allLocations = businessLocations;

    console.log(`✅ Returned ${allLocations.length} business locations`);

    return NextResponse.json({
      success: true,
      locations: allLocations,
      counts: {
        total: allLocations.length,
        business: businessLocations.length,
        static: 0
      },
      filters: {
        category,
        city
      }
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
