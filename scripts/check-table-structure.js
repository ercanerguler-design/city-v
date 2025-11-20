const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_UNPOOLED,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  // Tablo yapısını kontrol et
  const result = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name='iot_crowd_analysis' 
    ORDER BY ordinal_position
  `);
  
  console.log('📋 iot_crowd_analysis tablosu kolonları:');
  result.rows.forEach(row => {
    console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
  });
  
  // Gerçek veriyi çek
  const result2 = await client.query('SELECT * FROM iot_crowd_analysis ORDER BY id DESC LIMIT 1');
  console.log('\n📊 Son kayıt (tüm kolonlar):');
  console.log(result2.rows[0]);
  
  await client.end();
})().catch(console.error);
