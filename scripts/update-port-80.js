require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  await sql`
    UPDATE iot_devices 
    SET 
      ip_address = '192.168.1.3',
      stream_url = 'http://192.168.1.3:80/stream',
      rtsp_url = 'http://192.168.1.3:80/stream'
    WHERE business_id = 6
  `;

  const device = await sql`
    SELECT device_name, ip_address, stream_url 
    FROM iot_devices 
    WHERE business_id = 6
  `;
  
  console.log('✅ Updated to Port 80:');
  console.log('  Device:', device.rows[0].device_name);
  console.log('  Stream:', device.rows[0].stream_url);
  console.log('\n🎥 Test: http://192.168.1.3:80/stream');
  
  process.exit(0);
})();
