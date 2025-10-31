// Business locations kontrol scripti
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkBusinessLocations() {
  try {
    console.log('🔍 Business profiles kontrol ediliyor...\n');

    // Toplam business sayısı
    const countResult = await pool.query(`
      SELECT COUNT(*) as total FROM business_profiles
    `);
    console.log('📊 Toplam business sayısı:', countResult.rows[0].total);

    // Konumu olan business'lar
    const withLocationResult = await pool.query(`
      SELECT COUNT(*) as total FROM business_profiles
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    console.log('📍 Konumu olan business sayısı:', withLocationResult.rows[0].total);

    // Business detayları
    const businessesResult = await pool.query(`
      SELECT 
        id,
        business_name,
        business_type,
        latitude,
        longitude,
        address,
        city
      FROM business_profiles
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('\n📋 Son eklenen 10 business:\n');
    businessesResult.rows.forEach((business, i) => {
      console.log(`${i+1}. ${business.business_name}`);
      console.log(`   Tip: ${business.business_type || 'Belirtilmemiş'}`);
      console.log(`   Konum: [${business.latitude}, ${business.longitude}]`);
      console.log(`   Adres: ${business.address || 'Yok'}`);
      console.log(`   Şehir: ${business.city || 'Yok'}`);
      console.log('');
    });

    // API formatında test
    console.log('\n🔬 API Format Testi:\n');
    const apiTestResult = await pool.query(`
      SELECT 
        bp.id as business_id,
        bp.business_name,
        bp.business_type,
        bp.latitude,
        bp.longitude,
        bp.address
      FROM business_profiles bp
      WHERE bp.latitude IS NOT NULL 
        AND bp.longitude IS NOT NULL
      LIMIT 1
    `);

    if (apiTestResult.rows.length > 0) {
      const business = apiTestResult.rows[0];
      console.log('Örnek API Response:');
      console.log(JSON.stringify({
        id: business.business_id,
        name: business.business_name,
        category: business.business_type,
        coordinates: [business.longitude, business.latitude],
        address: business.address
      }, null, 2));
      
      console.log('\n✅ Leaflet için doğru format:');
      console.log(`[${business.latitude}, ${business.longitude}] (lat, lng)`);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Hata:', error);
    await pool.end();
    process.exit(1);
  }
}

checkBusinessLocations();
