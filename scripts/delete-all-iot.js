require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function cleanEverything() {
  try {
    console.log('🔥 TÜM DEMO VERİLERİ SİLİYORUM...');

    // 1. Delete ALL IoT data
    const deleted = await sql`DELETE FROM iot_ai_analysis`;
    console.log(`✅ ${deleted.rowCount || 0} IoT kayıt silindi`);

    // 2. Check
    const count = await sql`SELECT COUNT(*) as count FROM iot_ai_analysis`;
    console.log(`📊 Kalan IoT kayıt: ${count[0].count}`);

    if (count[0].count == 0) {
      console.log('\n✅ TAMAMEN TEMİZ!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

cleanEverything();
