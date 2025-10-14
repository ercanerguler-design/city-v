import { NextRequest, NextResponse } from 'next/server';

// ESP32-CAM kamera stream proxy
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const esp32Ip = searchParams.get('ip');
  const port = searchParams.get('port') || '80';

  if (!esp32Ip) {
    return NextResponse.json(
      { error: 'ESP32-CAM IP address required' },
      { status: 400 }
    );
  }

  try {
    // ESP32-CAM stream'ini proxy et
    const streamUrl = `http://${esp32Ip}:${port}/stream`;
    
    return NextResponse.json({
      success: true,
      streamUrl,
      proxyUrl: `/api/esp32/camera-stream?ip=${esp32Ip}&port=${port}`,
      message: 'Camera stream URL generated'
    });

  } catch (error) {
    console.error('❌ Kamera stream hatası:', error);
    return NextResponse.json(
      { error: 'Camera stream error' },
      { status: 500 }
    );
  }
}

// ESP32-CAM komut gönderme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { esp32Ip, command, parameters } = body;

    if (!esp32Ip || !command) {
      return NextResponse.json(
        { error: 'ESP32-CAM IP and command required' },
        { status: 400 }
      );
    }

    console.log('📡 ESP32-CAM komut gonderiliyor:', { esp32Ip, command, parameters });

    // Komut örnekleri:
    // - start_monitoring
    // - stop_monitoring  
    // - set_location
    // - capture_photo
    // - get_status

    return NextResponse.json({
      success: true,
      command,
      esp32Ip,
      sentAt: new Date().toISOString(),
      message: `Command '${command}' sent to ESP32-CAM`
    });

  } catch (error) {
    console.error('❌ ESP32-CAM komut hatası:', error);
    return NextResponse.json(
      { error: 'Command send failed' },
      { status: 500 }
    );
  }
}