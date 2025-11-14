/**
 * Fix camera stream URL in database
 * Convert RTSP to HTTP for ESP32-CAM
 */

const { sql } = require('@vercel/postgres');

async function fixCameraUrl() {
  try {
    console.log('🔧 Fixing camera stream URL...');
    
    const result = await sql`
      UPDATE iot_devices 
      SET stream_url = 'http://192.168.1.3:80/stream'
      WHERE device_id = 40
      RETURNING device_id, device_name, stream_url, ip_address
    `;
    
    if (result.rows.length > 0) {
      console.log('✅ Camera updated successfully:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ Camera not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixCameraUrl();
