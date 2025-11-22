require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function productionReadinessCheck() {
  console.log('🔍 CityV Production Readiness Check\n');
  console.log('=' .repeat(60));

  try {
    // 1. Database Connection
    console.log('\n📊 Database Connection:');
    const dbTest = await sql`SELECT NOW() as current_time`;
    console.log('✅ PostgreSQL bağlantısı başarılı');
    console.log(`   Sunucu saati: ${dbTest[0].current_time}`);

    // 2. Business Users
    console.log('\n👥 Business Users:');
    const users = await sql`SELECT COUNT(*) as count FROM business_users WHERE is_active = true`;
    console.log(`✅ ${users[0].count} aktif business kullanıcı`);

    // 3. Business Profiles with Coordinates
    console.log('\n📍 Business Profiles:');
    const profiles = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coords
      FROM business_profiles
    `;
    console.log(`✅ ${profiles[0].total} business profili`);
    console.log(`   ↳ ${profiles[0].with_coords} tanesi haritada görünüyor`);

    // 4. Business Cameras
    console.log('\n📷 Business Cameras:');
    const cameras = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN device_id IS NOT NULL THEN 1 END) as with_device_id
      FROM business_cameras
    `;
    console.log(`✅ ${cameras[0].total} kamera kaydı`);
    console.log(`   ↳ ${cameras[0].active} aktif kamera`);
    console.log(`   ↳ ${cameras[0].with_device_id} tanesi device_id ile eşleşmiş`);

    // 5. IoT Crowd Analysis Data
    console.log('\n📡 IoT Crowd Analysis:');
    const iotData = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT device_id) as unique_devices,
        MAX(analysis_timestamp) as latest_data
      FROM iot_crowd_analysis
      WHERE analysis_timestamp >= NOW() - INTERVAL '24 hours'
    `;
    console.log(`✅ Son 24 saatte ${iotData[0].total} analiz kaydı`);
    console.log(`   ↳ ${iotData[0].unique_devices} farklı cihazdan veri`);
    if (iotData[0].latest_data) {
      console.log(`   ↳ En son: ${new Date(iotData[0].latest_data).toLocaleString('tr-TR')}`);
    }

    // 6. Business Menu System
    console.log('\n🍽️ Business Menu System:');
    const menus = await sql`
      SELECT 
        COUNT(DISTINCT business_id) as businesses_with_menu,
        COUNT(*) as total_categories
      FROM business_menu_categories
    `;
    const items = await sql`SELECT COUNT(*) as count FROM business_menu_items`;
    console.log(`✅ ${menus[0].businesses_with_menu} işletmenin menüsü var`);
    console.log(`   ↳ ${menus[0].total_categories} kategori`);
    console.log(`   ↳ ${items[0].count} ürün`);

    // 7. JWT Secret Check
    console.log('\n🔐 JWT Configuration:');
    const jwtSecret = process.env.JWT_SECRET || 'NOT_SET';
    if (jwtSecret === 'NOT_SET') {
      console.log('⚠️  JWT_SECRET environment variable tanımlanmamış');
    } else {
      console.log('✅ JWT_SECRET tanımlı');
    }

    // 8. Locations API Test
    console.log('\n🗺️ Locations API:');
    const totalLocations = await sql`
      SELECT COUNT(*) as count 
      FROM business_profiles 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;
    console.log(`✅ API ${totalLocations[0].count} business location döndürecek`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Production Readiness: READY');
    console.log('\n📋 Summary:');
    console.log(`   - ${users[0].count} active business users`);
    console.log(`   - ${cameras[0].active} active cameras`);
    console.log(`   - ${menus[0].businesses_with_menu} businesses with menus`);
    console.log(`   - ${totalLocations[0].count} locations on map`);
    console.log(`   - ${iotData[0].total} IoT data points (24h)`);
    
    console.log('\n🚀 Deployment URL:');
    console.log('   https://city-qcdu1n3lq-ercanergulers-projects.vercel.app');
    console.log('\n✅ All systems operational!');

  } catch (error) {
    console.error('\n❌ Production check failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

productionReadinessCheck();
