require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function cleanAllDemoData() {
  try {
    console.log('🗑️ TÜMÜNÜ SİLİYORUM - Demo veriler...');

    // 1. Delete demo IoT data
    const deletedIoT = await sql`DELETE FROM iot_ai_analysis WHERE camera_id = 43`;
    console.log(`✅ ${deletedIoT.length} IoT kayıt silindi`);

    // 2. Delete demo staff
    const deletedStaff = await sql`DELETE FROM business_staff`;
    console.log(`✅ ${deletedStaff.length} personel silindi`);

    // 3. Check results
    const iotCount = await sql`SELECT COUNT(*) as count FROM iot_ai_analysis`;
    const staffCount = await sql`SELECT COUNT(*) as count FROM business_staff`;

    console.log('\n📊 Final State:');
    console.log(`IoT Records: ${iotCount[0].count}`);
    console.log(`Staff Records: ${staffCount[0].count}`);

    console.log('\n✅ TÜMÜ TEMİZ! Demo data yok artık.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

cleanAllDemoData();
