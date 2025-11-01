require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT 
    id, 
    business_name, 
    latitude, 
    longitude,
    CONCAT('[', latitude, ', ', longitude, ']') as leaflet_format,
    CONCAT('[', longitude, ', ', latitude, ']') as wrong_format
  FROM business_profiles 
  WHERE latitude IS NOT NULL 
    AND longitude IS NOT NULL 
  LIMIT 5
`).then(r => {
  console.log('\n📍 DATABASE KOORDINATLARI:\n');
  r.rows.forEach(row => {
    console.log(`🏢 ${row.business_name}`);
    console.log(`   Database: lat=${row.latitude}, lng=${row.longitude}`);
    console.log(`   Leaflet [lat,lng]: ${row.leaflet_format}`);
    console.log(`   Wrong [lng,lat]: ${row.wrong_format}`);
    console.log('');
  });
  pool.end();
}).catch(e => {
  console.error('❌ Hata:', e.message);
  pool.end();
});
