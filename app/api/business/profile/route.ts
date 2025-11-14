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

    // Otomatik location_id oluştur (business_name-city formatında)
    let locationId = null;
    if (businessName && city) {
      const slug = businessName
        .toLowerCase()
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ı/g, 'i')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const citySlug = city.toLowerCase().substring(0, 5);
      locationId = `${slug}-${citySlug}`;
    }

    console.log('🔄 Profil güncelleniyor, user_id:', businessId, 'location_id:', locationId);
    
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
        location_id = ${locationId},
        is_visible_on_map = ${latitude && longitude ? true : false},
        auto_sync_to_cityv = true,
        updated_at = NOW()
      WHERE user_id = ${businessId}
      RETURNING *
    `;
    
    console.log('✅ Profil güncellendi:', result.rows.length, 'rows affected');

    // Sync to City-V locations table for homepage/sidebar visibility
    if (latitude && longitude && businessName) {
      try {
        await sql`
          INSERT INTO locations (
            name, description, latitude, longitude,
            category, crowd_level, is_open, is_featured,
            business_user_id, created_at, updated_at
          )
          VALUES (
            ${businessName},
            ${description || businessName},
            ${latitude}, ${longitude},
            ${businessType || 'restaurant'},
            'moderate', true, false,
            ${businessId}, NOW(), NOW()
          )
          ON CONFLICT (business_user_id)
          DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            category = EXCLUDED.category,
            updated_at = NOW()
        `;
        console.log('✅ Business profile City-V locations tablosuna senkronize edildi');
      } catch (syncError: any) {
        console.error('⚠️ City-V sync hatası (devam ediliyor):', syncError.message);
      }
    }

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
