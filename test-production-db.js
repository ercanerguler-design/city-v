const { sql } = require('@vercel/postgres');

async function testProductionDB() {
  try {
    console.log('🔍 Production Database Test...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Database bağlantı başarılı!');
    console.log('⏰ Zaman:', result.rows[0].current_time);
    console.log('🗄️ Version:', result.rows[0].db_version.split(' ').slice(0, 2).join(' '));
    
    // Beta table check
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'beta_applications'
      ) as table_exists
    `;
    
    console.log('\n📋 beta_applications tablosu:', tableCheck.rows[0].table_exists ? '✅ Mevcut' : '❌ Yok');
    
    if (tableCheck.rows[0].table_exists) {
      // Count records
      const countResult = await sql`SELECT COUNT(*) as total FROM beta_applications`;
      console.log('📊 Toplam kayıt sayısı:', countResult.rows[0].total);
      
      // Test insert with proper goals array
      const testApplicationId = 'TEST-' + Date.now();
      try {
        await sql`
          INSERT INTO beta_applications (
            application_id, business_name, owner_name, email, phone,
            location, business_type, average_daily, opening_hours,
            current_solution, goals, heard_from, status, created_at
          ) VALUES (
            ${testApplicationId}, 'Test Production', 'Test Owner', 'test@production.com', '555-1234',
            'Test Location', 'Test Business', '50-100', '09:00-17:00', 
            'none', ARRAY['Traffic Analytics', 'Customer Insights'], 'website', 'pending', NOW()
          )
        `;
        console.log('✅ Test insert başarılı:', testApplicationId);
      } catch (insertError) {
        console.error('❌ Test insert hatası:', insertError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database hatası:', error.message);
    console.error('📋 Error details:', error);
  }
}

testProductionDB();