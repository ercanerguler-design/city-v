import { NextRequest, NextResponse } from 'next/server';

// ESP32-CAM'den gelen kalabalık raporlarını işle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, crowdLevel, timestamp, deviceId, coordinates } = body;

    console.log('📡 ESP32-CAM Raporu alındı:', {
      locationId,
      crowdLevel,
      deviceId,
      timestamp: new Date(timestamp).toISOString()
    });

    // Burada veritabanına kaydetme işlemi yapılabilir
    // Şimdilik konsola yazdırıyoruz
    
    // Kalabalık seviyesini validate et
    const validCrowdLevels = ['empty', 'low', 'moderate', 'high', 'very_high'];
    if (!validCrowdLevels.includes(crowdLevel)) {
      return NextResponse.json(
        { error: 'Invalid crowd level' },
        { status: 400 }
      );
    }

    // Başarılı yanıt
    return NextResponse.json({
      success: true,
      message: 'Crowd report received successfully',
      data: {
        locationId,
        crowdLevel,
        processedAt: new Date().toISOString(),
        deviceId
      }
    });

  } catch (error) {
    console.error('❌ ESP32-CAM API hatası:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ESP32-CAM cihazlarından GET isteği için
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'ESP32-CAM Crowd Report API',
    version: '1.0.0',
    endpoints: {
      'POST /api/esp32/crowd-report': 'Kalabalık raporu gönder',
      'GET /api/esp32/status': 'Cihaz durumu kontrol et'
    }
  });
}