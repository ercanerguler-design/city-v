import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getLocationFromAddress } from '@/lib/googlePlacesLocation';

// GET - Profil getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    console.log('🔍 Profile API: businessId =', businessId);
    
    const result = await sql`
      SELECT * FROM business_profiles WHERE user_id = ${businessId}
    `;

    console.log('📋 Profile query result:', result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log('⚠️ Profile bulunamadı, user_id:', businessId);
      return NextResponse.json(
        { error: 'Profil bulunamadı' },
        { status: 404 }
      );
    }
    
    console.log('✅ Profile bulundu:', result.rows[0].business_name);

    return NextResponse.json({
      success: true,
      profile: result.rows[0]
    });

  } catch (error: any) {
    console.error('Profil getirme hatası:', error);
    return NextResponse.json(
      { error: 'Profil getirilemedi', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Profil güncelle
export async function PUT(request: Request) {
  try {
    const {
      businessId,
      businessName,
      businessType,
      logoUrl,
      description,
      address,
      city,
      district,
      phone,
      email,
      workingHours,
      socialMedia,
      photos
    } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    // Otomatik konum al (address verilmişse)
    let latitude = null;
    let longitude = null;
    
    if (address) {
      const fullAddress = `${address}, ${district || ''} ${city || ''}`.trim();
      const locationData = await getLocationFromAddress(fullAddress);
      
      if (locationData) {
        latitude = locationData.latitude;
        longitude = locationData.longitude;
        console.log('✅ Konum otomatik alındı:', { latitude, longitude, address: fullAddress });
      } else {
        console.warn('⚠️ Konum alınamadı, manuel girilmeli');
      }
    }

    const result = await sql`
      UPDATE business_profiles SET
        business_name = ${businessName},
        business_type = ${businessType},
        logo_url = ${logoUrl || null},
        description = ${description || null},
        address = ${address || null},
        city = ${city || null},
        district = ${district || null},
        latitude = ${latitude},
        longitude = ${longitude},
        phone = ${phone || null},
        email = ${email || null},
        working_hours = ${workingHours ? JSON.stringify(workingHours) : null},
        social_media = ${socialMedia ? JSON.stringify(socialMedia) : null},
        photos = ${photos || null},
        updated_at = NOW()
      WHERE id = ${businessId}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      profile: result.rows[0]
    });

  } catch (error: any) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Profil güncellenemedi', details: error.message },
      { status: 500 }
    );
  }
}
