require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  console.log('🔄 Updating camera stream URLs from RTSP to HTTP...\n');
  
  await sql`
    UPDATE iot_devices 
    SET stream_url = 'http://192.168.1.3:80/stream'
    WHERE business_id = 20
  `;

  const cameras = await sql`
    SELECT device_id, device_name, stream_url, ip_address 
    FROM iot_devices 
    WHERE business_id = 20
  `;
  
  console.log('✅ Updated cameras:');
  cameras.rows.forEach(cam => {
    console.log(`  ${cam.device_name}: ${cam.stream_url}`);
  });
  
  process.exit(0);
})();
