import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ESP32-CAM'den gelen veri formatı
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

    console.log('📡 ESP32-CAM Data Received:', {
      device_id,
      humans,
      density,
      sensitivity,
      resolution,
      uptime,
      fps
    });

    // Veriyi global store'a kaydet (gerçek uygulamada veritabanına kaydedilir)
    global.esp32Data = {
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
      message: 'Data received successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ ESP32-CAM Data Error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid data format' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // ESP32-CAM verilerini frontend'e gönder
    const data = global.esp32Data || {
      device_id: 'ESP32-AI-Demo',
      humans: 0,
      density: 0.0,
      sensitivity: 90,
      resolution: 128,
      uptime: 0,
      fps: 0,
      temperature: 25.0,
      timestamp: Date.now(),
      lastUpdate: Date.now(),
      status: 'disconnected'
    };

    // Son veri 30 saniyeden eski ise disconnected yap
    if (Date.now() - data.lastUpdate > 30000) {
      data.status = 'disconnected';
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('❌ ESP32-CAM Get Data Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}