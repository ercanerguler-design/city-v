import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    console.log('🏙️ Şehir listesi getiriliyor...');
    
    const result = await sql`
      SELECT 
        c.*,
        COUNT(DISTINCT l.id) as line_count,
        COUNT(DISTINCT s.id) as stop_count,
        COUNT(DISTINCT a.id) as agency_count
      FROM turkey_cities c
      LEFT JOIN transport_lines l ON c.id = l.city_id AND l.is_active = true
      LEFT JOIN transport_stops s ON c.id = s.city_id AND s.is_active = true  
      LEFT JOIN transport_agencies a ON c.id = a.city_id AND a.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.population DESC
    `;
    
    console.log(`✅ ${result.rows.length} şehir bulundu`);
    
    return NextResponse.json({
      success: true,
      cities: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Şehir listesi hatası:', error);
    return NextResponse.json(
      { 
        error: 'Şehir listesi getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      cityName, 
      cityCode, 
      region, 
      population, 
      transportTier,
      hasMetro,
      hasBus,
      hasTram,
      hasFerry,
      latitude,
      longitude 
    } = await request.json();
    
    console.log('🏙️ Yeni şehir ekleniyor:', cityName);
    
    const result = await sql`
      INSERT INTO turkey_cities (
        city_name, city_code, region, population, transport_tier,
        has_metro, has_bus, has_tram, has_ferry, latitude, longitude
      )
      VALUES (
        ${cityName}, ${cityCode}, ${region}, ${population}, ${transportTier},
        ${hasMetro || false}, ${hasBus || true}, ${hasTram || false}, 
        ${hasFerry || false}, ${latitude}, ${longitude}
      )
      RETURNING *
    `;
    
    console.log('✅ Şehir eklendi:', result.rows[0].city_name);
    
    return NextResponse.json({
      success: true,
      city: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Şehir ekleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Şehir eklenemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}