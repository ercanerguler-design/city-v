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
    console.log('🗺️ Locations API - Business + Static locations');

    // Business locations
    const businessResult = await sql`
      SELECT 
        bp.location_id as id,
        bp.name as business_name,
        bp.business_type as category,
        bp.coordinates_lat as latitude,
        bp.coordinates_lng as longitude,
        bp.address,
        bp.phone,
        bp.visible_on_map,
        bp.created_at
       FROM business_profiles bp
       WHERE bp.visible_on_map = true
         AND bp.coordinates_lat IS NOT NULL
         AND bp.coordinates_lng IS NOT NULL
    `;

    console.log('✅ Business locations found:', businessResult.length);

    const businessLocations = businessResult.map(row => ({
      id: row.id,
      name: row.business_name,
      coordinates: [parseFloat(row.latitude), parseFloat(row.longitude)],
      category: row.category || 'business',
      address: row.address || '',
      phone: row.phone || '',
      currentCrowdLevel: 'moderate',
      source: 'business',
      isBusiness: true,
      visible_on_map: row.visible_on_map,
      created_at: row.created_at
    }));

    // Static locations (ankaraData'dan)
    const { ankaraLocations } = await import('@/lib/ankaraData');
    const staticLocations = ankaraLocations.map(loc => ({
      ...loc,
      source: 'static',
      isBusiness: false
    }));

    // Combine both
    const allLocations = [...businessLocations, ...staticLocations];

    console.log('📊 Total locations:', allLocations.length);
    console.log('   ↳ Business:', businessLocations.length);
    console.log('   ↳ Static:', staticLocations.length);

    return NextResponse.json({
      success: true,
      locations: allLocations,
      total: allLocations.length,
      business: businessLocations.length,
      static: staticLocations.length
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
