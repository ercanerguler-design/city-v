require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessProfiles() {
  console.log('🔍 Business Profiles Konum Bilgileri:\n');

  const result = await sql`
    SELECT id, business_name, latitude, longitude, address, city, district
    FROM business_profiles
  `;

  console.log(`📊 Toplam ${result.length} business profili:\n`);

  result.forEach(r => {
    console.log(`${r.id}. ${r.business_name}`);
    console.log(`   Lat: ${r.latitude || 'YOK'}, Lng: ${r.longitude || 'YOK'}`);
    console.log(`   Adres: ${r.address || 'Yok'}, ${r.district || ''}, ${r.city || ''}`);
    console.log(`   Haritada görünür: ${r.latitude && r.longitude ? '✅ EVET' : '❌ HAYIR'}`);
    console.log('');
  });

  // Koordinat  olan business sayısı
  const withCoords = result.filter(r => r.latitude && r.longitude);
  console.log(`\n📍 Haritada görünecek business sayısı: ${withCoords.length}/${result.length}`);
}

checkBusinessProfiles();
