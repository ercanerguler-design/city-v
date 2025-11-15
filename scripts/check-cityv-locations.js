const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_UNPOOLED,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  // cityv_locations yapısı
  const cols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='cityv_locations' ORDER BY ordinal_position`);
  console.log('📋 cityv_locations kolonları:', cols.rows.map(r => r.column_name).join(', '));
  
  // Verileri çek
  const data = await client.query('SELECT * FROM cityv_locations');
  console.log('\n📍 Lokasyonlar (' + data.rows.length + ' adet):');
  data.rows.forEach(d => console.log(d));
  
  await client.end();
})().catch(console.error);
