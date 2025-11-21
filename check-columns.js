const { neon } = require('@neondatabase/serverless');

async function checkColumns() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔍 business_profiles tablosunu kontrol ediyoruz...');
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'business_profiles'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 business_profiles kolonları:');
    result.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type})`);
    });
    
    // Verified kolonu var mı kontrol et
    const hasVerified = result.some(col => col.column_name === 'verified');
    console.log('\n✅ verified kolonu var mı?', hasVerified);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkColumns();