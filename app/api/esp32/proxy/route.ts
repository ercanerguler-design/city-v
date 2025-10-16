import { NextRequest, NextResponse } from 'next/server';

// ESP32-CAM Stream Proxy
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return NextResponse.json({ error: 'IP parameter required' }, { status: 400 });
  }

  try {
    console.log(`🔄 Proxying stream from: http://${ip}/stream`);
    
    // ESP32-CAM stream'ini fetch et
    const response = await fetch(`http://${ip}/stream`, {
      method: 'GET',
      headers: {
        'Accept': 'multipart/x-mixed-replace, */*',
      }
    });

    if (!response.ok) {
      throw new Error(`ESP32 response: ${response.status}`);
    }

    // Response'u proxy olarak döndür
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'multipart/x-mixed-replace;boundary=frame',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Failed to proxy ESP32 stream', details: error.message },
      { status: 500 }
    );
  }
}