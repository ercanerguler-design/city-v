import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = request.headers.get('remote-address');
    
    const clientIP = forwarded?.split(',')[0] || realIp || remoteAddress || '127.0.0.1';
    
    // Get additional network info
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const acceptLanguage = request.headers.get('accept-language') || 'Unknown';
    
    console.log(`🌐 Network info request from IP: ${clientIP}`);
    
    return Response.json({
      ip: clientIP,
      userAgent,
      acceptLanguage,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.log('🚨 Network info error:', error);
    return Response.json(
      { error: 'Failed to get network info' },
      { status: 500 }
    );
  }
}