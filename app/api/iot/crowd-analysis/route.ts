import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// 🤖 MOCK AI ANALYSIS FUNCTION - Simulates real AI processing
function performMockAIAnalysis(imageBuffer: Buffer) {
  const startTime = Date.now();
  
  // Simulate AI processing time
  const baseProcessingTime = 150 + Math.random() * 100; // 150-250ms
  
  // Mock person detection based on image characteristics
  const imageSize = imageBuffer.length;
  const timeOfDay = new Date().getHours();
  
  // Realistic person count simulation
  let personCount = 0;
  let confidence = 0.7 + Math.random() * 0.2; // 70-90%
  
  // Simulate detection based on image size and time
  if (imageSize > 50000) { // Larger images might have more people
    if (timeOfDay >= 7 && timeOfDay <= 9) { // Morning rush
      personCount = Math.floor(Math.random() * 8) + 2; // 2-10 people
    } else if (timeOfDay >= 17 && timeOfDay <= 19) { // Evening rush  
      personCount = Math.floor(Math.random() * 6) + 3; // 3-9 people
    } else if (timeOfDay >= 10 && timeOfDay <= 16) { // Day time
      personCount = Math.floor(Math.random() * 4) + 1; // 1-5 people
    } else { // Night/early morning
      personCount = Math.floor(Math.random() * 2); // 0-2 people
    }
  } else {
    // Smaller image, fewer people likely
    personCount = Math.floor(Math.random() * 3);
  }
  
  // Determine crowd density
  let crowdDensity = 'empty';
  if (personCount === 0) crowdDensity = 'empty';
  else if (personCount <= 3) crowdDensity = 'low';
  else if (personCount <= 6) crowdDensity = 'medium';
  else if (personCount <= 10) crowdDensity = 'high';
  else crowdDensity = 'overcrowded';
  
  // Create detection objects array
  const objects = [];
  for (let i = 0; i < personCount; i++) {
    objects.push({
      type: 'person',
      confidence: (0.8 + Math.random() * 0.15).toFixed(2),
      bbox: {
        x: Math.floor(Math.random() * 1200),
        y: Math.floor(Math.random() * 800),
        width: 60 + Math.random() * 40,
        height: 120 + Math.random() * 60
      }
    });
  }
  
  const processingTime = Date.now() - startTime + baseProcessingTime;
  
  console.log('🎯 Mock AI Results:', {
    persons: personCount,
    density: crowdDensity,
    confidence: confidence.toFixed(2),
    processing: processingTime + 'ms',
    timeContext: timeOfDay + ':00h'
  });
  
  return {
    person_count: personCount,
    crowd_density: crowdDensity,
    confidence: confidence,
    objects: objects,
    processing_time: Math.floor(processingTime),
    heatmap_url: null // Can be added later
  };
}

// GET - Yoğunluk analizi verileri
export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    console.log('👥 Yoğunluk analizi verileri getiriliyor...');

    const { searchParams } = new URL(request.url);
    const device_id = searchParams.get('device_id');
    const location_type = searchParams.get('location_type');
    const hours = searchParams.get('hours') || '24'; // Son kaç saat
    const limit = searchParams.get('limit') || '100';

    // Simplified query without complex JOINs to avoid table existence issues
    // Use Neon template literals for parameterized queries
    let result;
    
    if (device_id) {
      result = await sql`
        SELECT ica.*
        FROM iot_crowd_analysis ica
        WHERE ica.analysis_timestamp > NOW() - INTERVAL '${hours} hours'
          AND ica.device_id = ${device_id}
        ORDER BY ica.analysis_timestamp DESC 
        LIMIT ${parseInt(limit)}
      `;
    } else {
      result = await sql`
        SELECT ica.*
        FROM iot_crowd_analysis ica
        WHERE ica.analysis_timestamp > NOW() - INTERVAL '${hours} hours'
        ORDER BY ica.analysis_timestamp DESC 
        LIMIT ${parseInt(limit)}
      `;
    }

    // En son analiz verileri için özet istatistik
    const summary = device_id
      ? await sql`
          SELECT 
            COUNT(*) as total_analyses,
            COALESCE(AVG(people_count), 0) as avg_people_count,
            COALESCE(MAX(people_count), 0) as max_people_count,
            COUNT(CASE WHEN crowd_density = 'high' OR crowd_density = 'overcrowded' THEN 1 END) as high_density_count,
            COALESCE(AVG(confidence_score), 0) as avg_confidence
          FROM iot_crowd_analysis 
          WHERE analysis_timestamp > NOW() - INTERVAL '${hours} hours'
            AND device_id = ${device_id}
        `
      : await sql`
          SELECT 
            COUNT(*) as total_analyses,
            COALESCE(AVG(people_count), 0) as avg_people_count,
            COALESCE(MAX(people_count), 0) as max_people_count,
            COUNT(CASE WHEN crowd_density = 'high' OR crowd_density = 'overcrowded' THEN 1 END) as high_density_count,
            COALESCE(AVG(confidence_score), 0) as avg_confidence
          FROM iot_crowd_analysis 
          WHERE analysis_timestamp > NOW() - INTERVAL '${hours} hours'
        `;

    console.log(`✅ ${result.length} analiz verisi bulundu`);

    return NextResponse.json({
      success: true,
      analyses: result,
      summary: summary[0] || {
        total_analyses: 0,
        avg_people_count: 0,
        max_people_count: 0,
        high_density_count: 0,
        avg_confidence: 0
      },
      count: result.length
    });

  } catch (error) {
    console.error('❌ Yoğunluk analizi getirme hatası:', error);
    console.error('Hata detayı:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return empty data instead of error to prevent UI crash
    return NextResponse.json({
      success: true,
      analyses: [],
      summary: {
        total_analyses: 0,
        avg_people_count: 0,
        max_people_count: 0,
        high_density_count: 0,
        avg_confidence: 0
      },
      count: 0,
      error: error instanceof Error ? error.message : 'Database query failed'
    });
  }
}

// POST - Yeni yoğunluk analizi ekle (ESP32-CAM'dan gelen)
export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    console.log('📸 ESP32-CAM AI Analysis Request Received');
    
    // Check content type
    const contentType = request.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);
    
    let data;
    let imageBuffer = null;
    
    if (contentType?.includes('image/jpeg')) {
      // Handle binary image data from ESP32-CAM
      console.log('🖼️ Processing binary image data from ESP32-CAM');
      imageBuffer = Buffer.from(await request.arrayBuffer());
      
      // Get camera info from headers
      const cameraId = request.headers.get('X-Camera-ID') || '29';
      const locationZone = request.headers.get('X-Location-Zone') || 'Giris-Kapisi';
      
      console.log('📷 Camera ID:', cameraId);
      console.log('📍 Location:', locationZone);
      console.log('📏 Image size:', imageBuffer.length, 'bytes');
      
      // Mock AI analysis for now (replace with actual AI later)
      const mockAnalysis = performMockAIAnalysis(imageBuffer);
      
      data = {
        device_id: parseInt(cameraId),
        analysis_type: 'esp32_cam_ai',
        location_type: 'entrance',
        people_count: mockAnalysis.person_count,
        crowd_density: mockAnalysis.crowd_density,
        confidence_score: mockAnalysis.confidence,
        detection_objects: mockAnalysis.objects,
        processing_time_ms: mockAnalysis.processing_time,
        image_size: imageBuffer.length
      };
    } else {
      // Handle JSON data
      data = await request.json();
    }
    
    console.log('🤖 Professional Detection Data:', {
      device: data.device_id,
      camera_id: data.camera_id,
      location: data.location_id,
      people: data.people_count,
      confidence: data.confidence,
      quality: data.quality_grade,
      method: data.detection_method,
      mode: data.mode,
      calibrated: data.calibrated
    });

    // 🔄 ESP32 Professional Detection - Direkt device_id kullan
    if (data.camera_id) {
      console.log('🔍 Professional Camera ID:', data.camera_id);
      data.device_id = String(data.camera_id);
      console.log(`✅ Camera ID → Device ID: ${data.device_id}`);
    }
    
    // Eğer hala device_id yoksa varsayılan kullan (test için)
    if (!data.device_id) {
      data.device_id = "CAM-PROF-DEFAULT";
      console.log('⚠️ Device ID yok, varsayılan kullanılıyor:', data.device_id);
    }
    
    console.log('🤖 Final Analysis Data:', {
      device_id: data.device_id,
      people: data.people_count,
      density: data.crowd_density,
      confidence: data.confidence_score
    });
    console.log('📊 Detaylı Veri:', {
      people: data.people_count,
      accuracy: data.accuracy_estimate,
      entry: data.entry_count,
      exit: data.exit_count,
      occupancy: data.current_occupancy,
      trend: data.trend_direction,
      algorithm: data.algorithm_version,
      foreground: data.foreground_percentage
    });

    // Yoğunluk seviyesini otomatik hesapla (ESP32 Professional Detection ile uyumlu)
    let crowd_density = data.density_level || data.crowd_density || 'empty';
    if (!crowd_density || crowd_density === 'empty') {
      const peopleCount = data.people_count || 0;
      if (peopleCount === 0) crowd_density = 'empty';
      else if (peopleCount > 0 && peopleCount <= 5) crowd_density = 'low';
      else if (peopleCount > 5 && peopleCount <= 15) crowd_density = 'medium';
      else if (peopleCount > 15 && peopleCount <= 30) crowd_density = 'high';
      else crowd_density = 'overcrowded';
    }

    // 🎯 Professional Detection Mode bilgisi
    console.log('📊 Detection Details:', {
      mode: data.mode || 'balanced',
      confidence: data.confidence || data.confidence_score || 0,
      quality_grade: data.quality_grade || 'N/A',
      processing_time: data.processing_time_ms || 0,
      false_positive_risk: data.false_positive_risk || 0,
      calibrated: data.calibrated || false,
      lighting_level: data.lighting_level || 'N/A'
    });

    console.log('💾 SAVING PROFESSIONAL DETECTION TO DATABASE:', {
      device_id: data.device_id,
      camera_id: data.camera_id,
      location_id: data.location_id,
      people_count: data.people_count,
      crowd_density: crowd_density,
      confidence: data.confidence || data.confidence_score,
      quality_grade: data.quality_grade,
      detection_method: data.detection_method,
      mode: data.mode,
      calibrated: data.calibrated
    });

    // 🎯 Professional Detection - detection_objects oluştur
    const detectionObjectsJson = JSON.stringify([{
      type: 'person',
      count: data.people_count || 0,
      confidence: data.confidence || data.confidence_score || 0.85,
      quality_grade: data.quality_grade || 'N/A',
      detection_method: data.detection_method || 'consensus',
      mode: data.mode || 'balanced',
      false_positive_risk: data.false_positive_risk || 0,
      processing_time_ms: data.processing_time_ms || 0,
      calibrated: data.calibrated || false,
      lighting_level: data.lighting_level || 0
    }]);

    console.log('🔍 Detection metadata:', detectionObjectsJson);

    // Database'e kaydet
    const result = await sql(
      `INSERT INTO iot_crowd_analysis (
        device_id, analysis_type, location_type, people_count, crowd_density,
        confidence_score, detection_objects, image_url, processing_time_ms,
        weather_condition, temperature, humidity, entry_count, exit_count,
        current_occupancy, trend_direction, movement_detected, detection_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [
        data.device_id,
        'professional_detection',
        data.location_id || 'general',
        data.people_count || 0,
        crowd_density,
        data.confidence || data.confidence_score || 0.85,
        detectionObjectsJson,
        data.image_url || null,
        data.processing_time_ms || 0,
        data.weather_condition || 'clear',
        data.temperature || 20,
        data.humidity || 50,
        data.entry_count || 0,
        data.exit_count || 0,
        data.current_occupancy || data.people_count || 0,
        data.trend_direction || 'stable',
        data.movement_detected || 0,
        data.detection_method || 'consensus'
      ]
    );
    
    console.log('✅ PROFESSIONAL DETECTION SAVED:', {
      id: result[0]?.id,
      device_id: result[0]?.device_id,
      camera_id: data.camera_id,
      people_count: result[0]?.people_count,
      crowd_density: result[0]?.crowd_density,
      confidence: result[0]?.confidence_score,
      quality_grade: data.quality_grade,
      timestamp: result[0]?.analysis_timestamp
    });

    // 🔥 Realtime update gönder (eğer tablo varsa)
    try {
      await sql(
        `INSERT INTO iot_realtime_updates (
          update_type, source_device_id, update_data, priority_level
        ) VALUES ($1, $2, $3, $4)`,
        [
          'crowd_change',
          data.device_id,
          JSON.stringify({
            people_count: data.people_count,
            crowd_density: crowd_density,
            confidence: data.confidence || data.confidence_score,
            quality_grade: data.quality_grade || 'N/A',
            detection_method: data.detection_method || 'consensus',
            mode: data.mode || 'balanced',
            false_positive_risk: data.false_positive_risk || 0,
            processing_time_ms: data.processing_time_ms || 0,
            calibrated: data.calibrated || false,
            lighting_level: data.lighting_level || 0,
            timestamp: new Date().toISOString()
          }),
          crowd_density === 'high' || crowd_density === 'overcrowded' ? 3 : 1
        ]
      );
      console.log('✅ Realtime update gönderildi');
    } catch (updateError) {
      console.warn('⚠️ Realtime update gönderilemedi (tablo yok olabilir):', updateError);
    }

    const confidence = data.confidence || data.confidence_score || 0;
    const accuracySymbol = confidence >= 90 ? '🎯' : confidence >= 75 ? '✓' : '⚠️';
    
    console.log(`${accuracySymbol} Professional Detection: ${crowd_density} | ${data.people_count} kişi | Güven: ${confidence.toFixed(1)}% | Kalite: ${data.quality_grade || 'N/A'}`);
    console.log(`📈 Mode: ${data.mode || 'balanced'} | Method: ${data.detection_method || 'consensus'} | Calibrated: ${data.calibrated ? 'Yes' : 'No'}`);

    // Return ESP32 Professional Detection compatible response
    return NextResponse.json({
      success: true,
      analysis_id: result[0]?.id,
      device_id: data.device_id,
      camera_id: data.camera_id,
      people_count: data.people_count,
      crowd_density: crowd_density,
      confidence: confidence,
      quality_grade: data.quality_grade || 'N/A',
      detection_method: data.detection_method || 'consensus',
      mode: data.mode || 'balanced',
      processing_time_ms: data.processing_time_ms || 0,
      calibrated: data.calibrated || false,
      false_positive_risk: data.false_positive_risk || 0,
      message: '🎯 Professional detection kayıt başarılı',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Camera-ID, X-Location-Zone'
      }
    });

  } catch (error) {
    console.error('❌ Yoğunluk analizi ekleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Yoğunluk analizi eklenemedi' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Camera-ID, X-Location-Zone'
        }
      }
    );
  }
}

// OPTIONS - CORS preflight (ESP32 için gerekli)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Camera-ID, X-Location-Zone',
      'Access-Control-Max-Age': '86400'
    }
  });
}