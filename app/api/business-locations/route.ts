import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - Business mekanlarını harita için getir
export async function GET(request: NextRequest) {
  try {
    // Active business profiles'ı ve user bilgilerini getir
    const result = await sql`
      SELECT 
        bp.id,
        bp.business_name as name,
        bp.business_type as category,
        bp.latitude,
        bp.longitude,
        bp.address,
        bp.city,
        bp.district,
        bp.phone,
        bp.email,
        bp.description,
        bp.logo_url,
        bp.photos,
        bp.working_hours,
        bu.is_active,
        bu.membership_type,
        COUNT(bc.id) as camera_count
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      LEFT JOIN business_cameras bc ON bp.id = bc.business_id AND bc.is_active = true
      WHERE bu.is_active = true 
        AND bu.added_by_admin = true
        AND bp.latitude IS NOT NULL 
        AND bp.longitude IS NOT NULL
      GROUP BY bp.id, bu.is_active, bu.membership_type
      ORDER BY bp.created_at DESC
    `;

    // Location formatına dönüştür
    const locations = result.map((row: any) => ({
      id: `business-${row.id}`,
      name: row.name,
      category: mapBusinessTypeToCategory(row.category),
      coordinates: [parseFloat(row.latitude), parseFloat(row.longitude)],
      address: row.address,
      city: row.city,
      district: row.district,
      currentCrowdLevel: 'moderate', // Varsayılan - kamera verisi ile güncellenebilir
      averageWaitTime: 5,
      lastUpdated: new Date(),
      description: row.description || '',
      phone: row.phone,
      email: row.email,
      businessType: row.category,
      membershipType: row.membership_type,
      cameraCount: parseInt(row.camera_count) || 0,
      logo: row.logo_url,
      photos: row.photos || [],
      workingHours: row.working_hours
    }));

    return NextResponse.json({
      success: true,
      locations,
      count: locations.length
    });

  } catch (error) {
    console.error('❌ Business locations error:', error);
    return NextResponse.json(
      { success: false, error: 'Mekanlar getirilemedi', locations: [] },
      { status: 500 }
    );
  }
}

// Business type'ı Location category'sine map et
function mapBusinessTypeToCategory(businessType: string): string {
  const mapping: { [key: string]: string } = {
    'restaurant': 'restaurant',
    'cafe': 'cafe',
    'retail': 'shopping',
    'hotel': 'hotel',
    'bank': 'bank',
    'hospital': 'healthcare',
    'pharmacy': 'healthcare',
    'gym': 'entertainment',
    'cinema': 'entertainment',
    'museum': 'culture',
    'park': 'park',
    'mall': 'shopping',
    'market': 'shopping',
    'Restoran': 'restaurant',
    'Kafe': 'cafe',
    'Perakende': 'shopping',
    'Otel': 'hotel',
    'Banka': 'bank',
    'Hastane': 'healthcare',
    'Eczane': 'healthcare',
    'Spor Salonu': 'entertainment',
    'Sinema': 'entertainment',
    'Müze': 'culture',
    'Park': 'park',
    'AVM': 'shopping',
    'Market': 'shopping'
  };

  return mapping[businessType] || 'other';
}
