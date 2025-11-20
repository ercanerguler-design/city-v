const { sql } = require('@vercel/postgres');

async function checkTable() {
  try {
    const result = await sql`SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'business_staff'`;
    console.log('📋 business_staff tablosu var mı:', result.rows[0].count);
    
    if (result.rows[0].count === '0') {
      console.log('❌ business_staff tablosu bulunamadı!');
      console.log('🔨 Tablo oluşturuluyor...');
      
      // Tablo oluştur
      await sql`
        CREATE TABLE business_staff (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          role VARCHAR(50) NOT NULL DEFAULT 'employee',
          position VARCHAR(100),
          hire_date DATE DEFAULT CURRENT_DATE,
          salary DECIMAL(10,2),
          status VARCHAR(20) DEFAULT 'active',
          permissions JSONB DEFAULT '{"cameras": false, "menu": false, "reports": false, "settings": false}',
          working_hours JSONB,
          photo_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(business_id, email)
        )
      `;
      
      await sql`CREATE INDEX IF NOT EXISTS idx_staff_business ON business_staff(business_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_staff_status ON business_staff(business_id, status)`;
      
      console.log('✅ business_staff tablosu oluşturuldu!');
    } else {
      console.log('✅ business_staff tablosu mevcut');
      
      // Tablo yapısını kontrol et
      const columns = await sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'business_staff'
        ORDER BY ordinal_position
      `;
      
      console.log('📋 Tablo yapısı:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
  
  process.exit(0);
}

checkTable();