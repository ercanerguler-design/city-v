const { sql } = require('@vercel/postgres');

async function checkTables() {
  try {
    console.log('🔍 Production veritabanı tabloları kontrol ediliyor...');
    
    // Business tablolarını kontrol et
    const businessTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'business_%'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Business tabloları:');
    businessTables.rows.forEach(row => {
      console.log('  ✅', row.table_name);
    });
    
    // business_staff tablosunu kontrol et
    try {
      const staffCheck = await sql`
        SELECT COUNT(*) as count, 
               EXISTS(SELECT 1 FROM business_staff LIMIT 1) as has_data
        FROM business_staff
      `;
      console.log('\n👥 business_staff tablosu:', staffCheck.rows[0]);
    } catch (error) {
      console.log('❌ business_staff tablosu bulunamadı:', error.message);
    }
    
    // business_menu_categories tablosunu kontrol et
    try {
      const menuCheck = await sql`
        SELECT COUNT(*) as count
        FROM business_menu_categories
      `;
      console.log('🍽️ business_menu_categories tablosu:', menuCheck.rows[0]);
    } catch (error) {
      console.log('❌ business_menu_categories tablosu bulunamadı:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
  }
}

checkTables();