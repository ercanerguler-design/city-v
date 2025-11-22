import { NextRequest, NextResponse } from 'next/server';

/**
 * Camera Stream Proxy - Uzaktan erişim için
 * ESP32-CAM local network'te olsa bile, backend üzerinden stream'i proxy eder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraUrl = searchParams.get('url');

    if (!cameraUrl) {
      return NextResponse.json(
        { error: 'Camera URL gerekli' },
        { status: 400 }
      );
    }

    console.log('📹 Stream proxy:', cameraUrl);

    // ESP32-CAM'den stream'i fetch et
    const response = await fetch(cameraUrl, {
      headers: {
        'User-Agent': 'CityV-Backend-Proxy/1.0',
      },
      // Timeout ekle (30 saniye)
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error('❌ Stream fetch failed:', response.status);
      return NextResponse.json(
        { error: 'Kamera erişilemedi' },
        { status: 502 }
      );
    }

    // Stream'i olduğu gibi döndür (MJPEG)
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'multipart/x-mixed-replace; boundary=frame');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Stream body'yi döndür
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('❌ Stream proxy error:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Kamera bağlantısı zaman aşımına uğradı' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Stream hatası', details: error.message },
      { status: 500 }
    );
  }
}

