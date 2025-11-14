import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔧 Fixing camera 40 database...');

    // 1. Check current state
    const current = await sql`
      SELECT id, camera_name, business_user_id, ip_address, username, stream_url
      FROM business_cameras 
      WHERE id = 40
    `;

    console.log('📋 Current camera 40:', current.rows[0]);

    // 2. Update to HTTP stream (no auth) and assign to user 20
    const updated = await sql`
      UPDATE business_cameras
      SET 
        stream_url = 'http://192.168.1.3:80/stream',
        username = NULL,
        password = NULL,
        business_user_id = 20,
        port = 80
      WHERE id = 40
      RETURNING *
    `;

    console.log('✅ Camera 40 updated:', updated.rows[0]);

    // 3. Also update iot_devices for consistency
    await sql`
      UPDATE iot_devices
      SET stream_url = 'http://192.168.1.3:80/stream'
      WHERE device_id = 29
    `;

    console.log('✅ iot_devices 29 updated');

    return NextResponse.json({
      success: true,
      message: 'Camera database fixed! Refresh your browser.',
      before: current.rows[0],
      after: updated.rows[0]
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
