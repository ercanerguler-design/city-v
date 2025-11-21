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
    console.log('🗺️ Locations API - Basit Test');

    // Sadece business locations
    const result = await sql`
      SELECT 
        bp.location_id as id,
        bp.business_name as name,
        bp.latitude,
        bp.longitude
       FROM business_profiles bp
       WHERE bp.is_visible_on_map = true
         AND bp.latitude IS NOT NULL
         AND bp.longitude IS NOT NULL
    `;

    console.log('✅ Business locations found:', result.length);

    const locations = result.map(row => ({
      id: row.id,
      name: row.name,
      coordinates: [parseFloat(row.latitude), parseFloat(row.longitude)],
      category: 'business',
      currentCrowdLevel: 'moderate',
      source: 'business'
    }));

    return NextResponse.json({
      success: true,
      locations,
      total: locations.length
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
