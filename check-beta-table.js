const { sql } = require('@vercel/postgres');

async function checkBetaTable() {
  try {
    console.log('🔍 beta_applications tablosu kontrol ediliyor...');
    
    // Tablo var mı kontrol et
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'beta_applications'
      )
    `;
    
    console.log('📋 Tablo mevcut:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Tablo yapısını kontrol et
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'beta_applications'
        ORDER BY ordinal_position
      `;
      
      console.log('\n📊 Tablo yapısı:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) nullable: ${col.is_nullable}`);
      });
      
      // Test insert deneyelim
      try {
        console.log('\n🧪 Test insert deneniyor...');
        const testResult = await sql`
          INSERT INTO beta_applications (
            application_id, business_name, owner_name, email, phone, 
            location, business_type, average_daily, opening_hours, 
            current_solution, goals, heard_from, website, additional_info, 
            status, created_at
          ) VALUES (
            'TEST-12345', 'Test İşletme', 'Test Owner', 'test@test.com', '555-1234',
            'Test Konum', 'Restoran', '100-200', '09:00-18:00',
            'none', ARRAY['Traffic Analytics'], 'web', null, null,
            'pending', NOW()
          ) 
          ON CONFLICT (application_id) DO NOTHING
          RETURNING application_id
        `;
        console.log('✅ Test insert başarılı:', testResult.rows);
      } catch (insertError) {
        console.error('❌ Test insert hatası:', insertError.message);
      }
    } else {
      console.log('❌ beta_applications tablosu bulunamadı!');
    }
    
  } catch (error) {
    console.error('❌ Genel hata:', error.message);
  }
}

checkBetaTable();