import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - Yoğunluk analizi verileri
export async function GET(request: NextRequest) {
  try {
    console.log('👥 Yoğunluk analizi verileri getiriliyor...');

    const { searchParams } = new URL(request.url);
    const device_id = searchParams.get('device_id');
    const location_type = searchParams.get('location_type');
    const hours = searchParams.get('hours') || '24'; // Son kaç saat
    const limit = searchParams.get('limit') || '100';

    let query = `
      SELECT 
        ica.*,
        e.device_name,
        e.location_type,
        ts.stop_name,
        tl.line_code,
        tc.city_name
      FROM iot_crowd_analysis ica
      JOIN esp32_devices e ON ica.device_id = e.device_id
      LEFT JOIN transport_stops ts ON e.stop_id = ts.id
      LEFT JOIN transport_lines tl ON e.line_id = tl.id
      LEFT JOIN turkey_cities tc ON e.city_id = tc.id
      WHERE ica.analysis_timestamp > NOW() - INTERVAL '${hours} hours'
    `;

    const params = [];
    let paramIndex = 1;

    if (device_id) {
      query += ` AND ica.device_id = $${paramIndex}`;
      params.push(device_id);
      paramIndex++;
    }

    if (location_type) {
      query += ` AND e.location_type = $${paramIndex}`;
      params.push(location_type);
      paramIndex++;
    }

    query += ` ORDER BY ica.analysis_timestamp DESC LIMIT ${limit}`;

    const result = await sql.query(query, params);

    // En son analiz verileri için özet istatistik
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_analyses,
        AVG(people_count) as avg_people_count,
        MAX(people_count) as max_people_count,
        COUNT(CASE WHEN crowd_density = 'high' OR crowd_density = 'overcrowded' THEN 1 END) as high_density_count,
        AVG(confidence_score) as avg_confidence
      FROM iot_crowd_analysis 
      WHERE analysis_timestamp > NOW() - INTERVAL '${hours} hours'
      ${device_id ? `AND device_id = '${device_id}'` : ''}
    `;

    const summary = await sql.query(summaryQuery);

    console.log(`✅ ${result.rows.length} analiz verisi bulundu`);

    return NextResponse.json({
      success: true,
      analyses: result.rows,
      summary: summary.rows[0],
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Yoğunluk analizi getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Yoğunluk analizi getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni yoğunluk analizi ekle (ESP32-CAM'dan gelen)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('👥 Yeni yoğunluk analizi ekleniyor:', data.device_id);

    // Yoğunluk seviyesini otomatik hesapla
    let crowd_density = 'empty';
    if (data.people_count > 0 && data.people_count <= 5) crowd_density = 'low';
    else if (data.people_count > 5 && data.people_count <= 15) crowd_density = 'medium';
    else if (data.people_count > 15 && data.people_count <= 25) crowd_density = 'high';
    else if (data.people_count > 25) crowd_density = 'overcrowded';

    const result = await sql`
      INSERT INTO iot_crowd_analysis (
        device_id, analysis_type, location_type, people_count, crowd_density,
        confidence_score, detection_objects, image_url, processing_time_ms,
        weather_condition, temperature, humidity
      ) VALUES (
        ${data.device_id}, ${data.analysis_type || 'people_count'}, 
        ${data.location_type}, ${data.people_count || 0}, ${crowd_density},
        ${data.confidence_score || 85}, ${JSON.stringify(data.detection_objects || {})},
        ${data.image_url || null}, ${data.processing_time_ms || 200},
        ${data.weather_condition || 'Güneşli'}, ${data.temperature || 20},
        ${data.humidity || 50}
      ) RETURNING *
    `;

    // Realtime update gönder
    await sql`
      INSERT INTO iot_realtime_updates (
        update_type, source_device_id, update_data, priority_level
      ) VALUES (
        'crowd_change', ${data.device_id}, 
        ${JSON.stringify({
          people_count: data.people_count,
          crowd_density: crowd_density,
          confidence_score: data.confidence_score,
          timestamp: new Date().toISOString()
        })}, 
        ${crowd_density === 'high' || crowd_density === 'overcrowded' ? 3 : 1}
      )
    `;

    console.log('✅ Yoğunluk analizi eklendi:', crowd_density);

    return NextResponse.json({
      success: true,
      analysis: result.rows[0],
      message: 'Yoğunluk analizi başarıyla kaydedildi'
    });

  } catch (error) {
    console.error('❌ Yoğunluk analizi ekleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Yoğunluk analizi eklenemedi' },
      { status: 500 }
    );
  }
}