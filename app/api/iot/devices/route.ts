import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - IoT cihazları listesi
export async function GET(request: NextRequest) {
  try {
    console.log('📷 IoT cihazları getiriliyor...');

    const { searchParams } = new URL(request.url);
    const location_type = searchParams.get('location_type'); // 'bus_stop', 'vehicle', 'station'
    const city_id = searchParams.get('city_id');
    const is_online = searchParams.get('is_online');

    let query = `
      SELECT 
        e.*,
        tc.city_name,
        ts.stop_name,
        tl.line_code,
        tl.line_name,
        CASE 
          WHEN e.last_heartbeat > NOW() - INTERVAL '5 minutes' THEN true 
          ELSE false 
        END as is_currently_online
      FROM esp32_devices e
      LEFT JOIN turkey_cities tc ON e.city_id = tc.id
      LEFT JOIN transport_stops ts ON e.stop_id = ts.id
      LEFT JOIN transport_lines tl ON e.line_id = tl.id
      WHERE e.is_active = true
    `;

    const params = [];
    let paramIndex = 1;

    if (location_type) {
      query += ` AND e.location_type = $${paramIndex}`;
      params.push(location_type);
      paramIndex++;
    }

    if (city_id) {
      query += ` AND e.city_id = $${paramIndex}`;
      params.push(city_id);
      paramIndex++;
    }

    if (is_online === 'true') {
      query += ` AND e.last_heartbeat > NOW() - INTERVAL '5 minutes'`;
    }

    query += ` ORDER BY e.last_heartbeat DESC`;

    const result = await sql.query(query, params);

    console.log(`✅ ${result.rows.length} IoT cihazı bulundu`);

    return NextResponse.json({
      success: true,
      devices: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ IoT cihazları getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'IoT cihazları getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni IoT cihazı ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('📷 Yeni IoT cihazı ekleniyor:', data.device_name);

    const result = await sql`
      INSERT INTO esp32_devices (
        device_id, device_name, device_type, location_type,
        stop_id, line_id, city_id, latitude, longitude,
        ip_address, mac_address, firmware_version, config
      ) VALUES (
        ${data.device_id}, ${data.device_name}, ${data.device_type || 'ESP32-CAM'}, 
        ${data.location_type}, ${data.stop_id || null}, ${data.line_id || null}, 
        ${data.city_id || null}, ${data.latitude || null}, ${data.longitude || null},
        ${data.ip_address || null}, ${data.mac_address || null}, 
        ${data.firmware_version || 'v2.1.0'}, ${JSON.stringify(data.config || {})}
      ) RETURNING *
    `;

    console.log('✅ IoT cihazı eklendi:', result.rows[0].device_name);

    return NextResponse.json({
      success: true,
      device: result.rows[0],
      message: 'IoT cihazı başarıyla eklendi'
    });

  } catch (error) {
    console.error('❌ IoT cihazı ekleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'IoT cihazı eklenemedi' },
      { status: 500 }
    );
  }
}