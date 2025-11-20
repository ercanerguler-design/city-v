import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Server-side functions
async function createRemoteToken(businessUserId: number, deviceInfo: any): Promise<string> {
  try {
    // Register device if not exists
    const existing = await query(
      'SELECT id FROM business_trusted_devices WHERE business_user_id = $1 AND device_fingerprint = $2',
      [businessUserId, deviceInfo.fingerprint]
    );

    if (!existing.length) {
      await query(`
        INSERT INTO business_trusted_devices 
        (business_user_id, device_fingerprint, device_name, device_info, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [
        businessUserId, 
        deviceInfo.fingerprint, 
        deviceInfo.name,
        JSON.stringify(deviceInfo)
      ]);
    } else {
      await query(
        'UPDATE business_trusted_devices SET last_seen = NOW() WHERE business_user_id = $1 AND device_fingerprint = $2',
        [businessUserId, deviceInfo.fingerprint]
      );
    }
    
    const JWT_SECRET = process.env.JWT_SECRET || 'cityv-remote-secret-2024';
    const payload = {
      userId: businessUserId,
      type: 'remote_access',
      deviceFingerprint: deviceInfo.fingerprint,
      iat: Date.now(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };

    return jwt.sign(payload, JWT_SECRET);
    
  } catch (error) {
    console.log('🚨 Remote token creation error:', error);
    throw new Error('Token creation failed');
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
    return 'Unknown Location';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { businessUserId, deviceInfo } = await request.json();
    
    if (!businessUserId || !deviceInfo) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`🔐 Creating remote token for business user: ${businessUserId}`);
    
    // Create remote access token
    const token = await createRemoteToken(businessUserId, deviceInfo);
    
    // Track the session
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
                    
    const location = await getLocationFromIP(clientIP);
    
    await query(`
      INSERT INTO business_remote_sessions 
      (business_user_id, ip_address, device_info, location, accessed_at, session_type)
      VALUES ($1, $2, $3, $4, NOW(), 'remote')
    `, [
      businessUserId,
      clientIP,
      JSON.stringify(deviceInfo),
      location
    ]);
    
    console.log(`✅ Remote token created successfully`);
    
    return Response.json({
      token,
      expiresIn: '7d',
      deviceRegistered: true,
      location
    });
    
  } catch (error) {
    console.log('🚨 Remote token creation error:', error);
    return Response.json(
      { error: 'Failed to create remote token' },
      { status: 500 }
    );
  }
}