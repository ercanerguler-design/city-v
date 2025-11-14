/**
 * FIX CAMERA DATABASE
 * Problem: Camera 40 has RTSP URL and wrong username
 * Solution: Update to HTTP URL and verify ownership
 */

const { sql } = require('@vercel/postgres');

async function fixCameraDatabase() {
  try {
    console.log('🔧 Starting camera database fix...\n');

    // 1. Check current camera data
    console.log('📋 Current camera 40 data:');
    const current = await sql`
      SELECT 
        id, 
        camera_name,
        business_user_id,
        ip_address,
        port,
        username,
        stream_url
      FROM business_cameras 
      WHERE id = 40
    `;
    
    console.log(current.rows[0]);
    console.log('');

    // 2. Check who user 20 is (your actual user)
    console.log('👤 User 20 details:');
    const user20 = await sql`
      SELECT id, email, company_name, membership_type
      FROM business_users
      WHERE id = 20
    `;
    console.log(user20.rows[0]);
    console.log('');

    // 3. Update camera to HTTP URL (no username/password for ESP32-CAM)
    console.log('🔄 Updating camera 40 to HTTP stream...');
    const updated = await sql`
      UPDATE business_cameras
      SET 
        stream_url = 'http://192.168.1.3:80/stream',
        username = NULL,
        password = NULL,
        business_user_id = 20
      WHERE id = 40
      RETURNING *
    `;
    
    console.log('✅ Camera updated:');
    console.log({
      id: updated.rows[0].id,
      name: updated.rows[0].camera_name,
      owner: updated.rows[0].business_user_id,
      ip: updated.rows[0].ip_address,
      stream_url: updated.rows[0].stream_url,
      username: updated.rows[0].username
    });
    console.log('');

    // 4. Also update iot_devices table (for consistency)
    console.log('🔄 Updating iot_devices table...');
    await sql`
      UPDATE iot_devices
      SET stream_url = 'http://192.168.1.3:80/stream'
      WHERE device_id = 29
    `;
    console.log('✅ iot_devices updated\n');

    console.log('🎉 Database fix complete!');
    console.log('Now refresh your browser (Ctrl+Shift+F5) to see the camera stream.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixCameraDatabase();
