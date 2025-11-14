require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔧 Updating IP to 192.168.1.3...\n');

    await sql`
      UPDATE iot_devices 
      SET 
        ip_address = '192.168.1.3',
        stream_url = 'http://192.168.1.3:81/stream',
        rtsp_url = 'http://192.168.1.3:81/stream'
      WHERE business_id = 6
    `;

    const device = await sql`SELECT * FROM iot_devices WHERE business_id = 6`;
    
    console.log('✅ IP Updated:');
    console.log(`  Device: ${device.rows[0].device_name}`);
    console.log(`  IP: ${device.rows[0].ip_address}`);
    console.log(`  Stream: ${device.rows[0].stream_url}`);
    console.log(`\n🎥 Test Stream:`);
    console.log(`  http://192.168.1.3:81/stream`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
})();
