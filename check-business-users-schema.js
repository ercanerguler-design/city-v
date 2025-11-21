const { neon } = require('@neondatabase/serverless');

async function checkBusinessUsersSchema() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('📋 business_users tablo şeması kontrol ediliyor...');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'business_users'
      ORDER BY ordinal_position
    `;
    
    console.log('🗂️ business_users kolonları:');
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type})`);
    });
    
    // Tüm business user datalarını kontrol et
    console.log('\n👥 Mevcut business users:');
    const users = await sql`SELECT * FROM business_users`;
    console.log('Toplam kayıt:', users.length);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('\nİlk user\'in tüm alanları:');
      Object.keys(user).forEach(key => {
        console.log(`  ${key}: ${user[key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkBusinessUsersSchema();