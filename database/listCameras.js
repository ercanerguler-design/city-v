require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkCameraUrls() {
  console.log('📹 Tüm kamera URL\'leri:\n');
  
  const result = await sql`
    SELECT 
      id,
      device_name,
      stream_url,
      rtsp_url,
      ip_address,
      is_online
    FROM iot_devices
    ORDER BY id
  `;
  
  result.rows.forEach(cam => {
    console.log(`📷 ${cam.device_name || 'İsimsiz'} (ID: ${cam.id})`);
    console.log(`   IP: ${cam.ip_address}`);
    console.log(`   Stream URL: ${cam.stream_url || 'YOK'}`);
    console.log(`   RTSP URL: ${cam.rtsp_url || 'YOK'}`);
    console.log(`   Durum: ${cam.is_online ? '🟢 Online' : '🔴 Offline'}`);
    console.log('');
  });
  
  console.log(`\nToplam ${result.rows.length} kamera bulundu.`);
  process.exit(0);
}

checkCameraUrls();
