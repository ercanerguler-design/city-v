import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Business profiles'tan tüm mekanları çek
    const result = await query(`
      SELECT 
        bp.id,
        bp.business_name,
        bp.business_type,
        bp.address,
        bp.city,
        bp.district,
        bp.phone,
        bp.email,
        bp.website,
        bp.latitude,
        bp.longitude,
        bp.created_at,
        bu.company_name as owner_company,
        bu.full_name as owner_name,
        bu.email as owner_email,
        COALESCE(device_count.count, 0) as device_count,
        COALESCE(analysis_count.count, 0) as analysis_count
      FROM business_profiles bp
      LEFT JOIN business_users bu ON bp.id = bu.id
      LEFT JOIN (
        SELECT business_id, COUNT(*) as count 
        FROM iot_devices 
        GROUP BY business_id
      ) device_count ON bp.id = device_count.business_id
      LEFT JOIN (
        SELECT id.business_id, COUNT(*) as count
        FROM iot_crowd_analysis ica
        JOIN iot_devices id ON ica.device_id = id.device_id
        GROUP BY id.business_id
      ) analysis_count ON bp.id = analysis_count.business_id
      ORDER BY bp.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      locations: result.rows.map(row => ({
        id: row.id,
        business_name: row.business_name,
        business_type: row.business_type,
        address: row.address,
        city: row.city,
        district: row.district,
        phone: row.phone,
        email: row.email,
        website: row.website,
        latitude: row.latitude,
        longitude: row.longitude,
        created_at: row.created_at,
        owner_company: row.owner_company,
        owner_name: row.owner_name,
        owner_email: row.owner_email,
        device_count: parseInt(row.device_count) || 0,
        analysis_count: parseInt(row.analysis_count) || 0,
        location_string: `${row.district || ''}, ${row.city || ''}`.trim()
      }))
    });

  } catch (error) {
    console.error('❌ Admin locations error:', error);
    return NextResponse.json(
      { success: false, error: 'Mekanlar yüklenemedi' },
      { status: 500 }
    );
  }
}
