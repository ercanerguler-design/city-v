require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkBusiness15() {
  try {
    console.log('🔍 Checking Business ID 15...\n');

    // 1. Business user kontrol
    const businessUser = await sql`SELECT * FROM business_users WHERE id = 15`;
    console.log('✅ Business User:', businessUser.rows[0]);

    // 2. IoT devices kontrol
    const devices = await sql`SELECT * FROM iot_devices WHERE business_id = 15`;
    console.log('\n📹 IoT Devices:', devices.rows);

    // 3. Crowd analysis verileri
    const analysis = await sql`
      SELECT COUNT(*) as count, 
             MAX(timestamp) as latest_data,
             SUM(current_occupancy) as total_occupancy
      FROM iot_crowd_analysis ica
      JOIN iot_devices id ON ica.device_id = id.device_id
      WHERE id.business_id = 15`;
    console.log('\n📊 Analysis Data:', analysis.rows[0]);

    // 4. Bugünkü veriler
    const todayData = await sql`
      SELECT COUNT(*) as count,
             SUM(current_occupancy) as total_visitors
      FROM iot_crowd_analysis ica
      JOIN iot_devices id ON ica.device_id = id.device_id
      WHERE id.business_id = 15
        AND DATE(ica.timestamp) = CURRENT_DATE`;
    console.log('\n📅 Today Data:', todayData.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkBusiness15();
