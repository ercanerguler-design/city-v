import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cityCode: string }> }
) {
  try {
    const { cityCode } = await params;
    console.log('🚌 Hat listesi getiriliyor:', cityCode);
    
    const result = await sql`
      SELECT 
        l.*,
        a.agency_name,
        a.agency_code,
        a.primary_color as agency_color,
        c.city_name,
        COUNT(DISTINCT lsc.stop_id) as stop_count
      FROM transport_lines l
      JOIN turkey_cities c ON l.city_id = c.id
      LEFT JOIN transport_agencies a ON l.agency_id = a.id
      LEFT JOIN line_stop_connections lsc ON l.id = lsc.line_id
      WHERE c.city_code = ${cityCode} AND l.is_active = true
      GROUP BY l.id, a.agency_name, a.agency_code, a.primary_color, c.city_name
      ORDER BY l.line_type, l.line_code
    `;
    
    console.log(`✅ ${result.rows.length} hat bulundu`);
    
    return NextResponse.json({
      success: true,
      lines: result.rows,
      count: result.rows.length,
      cityCode
    });
    
  } catch (error) {
    console.error('❌ Hat listesi hatası:', error);
    return NextResponse.json(
      { 
        error: 'Hat listesi getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cityCode: string }> }
) {
  try {
    const { cityCode } = await params;
    const {
      lineCode,
      lineName,
      lineType,
      agencyId,
      farePrice,
      frequencyMinutes,
      vehicleCapacity,
      colorCode,
      operatingHours,
      routeDescription
    } = await request.json();
    
    console.log('🚌 Yeni hat ekleniyor:', lineCode);
    
    // Şehir ID'sini bul
    const cityResult = await sql`
      SELECT id FROM turkey_cities WHERE city_code = ${cityCode}
    `;
    
    if (cityResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Şehir bulunamadı' },
        { status: 404 }
      );
    }
    
    const cityId = cityResult.rows[0].id;
    
    const result = await sql`
      INSERT INTO transport_lines (
        line_code, line_name, line_type, city_id, agency_id,
        fare_price, frequency_minutes, vehicle_capacity, color_code,
        operating_hours, route_description
      )
      VALUES (
        ${lineCode}, ${lineName}, ${lineType}, ${cityId}, ${agencyId},
        ${farePrice}, ${frequencyMinutes}, ${vehicleCapacity}, ${colorCode},
        ${operatingHours ? JSON.stringify(operatingHours) : null}, ${routeDescription}
      )
      RETURNING *
    `;
    
    console.log('✅ Hat eklendi:', result.rows[0].line_code);
    
    return NextResponse.json({
      success: true,
      line: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Hat ekleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Hat eklenemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}