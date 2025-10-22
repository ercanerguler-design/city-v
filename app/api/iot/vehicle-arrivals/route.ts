import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - Araç gelişi takibi
export async function GET(request: NextRequest) {
  try {
    console.log('🚌 Araç gelişi verileri getiriliyor...');

    const { searchParams } = new URL(request.url);
    const stop_id = searchParams.get('stop_id');
    const line_id = searchParams.get('line_id');
    const status = searchParams.get('status'); // 'approaching', 'arrived', 'departed'
    const hours = searchParams.get('hours') || '2'; // Son kaç saat
    const limit = searchParams.get('limit') || '50';

    let query = `
      SELECT 
        iva.*,
        e.device_name,
        ts.stop_name,
        tl.line_code,
        tl.line_name,
        tc.city_name
      FROM iot_vehicle_arrivals iva
      JOIN esp32_devices e ON iva.device_id = e.device_id
      LEFT JOIN transport_stops ts ON iva.stop_id = ts.id
      LEFT JOIN transport_lines tl ON iva.line_id = tl.id
      LEFT JOIN turkey_cities tc ON ts.city_id = tc.id
      WHERE iva.created_at > NOW() - INTERVAL '${hours} hours'
    `;

    const params = [];
    let paramIndex = 1;

    if (stop_id) {
      query += ` AND iva.stop_id = $${paramIndex}`;
      params.push(stop_id);
      paramIndex++;
    }

    if (line_id) {
      query += ` AND iva.line_id = $${paramIndex}`;
      params.push(line_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND iva.arrival_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY iva.created_at DESC LIMIT ${limit}`;

    const result = await sql.query(query, params);

    // Özet istatistikler
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_arrivals,
        COUNT(CASE WHEN arrival_status = 'arrived' THEN 1 END) as arrived_count,
        COUNT(CASE WHEN arrival_status = 'approaching' THEN 1 END) as approaching_count,
        AVG(vehicle_occupancy_percent) as avg_occupancy,
        SUM(passenger_boarding) as total_boarding,
        SUM(passenger_alighting) as total_alighting
      FROM iot_vehicle_arrivals 
      WHERE created_at > NOW() - INTERVAL '${hours} hours'
      ${stop_id ? `AND stop_id = ${stop_id}` : ''}
      ${line_id ? `AND line_id = ${line_id}` : ''}
    `;

    const summary = await sql.query(summaryQuery);

    console.log(`✅ ${result.rows.length} araç gelişi bulundu`);

    return NextResponse.json({
      success: true,
      arrivals: result.rows,
      summary: summary.rows[0],
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Araç gelişi getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Araç gelişi verileri getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni araç gelişi kaydet (ESP32-CAM'dan gelen)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('🚌 Yeni araç gelişi kaydediliyor:', data.vehicle_number);

    const result = await sql`
      INSERT INTO iot_vehicle_arrivals (
        device_id, line_id, stop_id, vehicle_number, vehicle_type,
        arrival_status, distance_meters, estimated_arrival_seconds,
        actual_arrival_time, departure_time, passenger_boarding,
        passenger_alighting, vehicle_occupancy_percent, detection_confidence,
        image_url
      ) VALUES (
        ${data.device_id}, ${data.line_id || null}, ${data.stop_id || null},
        ${data.vehicle_number}, ${data.vehicle_type || 'bus'}, 
        ${data.arrival_status || 'approaching'}, ${data.distance_meters || null},
        ${data.estimated_arrival_seconds || null}, 
        ${data.actual_arrival_time ? data.actual_arrival_time : null},
        ${data.departure_time ? data.departure_time : null},
        ${data.passenger_boarding || 0}, ${data.passenger_alighting || 0},
        ${data.vehicle_occupancy_percent || 50}, ${data.detection_confidence || 90},
        ${data.image_url || null}
      ) RETURNING *
    `;

    // Realtime update gönder
    const priority = data.arrival_status === 'approaching' ? 2 : 1;
    await sql`
      INSERT INTO iot_realtime_updates (
        update_type, source_device_id, stop_id, line_id, update_data, priority_level
      ) VALUES (
        'vehicle_arrival', ${data.device_id}, ${data.stop_id || null}, 
        ${data.line_id || null},
        ${JSON.stringify({
          vehicle_number: data.vehicle_number,
          arrival_status: data.arrival_status,
          occupancy_percent: data.vehicle_occupancy_percent,
          estimated_arrival: data.estimated_arrival_seconds,
          timestamp: new Date().toISOString()
        })}, ${priority}
      )
    `;

    console.log('✅ Araç gelişi kaydedildi:', data.arrival_status);

    return NextResponse.json({
      success: true,
      arrival: result.rows[0],
      message: 'Araç gelişi başarıyla kaydedildi'
    });

  } catch (error) {
    console.error('❌ Araç gelişi kaydetme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Araç gelişi kaydedilemedi' },
      { status: 500 }
    );
  }
}