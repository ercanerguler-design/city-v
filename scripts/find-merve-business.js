require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    // Merve'yi bul
    const merveUser = await sql`
      SELECT id, email, company_name 
      FROM business_users 
      WHERE email = 'merveerguler93@gmail.com'`;
    
    console.log('👤 Merve Business User:', merveUser.rows[0]);

    // Tüm business kullanıcıları
    const allUsers = await sql`
      SELECT id, email, company_name 
      FROM business_users 
      ORDER BY id`;
    
    console.log('\n📋 All Business Users:');
    allUsers.rows.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Company: ${u.company_name}`);
    });

    // Her kullanıcı için IoT cihazları
    for (const user of allUsers.rows) {
      const devices = await sql`
        SELECT COUNT(*) as device_count 
        FROM iot_devices 
        WHERE business_id = ${user.id}`;
      console.log(`  → ID ${user.id} devices: ${devices.rows[0].device_count}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
})();
