require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  const cameras = await sql`
    SELECT 
      device_id,
      device_name,
      ip_address,
      stream_url,
      rtsp_url,
      business_id
    FROM iot_devices 
    WHERE business_id = 20
  `;
  
  console.log('\n📹 Business 20 Cameras:');
  cameras.rows.forEach(cam => {
    console.log('\n---');
    console.log('ID:', cam.device_id);
    console.log('Name:', cam.device_name);
    console.log('IP:', cam.ip_address);
    console.log('Stream URL:', cam.stream_url);
    console.log('RTSP URL:', cam.rtsp_url);
  });

  // Test URL oluşturma
  const cam = cameras.rows[0];
  if (cam) {
    console.log('\n🔗 Expected Stream URL:');
    console.log('From DB:', cam.stream_url);
    console.log('\n✅ Frontend should use this URL directly');
  }
  
  process.exit(0);
})();
