import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // CityV AI Kamerası'ndan gelen veri formatı
    const {
      device_id,
      humans,
      density,
      sensitivity,
      resolution,
      uptime,
      fps,
      temperature,
      timestamp
    } = body;

    console.log('📡 CityV AI Kamerası Verisi Alındı:', {
      device_id,
      humans,
      density,
      sensitivity,
      resolution,
      uptime,
      fps
    });

    // Veriyi global store'a kaydet (gerçek uygulamada veritabanına kaydedilir)
    global.cameraData = {
      device_id,
      humans: parseInt(humans) || 0,
      density: parseFloat(density) || 0.0,
      sensitivity: parseInt(sensitivity) || 90,
      resolution: parseInt(resolution) || 128,
      uptime: parseInt(uptime) || 0,
      fps: parseInt(fps) || 0,
      temperature: parseFloat(temperature) || 25.0,
      timestamp: timestamp || Date.now(),
      lastUpdate: Date.now(),
      status: 'active'
    };

    return NextResponse.json({
      success: true,
      message: 'CityV AI Kamerası verisi başarıyla alındı',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ CityV AI Kamerası Veri Hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Geçersiz veri formatı' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // CityV AI Kamerası verilerini frontend'e gönder
    const data = global.cameraData || {
      device_id: 'CityV-AI-Camera-Demo',
      humans: Math.floor(Math.random() * 25 + 5), // Gerçek zamanlı demo veri
      density: Math.random() * 8 + 1,
      sensitivity: 90,
      resolution: 128,
      uptime: Math.floor(Date.now() / 1000) % 86400, // Günlük uptime
      fps: Math.floor(Math.random() * 5 + 25), // 25-30 FPS
      temperature: Math.random() * 10 + 20, // 20-30°C
      timestamp: Date.now(),
      lastUpdate: Date.now(),
      status: 'active' // Her zaman aktif (demo için)
    };

    // Gerçek zamanlı demo veriler - her istekte farklı değerler
    data.humans = Math.floor(Math.random() * 25 + 5);
    data.density = parseFloat((Math.random() * 8 + 1).toFixed(1));
    data.fps = Math.floor(Math.random() * 5 + 25);
    data.temperature = parseFloat((Math.random() * 10 + 20).toFixed(1));
    data.timestamp = Date.now();
    data.lastUpdate = Date.now();

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('❌ CityV AI Kamerası Veri Alma Hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}