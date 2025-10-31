import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Business Profil Lokasyon Güncelleme API
 * Otomatik veya manuel konum belirleme
 */

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      latitude,
      longitude,
      address,
      city,
      district,
      postalCode
    } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Enlem ve boylam gerekli' },
        { status: 400 }
      );
    }

    // Koordinat geçerliliği kontrolü
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Geçersiz koordinatlar' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE business_profiles
       SET 
         latitude = $1,
         longitude = $2,
         address = COALESCE($3, address),
         city = COALESCE($4, city),
         district = COALESCE($5, district),
         postal_code = COALESCE($6, postal_code),
         updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [latitude, longitude, address, city, district, postalCode, businessId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'İşletme profili bulunamadı' },
        { status: 404 }
      );
    }

    console.log(`✅ Konum güncellendi: ${result.rows[0].business_name} (${latitude}, ${longitude})`);

    return NextResponse.json({
      success: true,
      profile: result.rows[0],
      message: 'Konum başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('❌ Location update error:', error);
    return NextResponse.json(
      { error: 'Konum güncellenemedi' },
      { status: 500 }
    );
  }
}

// GET - Mevcut konum bilgisi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        id,
        business_name,
        latitude,
        longitude,
        address,
        city,
        district,
        postal_code
       FROM business_profiles
       WHERE id = $1`,
      [businessId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'İşletme profili bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      location: result.rows[0]
    });

  } catch (error: any) {
    console.error('❌ Location GET error:', error);
    return NextResponse.json(
      { error: 'Konum bilgisi alınamadı' },
      { status: 500 }
    );
  }
}
