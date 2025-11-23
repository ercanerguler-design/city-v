import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
    
    console.log('🤖 AI Analysis Data:', {
      device: data.device_id,
      camera_id: data.camera_id,
      ip: data.ip_address,
      people: data.people_count,
      density: data.crowd_density,
      confidence: data.confidence_score
    });

    // 🔄 OTOMATIK DEVICE_ID EŞLEŞTİRME
    // ESP32 camera_id gönderiyorsa, bunu direkt device_id olarak kullan (VARCHAR CAST)
    if (!data.device_id && data.camera_id) {
      console.log('🔍 Camera ID var, device_id olarak kullanılıyor:', data.camera_id);
      
      // Camera ID'nin varlığını kontrol et
      const matchQuery = await sql`
        SELECT id, camera_name, business_user_id, ip_address
        FROM business_cameras
        WHERE id = ${data.camera_id}
        LIMIT 1
      `;
      
      if (matchQuery && matchQuery.length > 0) {
        const camera = matchQuery[0];
        
        // camera_id'yi String olarak device_id'ye ata
        data.device_id = String(data.camera_id);
        
        console.log(`✅ Camera #${camera.id} (${camera.camera_name}) eşleştirildi`);
        console.log(`   📍 Device ID: ${data.device_id}`);
        console.log(`   🏢 Business User ID: ${camera.business_user_id}`);
      } else {
        console.log('⚠️ Camera ID ile eşleşen kamera bulunamadı:', data.camera_id);
      }
    } else if (!data.device_id && data.ip_address) {
      // IP adresi ile eşleştirme (fallback)
      console.log('🔍 IP adresi ile eşleştirme yapılıyor:', data.ip_address);
      
      const matchQuery = await sql`
        SELECT id, camera_name, business_user_id
        FROM business_cameras
        WHERE ip_address = ${data.ip_address}
        LIMIT 1
      `;
      
      if (matchQuery && matchQuery.length > 0) {
        const camera = matchQuery[0];
        data.device_id = String(camera.id); // Camera ID'yi device_id olarak kullan
        console.log(`✅ IP ${data.ip_address} ile Camera #${camera.id} eşleştirildi`);
      } else {
        console.log('⚠️ IP adresi ile eşleşen kamera bulunamadı:', data.ip_address);
      }
    }
    
    // Eğer hala device_id yoksa, hata döndür
    if (!data.device_id) {
      console.error('❌ Device ID bulunamadı ve oluşturulamadı');
      console.error('   📥 Gelen data:', { camera_id: data.camera_id, ip_address: data.ip_address });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Device ID gerekli. Lütfen camera_id veya ip_address gönderin.',
          hint: 'ESP32\'den camera_id veya ip_address göndermelisiniz',
          received: { camera_id: data.camera_id, ip_address: data.ip_address }
        },
        { status: 400 }
      );
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

    // Yoğunluk seviyesini otomatik hesapla
    let crowd_density = data.crowd_density || 'empty';
    if (!data.crowd_density) {
      if (data.people_count > 0 && data.people_count <= 3) crowd_density = 'low';
      else if (data.people_count > 3 && data.people_count <= 8) crowd_density = 'medium';
      else if (data.people_count > 8 && data.people_count <= 15) crowd_density = 'high';
      else if (data.people_count > 15) crowd_density = 'overcrowded';
    }

    const result = await sql`
      INSERT INTO iot_crowd_analysis (
        device_id, analysis_type, location_type, people_count, crowd_density,
        confidence_score, detection_objects, image_url, processing_time_ms,
        weather_condition, temperature, humidity, entry_count, exit_count,
        current_occupancy, trend_direction, movement_detected, detection_method
      ) VALUES (
        ${data.device_id}, 
        ${data.analysis_type || 'ai_people_count'}, 
        ${data.location_type || 'bus_stop'}, 
        ${data.people_count || 0}, 
        ${crowd_density},
        ${data.confidence_score || 0.85}, 
        ${JSON.stringify(data.detection_objects || data.people_count || 0)},
        ${data.image_url || null}, 
        ${data.processing_time_ms || 200},
        ${data.weather_condition || 'clear'}, 
        ${data.temperature || 20},
        ${data.humidity || 50},
        ${data.entry_count || 0},
        ${data.exit_count || 0},
        ${data.current_occupancy || data.people_count || 0},
        ${data.trend_direction || 'stable'},
        ${data.movement_detected || 0},
        ${data.detection_method || 'pro_multi_stage_ai'}
      ) RETURNING *
    `;

    // Realtime update gönder - ENHANCED with AI data
    await sql`
      INSERT INTO iot_realtime_updates (
        update_type, source_device_id, update_data, priority_level
      ) VALUES (
        'crowd_change', ${data.device_id}, 
        ${JSON.stringify({
          people_count: data.people_count,
          crowd_density: crowd_density,
          confidence_score: data.confidence_score,
          accuracy_estimate: data.accuracy_estimate || (data.confidence_score * 100),
          entry_count: data.entry_count || 0,
          exit_count: data.exit_count || 0,
          current_occupancy: data.current_occupancy || data.people_count,
          trend_direction: data.trend_direction || 'stable',
          foreground_percentage: data.foreground_percentage || 0,
          frame_number: data.frame_number || 0,
          algorithm_version: data.algorithm_version || '3.0_professional',
          analysis_stages: data.analysis_stages || 'histogram|background|blob_hog|optical_flow|kalman',
          timestamp: new Date().toISOString()
        })}, 
        ${crowd_density === 'high' || crowd_density === 'overcrowded' ? 3 : 1}
      )
    `;

    const accuracyPercent = data.accuracy_estimate || (data.confidence_score * 100);
    const accuracySymbol = accuracyPercent >= 90 ? '🎯' : accuracyPercent >= 75 ? '✓' : '⚠️';
    
    console.log(`${accuracySymbol} AI Analiz kaydedildi: ${crowd_density} | ${data.people_count} kişi | Doğruluk: ${accuracyPercent.toFixed(1)}%`);
    console.log(`📈 Algorithm: ${data.algorithm_version || 'N/A'} | Stages: ${data.analysis_stages || 'N/A'}`);

    // Return ESP32-CAM compatible response format
    return NextResponse.json({
      success: true,
      analysis: {
        person_count: data.people_count,
        crowd_density: data.crowd_density,
        confidence_score: data.confidence_score,
        heatmap_url: data.image_url || '/api/heatmap/' + data.device_id + '.jpg',
        processing_time: data.processing_time_ms
      },
      message: 'AI analysis completed successfully',
      accuracy: accuracyPercent,
      timestamp: new Date().toISOString(),
      device_id: data.device_id
    });

  } catch (error) {
    console.error('❌ Yoğunluk analizi ekleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Yoğunluk analizi eklenemedi' },
      { status: 500 }
    );
  }
}