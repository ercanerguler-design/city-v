const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_UNPOOLED,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  // iot_crowd_analysis tablosu kontrol
  const result = await client.query('SELECT COUNT(*) as count, MAX(timestamp) as latest FROM iot_crowd_analysis');
  console.log('📊 iot_crowd_analysis:', result.rows[0]);
  
  // cityv_locations tablosu kontrol (marker'lar buradan da gelebilir)
  const result2 = await client.query('SELECT COUNT(*) as count FROM cityv_locations');
  console.log('📊 cityv_locations:', result2.rows[0]);
  
  // Son crowd verileri
  const result3 = await client.query('SELECT * FROM iot_crowd_analysis ORDER BY timestamp DESC LIMIT 5');
  console.log('\n📍 Son 5 crowd analizi:');
  result3.rows.forEach(row => {
    console.log(`  - ${row.location || 'N/A'} (${row.latitude},${row.longitude}) - ${row.crowd_level} - ${row.people_count} kişi`);
  });
  
  // cityv_locations verilerini kontrol
  const result4 = await client.query('SELECT * FROM cityv_locations LIMIT 5');
  console.log('\n📍 İlk 5 location:');
  result4.rows.forEach(row => {
    console.log(`  - ${row.name} (${row.latitude},${row.longitude}) - ${row.type}`);
  });
  
  await client.end();
})();
