import { NextRequest, NextResponse } from 'next/server';

/**
 * Camera Stream Proxy
 * ESP32-CAM CORS sorununu bypass etmek için proxy endpoint
 * Browser -> Next.js API -> ESP32-CAM
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const streamUrl = searchParams.get('url');

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'Stream URL gerekli' },
        { status: 400 }
      );
    }

    // URL validation
    try {
      new URL(streamUrl);
    } catch {
      return NextResponse.json(
        { error: 'Geçersiz URL formatı' },
        { status: 400 }
      );
    }

    console.log('📹 Proxy stream başlatılıyor:', streamUrl);

    // ESP32-CAM'dan stream çek
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'CityV-Camera-Proxy/1.0',
        'Accept': 'multipart/x-mixed-replace, image/jpeg, */*',
      },
      // @ts-ignore - Next.js fetch options
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('❌ Stream hatası:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Kamera bağlantı hatası: ${response.statusText}` },
        { status: response.status }
      );
    }

    // CORS headers ile stream'i proxy et
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    console.log('✅ Stream proxy aktif:', streamUrl);

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('❌ Camera proxy error:', error.message);
    return NextResponse.json(
      { error: 'Proxy hatası', details: error.message },
      { status: 500 }
    );
  }
}

// OPTIONS request için CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
