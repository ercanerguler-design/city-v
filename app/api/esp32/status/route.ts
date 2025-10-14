import { NextRequest, NextResponse } from 'next/server';

// ESP32-CAM cihaz durumu kontrolü
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    deviceId: deviceId || 'unknown',
    status: 'active',
    message: 'ESP32-CAM device is online'
  });
}

// ESP32-CAM cihaz kaydı
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, macAddress, ipAddress, locationId, firmwareVersion } = body;

    console.log('📱 Yeni ESP32-CAM cihazı kaydedildi:', {
      deviceId,
      macAddress,
      ipAddress,
      locationId,
      firmwareVersion
    });

    // Cihaz bilgilerini kaydet (veritabanı işlemi)
    // Şimdilik konsola yazdırıyoruz

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
      deviceInfo: {
        deviceId,
        registeredAt: new Date().toISOString(),
        status: 'active'
      }
    });

  } catch (error) {
    console.error('❌ ESP32-CAM kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Device registration failed' },
      { status: 500 }
    );
  }
}