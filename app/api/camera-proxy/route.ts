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
    const authToken = searchParams.get('auth'); // Base64 encoded "user:pass"

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

    // Headers hazırla
    const requestHeaders: HeadersInit = {
      'User-Agent': 'CityV-Camera-Proxy/1.0',
      'Accept': 'multipart/x-mixed-replace, image/jpeg, */*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    // Basic Authentication ekle (eğer varsa)
    if (authToken) {
      requestHeaders['Authorization'] = `Basic ${authToken}`;
      console.log('🔐 Basic Auth eklendi');
    }

    // AbortController ile timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

    // ESP32-CAM'dan stream çek
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: controller.signal,
      // @ts-ignore - Next.js fetch options
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('❌ Stream hatası:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Kamera bağlantı hatası: ${response.statusText}` },
        { status: response.status }
      );
    }

    // CORS headers ile stream'i proxy et
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');

    console.log('✅ Stream proxy aktif:', streamUrl);

    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('❌ Camera proxy error:', {
      message: error.message,
      name: error.name,
      streamUrl: streamUrl
    });

    // Specific error handling
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Camera connection timeout', 
          details: `ESP32 camera at ${streamUrl} did not respond within 10 seconds`,
          code: 'TIMEOUT'
        },
        { status: 408 }
      );
    }

    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Camera connection refused', 
          details: `Cannot connect to ESP32 camera at ${streamUrl}. Please check camera is online.`,
          code: 'CONNECTION_REFUSED' 
        },
        { status: 503 }
      );
    }

    if (error.message?.includes('ENOTFOUND')) {
      return NextResponse.json(
        { 
          error: 'Camera not found', 
          details: `ESP32 camera IP address not found: ${streamUrl}`,
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        error: 'Camera proxy error', 
        details: error.message,
        code: 'UNKNOWN',
        streamUrl: streamUrl
      },
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
