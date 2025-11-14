import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, esp32_ip } = body;

    console.log('🔧 ESP32 Control Request:', { action, esp32_ip });

    if (action === 'reset-wifi') {
      // ESP32-CAM'e WiFi sıfırlama komutu gönder
      try {
        const response = await fetch(`http://${esp32_ip}/reset-wifi`, {
          method: 'GET',
          timeout: 5000
        });

        if (response.ok) {
          return NextResponse.json({
            success: true,
            message: 'WiFi reset command sent successfully',
            timestamp: Date.now()
          });
        } else {
          throw new Error('ESP32 response error');
        }
      } catch (error) {
        console.error('❌ ESP32 WiFi Reset Error:', error);
        return NextResponse.json({
          success: false,
          error: 'Could not connect to ESP32-CAM',
          message: 'ESP32-CAM bağlantı hatası. IP adresini kontrol edin.'
        }, { status: 500 });
      }
    }

    if (action === 'get-status') {
      // ESP32-CAM durumunu kontrol et
      try {
        const response = await fetch(`http://${esp32_ip}/status`, {
          method: 'GET',
          timeout: 5000
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            success: true,
            data,
            timestamp: Date.now()
          });
        } else {
          throw new Error('ESP32 status error');
        }
      } catch (error) {
        console.error('❌ ESP32 Status Error:', error);
        return NextResponse.json({
          success: false,
          error: 'Could not get ESP32 status',
          message: 'ESP32-CAM durumu alınamadı'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ ESP32 Control Error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request format' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  // ESP32-CAM kontrolcüsü için test endpoint'i
  return NextResponse.json({
    success: true,
    message: 'ESP32-CAM Control API is active',
    endpoints: {
      'POST /esp32/control': 'Send control commands',
      'actions': ['reset-wifi', 'get-status']
    },
    timestamp: Date.now()
  });
}