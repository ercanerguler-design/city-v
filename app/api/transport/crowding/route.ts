import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const {
      reportType, // 'vehicle' | 'stop'
      lineId,
      stopId,
      vehicleId,
      crowdingLevel, // 'empty', 'low', 'medium', 'high', 'full'
      crowdingPercentage,
      estimatedPassengers,
      currentLatitude,
      currentLongitude,
      userId,
      weatherCondition,
      notes
    } = await request.json();
    
    console.log('📊 Yoğunluk raporu alınıyor:', { reportType, crowdingLevel });
    
    // Raporu kaydet
    const result = await sql`
      INSERT INTO transport_crowding_reports (
        report_type, line_id, stop_id, vehicle_id, crowding_level,
        crowding_percentage, estimated_passengers, current_latitude,
        current_longitude, reported_by, weather_condition, notes
      )
      VALUES (
        ${reportType}, ${lineId}, ${stopId}, ${vehicleId}, ${crowdingLevel},
        ${crowdingPercentage}, ${estimatedPassengers}, ${currentLatitude},
        ${currentLongitude}, ${userId}, ${weatherCondition}, ${notes}
      )
      RETURNING *
    `;
    
    // Kullanıcıya XP ver (eğer giriş yapmışsa)
    if (userId) {
      try {
        await sql`
          UPDATE users 
          SET ai_credits = COALESCE(ai_credits, 0) + 10
          WHERE id = ${userId}
        `;
        console.log('✅ Kullanıcıya 10 XP verildi');
      } catch (xpError) {
        console.error('⚠️ XP verme hatası:', xpError);
        // XP hatası rapor kaydını etkilemesin
      }
    }
    
    console.log('✅ Yoğunluk raporu kaydedildi');
    
    return NextResponse.json({
      success: true,
      report: result.rows[0],
      xpEarned: userId ? 10 : 0
    });
    
  } catch (error) {
    console.error('❌ Yoğunluk raporu hatası:', error);
    return NextResponse.json(
      { 
        error: 'Rapor kaydedilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get('lineId');
    const stopId = searchParams.get('stopId');
    const hours = parseInt(searchParams.get('hours') || '2'); // Son 2 saat
    
    console.log('📊 Canlı yoğunluk verileri getiriliyor...');
    
    let query = `
      SELECT 
        r.*,
        l.line_code,
        l.line_name,
        l.line_type,
        l.color_code,
        s.stop_name,
        s.stop_type,
        u.name as reporter_name
      FROM transport_crowding_reports r
      LEFT JOIN transport_lines l ON r.line_id = l.id
      LEFT JOIN transport_stops s ON r.stop_id = s.id
      LEFT JOIN users u ON r.reported_by = u.id
      WHERE r.created_at > NOW() - INTERVAL '${hours} hours'
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (lineId) {
      query += ` AND r.line_id = $${paramIndex++}`;
      params.push(lineId);
    }
    
    if (stopId) {
      query += ` AND r.stop_id = $${paramIndex++}`;
      params.push(stopId);
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT 100`;
    
    const result = await sql.query(query, params);
    
    console.log(`✅ ${result.rows.length} canlı rapor bulundu`);
    
    return NextResponse.json({
      success: true,
      reports: result.rows,
      count: result.rows.length,
      timeRange: `${hours} saat`
    });
    
  } catch (error) {
    console.error('❌ Canlı yoğunluk verisi hatası:', error);
    return NextResponse.json(
      { 
        error: 'Canlı veriler getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}