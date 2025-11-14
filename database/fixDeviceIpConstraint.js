const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function fixDeviceIp() {
  try {
    console.log('🔧 device_ip kolonunu nullable yapıyoruz...');
    
    await sql`ALTER TABLE iot_crowd_analysis ALTER COLUMN device_ip DROP NOT NULL`;
    console.log('✅ device_ip artık NULL olabilir');
    
    await sql`ALTER TABLE iot_crowd_analysis ALTER COLUMN camera_id DROP NOT NULL`;
    console.log('✅ camera_id artık NULL olabilir');
    
    process.exit(0);
  } catch (error) {
    console.error('❌', error.message);
    process.exit(1);
  }
}

fixDeviceIp();
