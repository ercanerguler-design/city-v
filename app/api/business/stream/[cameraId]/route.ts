/**
 * ESP32-CAM Stream Proxy
 * CORS ve Mixed Content sorunlarını çözmek için proxy endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CameraData {
  stream_url: string;
  ip_address: string;
}

// CORS preflight handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cameraId: string }> }
) {
  const { cameraId } = await params;

  try {
    console.log(`🎥 Stream proxy request for camera ${cameraId}`);

    // Get camera details from business_cameras table (frontend uses this table)
    const result = await sql<CameraData>`
      SELECT stream_url, ip_address
      FROM business_cameras 
      WHERE id = ${parseInt(cameraId)}
    `;

    if (result.rows.length === 0) {
      console.log(`❌ Camera ${cameraId} not found in business_cameras`);
      return new NextResponse('Camera not found', { status: 404 });
    }

    const camera = result.rows[0];
    let streamUrl = camera.stream_url;

    // Convert RTSP to HTTP for ESP32-CAM
    if (!streamUrl || streamUrl.startsWith('rtsp://') || !streamUrl.startsWith('http')) {
      streamUrl = `http://${camera.ip_address}:80/stream`;
      console.log(`🔄 Converted RTSP/invalid URL to HTTP: ${streamUrl}`);
    }

    console.log(`📡 Proxying stream from: ${streamUrl}`);

    // Fetch stream from ESP32 (25s timeout for single-client rotation)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 seconds - hızlı rotation

    try {
      const response = await fetch(streamUrl, {
        method: 'GET',
        headers: {
          'Accept': 'multipart/x-mixed-replace; boundary=frame',
          'Connection': 'keep-alive',
        },
        // @ts-ignore - Node.js fetch options
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`❌ ESP32 returned status: ${response.status}`);
        return new NextResponse(`ESP32 error: ${response.status}`, { 
          status: response.status 
        });
      }

      console.log(`✅ Stream connected, proxying data...`);

      // Proxy the stream with correct headers
      return new NextResponse(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
          'Connection': 'keep-alive',
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.log('⏱️ ESP32 stream timeout (25s) - Rotating for next connection');
        return new NextResponse('Stream rotation', { status: 503 });
      }
      throw fetchError;
    }

  } catch (error: any) {
    console.error(`❌ Stream proxy error:`, error);
    return new NextResponse(`Proxy error: ${error.message}`, { 
      status: 500 
    });
  }
}
