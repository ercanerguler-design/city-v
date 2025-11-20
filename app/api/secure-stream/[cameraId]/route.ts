import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Server-side token validation
async function validateRemoteAccessToken(token: string): Promise<number | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'cityv-remote-secret-2024';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.type !== 'remote_access') {
      throw new Error('Invalid token type');
    }

    // Check if device is still trusted
    const device = await query(
      'SELECT * FROM business_trusted_devices WHERE business_user_id = $1 AND device_fingerprint = $2 AND is_active = true',
      [decoded.userId, decoded.deviceFingerprint]
    );

    if (!device.length) {
      throw new Error('Device not trusted');
    }

    return decoded.userId;
    
  } catch (error) {
    console.log('🚨 Token validation error:', error);
    return null;
  }
}

async function getLocationFromIP(ipAddress: string): Promise<string> {
  try {
    if (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.')) {
      return 'Local Network';
    }

    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const data = await response.json();
    
    return `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
    
  } catch (error) {
    console.log('🌍 Location detection error:', error);
    return 'Unknown Location';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { cameraId: string } }
) {
  try {
    console.log(`📹 Remote camera access request for camera: ${params.cameraId}`);
    
    // 1. Get authorization token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return new Response('Authorization required', { status: 401 });
    }

    // 2. Validate remote access token via server utils
    const businessUserId = await validateRemoteAccessToken(token);
    
    if (!businessUserId) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    console.log(`✅ Token validated for business user: ${businessUserId}`);

    // 3. Verify camera ownership
    const cameraQuery = await query(`
      SELECT 
        bc.*,
        bp.business_name,
        bu.email as business_email
      FROM business_cameras bc
      JOIN business_profiles bp ON bc.business_profile_id = bp.id
      JOIN business_users bu ON bp.business_user_id = bu.id
      WHERE bc.id = $1 AND bu.id = $2 AND bc.is_active = true
    `, [params.cameraId, businessUserId]);

    if (!cameraQuery.length) {
      console.log(`❌ Camera not found or unauthorized access`);
      return new Response('Camera not found or unauthorized', { status: 404 });
    }

    const camera = cameraQuery[0];
    console.log(`🎥 Camera found: ${camera.camera_name} at ${camera.ip_address}`);

    // 4. Track remote access
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
                    
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const location = await getLocationFromIP(clientIP);

    // Track remote session
    await query(`
      INSERT INTO business_remote_sessions 
      (business_user_id, ip_address, device_info, location, accessed_at, session_type)
      VALUES ($1, $2, $3, $4, NOW(), 'remote')
    `, [
      businessUserId,
      clientIP,
      JSON.stringify({
        fingerprint: 'web-access',
        name: 'Web Browser',
        userAgent,
        platform: 'web'
      }),
      location
    ]);

    // 5. Log camera access
    await query(`
      INSERT INTO camera_access_logs 
      (camera_id, accessed_by, access_type, ip_address, user_agent, accessed_at)
      VALUES ($1, $2, 'remote', $3, $4, NOW())
    `, [params.cameraId, businessUserId, clientIP, userAgent]);

    // 6. Determine stream URL
    const streamUrl = camera.stream_url || `http://${camera.ip_address}:${camera.port || 80}/stream`;
    console.log(`🌐 Attempting to proxy stream from: ${streamUrl}`);

    // 7. Proxy the stream from ESP32-CAM
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(streamUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'CityV-Remote-Access/1.0',
          'Accept': 'image/jpeg, image/png, image/*'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Camera response not ok: ${response.status}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      console.log(`✅ Successfully connected to camera stream`);

      return new Response(response.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'X-Camera-Name': camera.camera_name,
          'X-Business-Name': camera.business_name,
          'X-Access-Type': 'remote'
        }
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.log(`❌ Stream fetch error:`, fetchError);
      
      // Return fallback image or error response
      return new Response(
        JSON.stringify({ 
          error: 'Camera stream unavailable',
          cameraId: params.cameraId,
          cameraName: camera.camera_name,
          message: 'Kamera şu anda erişilebilir değil. Cihazın açık ve internete bağlı olduğundan emin olun.'
        }), 
        { 
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'X-Camera-Status': 'offline'
          }
        }
      );
    }

  } catch (error) {
    console.log('🚨 Secure stream error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Kamera erişiminde bir hata oluştu.'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}