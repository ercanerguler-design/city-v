import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { analyzeImageSimple } from '@/lib/simpleDetection';

// Python AI servisinin URL'i (Railway, Render vb.)
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || null;

// ESP32-CAM'den gelen fotoğrafı al ve analiz et
export async function POST(request: NextRequest) {
  try {
    console.log('📸 ESP32 AI analiz isteği alındı');
    
    // Headers'dan kamera bilgilerini al
    const cameraId = request.headers.get('X-Camera-ID') || '1';
    const locationZone = request.headers.get('X-Location-Zone') || 'Unknown';
    
    // JPEG binary data'yı al
    const imageBuffer = await request.arrayBuffer();
    const imageSize = imageBuffer.byteLength;
    
    console.log(`📊 Kamera ID: ${cameraId}, Konum: ${locationZone}, Boyut: ${imageSize} bytes`);
    
    if (imageSize === 0) {
      return NextResponse.json({
        success: false,
        error: 'Boş görüntü alındı'
      }, { status: 400 });
    }
    
    // AI Analysis
    let aiResult;
    
    if (PYTHON_AI_URL) {
      // External Python AI service (Production)
      console.log('🔗 External Python AI service kullanılıyor...');
      aiResult = await callPythonAIService(imageBuffer, cameraId, locationZone);
      
      if (!aiResult.success) {
        console.error('❌ Python AI hatası, basit detection\'a geçiliyor');
        // Fallback to simple detection
        const buffer = Buffer.from(imageBuffer);
        const analysis = analyzeImageSimple(buffer);
        aiResult = { success: true, analysis };
      }
    } else {
      // Simple detection (Vercel - no external AI)
      console.log('⚡ Basit detection kullanılıyor (PYTHON_AI_URL yok)');
      const buffer = Buffer.from(imageBuffer);
      const analysis = analyzeImageSimple(buffer);
      aiResult = { success: true, analysis };
    }
    
    const analysis = aiResult.analysis;
    
    // AI analiz sonucunu veritabanına kaydet
    const dbResult = await query(`
      INSERT INTO iot_ai_analysis 
      (camera_id, location_zone, person_count, crowd_density, detection_objects, heatmap_url, image_size, processing_time_ms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
    `, [
      parseInt(cameraId),
      locationZone,
      analysis.person_count,
      analysis.crowd_density,
      JSON.stringify(analysis.detection_objects),
      analysis.heatmap_url,
      imageSize,
      analysis.processing_time_ms
    ]);
    
    const analysisId = dbResult.rows[0].id;
    
    // Entry/Exit tracking (basit algoritma - daha sonra geliştirilecek)
    await trackEntryExit(parseInt(cameraId), locationZone, analysis.person_count, analysisId);
    
    // Zone occupancy kaydı
    await trackZoneOccupancy(parseInt(cameraId), locationZone, analysis, analysisId);
    
    console.log(`✅ AI analizi kaydedildi - ID: ${analysisId}, Kişi: ${analysis.person_count}`);
    
    return NextResponse.json({
      success: true,
      message: 'AI analizi tamamlandı',
      analysis: {
        person_count: analysis.person_count,
        crowd_density: analysis.crowd_density,
        density_level: analysis.density_level,
        heatmap_url: analysis.heatmap_url ? `${PYTHON_AI_URL}${analysis.heatmap_url}` : null,
        detection_objects: analysis.detection_objects,
        processing_time_ms: analysis.processing_time_ms
      }
    });
    
  } catch (error: any) {
    console.error('❌ AI analiz hatası:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'AI analizi başarısız'
    }, { status: 500 });
  }
}

// Python AI servisini çağır
async function callPythonAIService(imageBuffer: ArrayBuffer, cameraId: string, locationZone: string) {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'image.jpg');
    
    const response = await fetch(`${PYTHON_AI_URL}/analyze`, {
      method: 'POST',
      headers: {
        'X-Camera-ID': cameraId,
        'X-Location-Zone': locationZone
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Python AI HTTP ${response.status}`);
    }
    
    return await response.json();
    
  } catch (error: any) {
    console.error('❌ Python AI servisi hatası:', error);
    return {
      success: false,
      error: error.message || 'Python AI servisi çağrılamadı'
    };
  }
}

// Entry/Exit tracking
async function trackEntryExit(cameraId: number, locationZone: string, currentPersonCount: number, analysisId: number) {
  try {
    // Son kaydı al
    const lastRecord = await query(`
      SELECT current_occupancy FROM iot_entry_exit_logs 
      WHERE camera_id = $1 AND location_zone = $2 
      ORDER BY timestamp DESC LIMIT 1
    `, [cameraId, locationZone]);
    
    const lastOccupancy = lastRecord.rows.length > 0 ? lastRecord.rows[0].current_occupancy : 0;
    const diff = currentPersonCount - lastOccupancy;
    
    let entryCount = 0;
    let exitCount = 0;
    
    if (diff > 0) {
      entryCount = diff; // Artış = Giriş
    } else if (diff < 0) {
      exitCount = Math.abs(diff); // Azalma = Çıkış
    }
    
    // Kaydet
    await query(`
      INSERT INTO iot_entry_exit_logs 
      (camera_id, location_zone, entry_count, exit_count, current_occupancy, analysis_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [cameraId, locationZone, entryCount, exitCount, currentPersonCount, analysisId]);
    
  } catch (error) {
    console.error('❌ Entry/Exit tracking hatası:', error);
  }
}

// Zone occupancy tracking
async function trackZoneOccupancy(cameraId: number, locationZone: string, analysis: any, analysisId: number) {
  try {
    await query(`
      INSERT INTO iot_zone_occupancy 
      (camera_id, zone_name, person_count, crowd_density, density_level, heatmap_url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      cameraId,
      locationZone,
      analysis.person_count,
      analysis.crowd_density,
      analysis.density_level,
      analysis.heatmap_url
    ]);
    
  } catch (error) {
    console.error('❌ Zone occupancy tracking hatası:', error);
  }
}

// Son AI analiz sonuçlarını getir + Entry/Exit + Zone stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraId = searchParams.get('camera_id');
    const businessId = searchParams.get('business_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeStats = searchParams.get('include_stats') === 'true';
    
    let queryText = `
      SELECT 
        id,
        camera_id,
        location_zone,
        person_count,
        crowd_density,
        detection_objects,
        heatmap_url,
        image_size,
        processing_time_ms,
        created_at
      FROM iot_ai_analysis
    `;
    
    const params: any[] = [];
    
    if (cameraId) {
      queryText += ' WHERE camera_id = $1';
      params.push(parseInt(cameraId));
      queryText += ' ORDER BY created_at DESC LIMIT $2';
      params.push(limit);
    } else {
      queryText += ' ORDER BY created_at DESC LIMIT $1';
      params.push(limit);
    }
    
    const result = await query(queryText, params);
    
    const response: any = {
      success: true,
      count: result.rows.length,
      analyses: result.rows
    };
    
    // İstatistikleri de ekle
    if (includeStats) {
      // Current occupancy
      const occupancyResult = await query(`
        SELECT * FROM v_current_occupancy
        ${cameraId ? 'WHERE camera_id = $1' : ''}
        ORDER BY last_update DESC
      `, cameraId ? [parseInt(cameraId)] : []);
      
      // Hourly traffic
      const trafficResult = await query(`
        SELECT * FROM v_hourly_traffic
        ${businessId ? 'WHERE business_id = $1' : ''}
        LIMIT 24
      `, businessId ? [parseInt(businessId)] : []);
      
      // Zone density
      const zoneResult = await query(`
        SELECT * FROM v_zone_density_realtime
        ${businessId ? 'WHERE business_id = $1' : ''}
      `, businessId ? [parseInt(businessId)] : []);
      
      response.stats = {
        current_occupancy: occupancyResult.rows,
        hourly_traffic: trafficResult.rows,
        zone_density: zoneResult.rows
      };
    }
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('❌ AI analiz getirme hatası:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
