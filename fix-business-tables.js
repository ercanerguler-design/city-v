const { sql } = require('@vercel/postgres');

async function fixBusinessTables() {
  try {
    console.log('🔧 Business tabloları düzeltiliyor...');
    
    // Staff tablosuna eksik kolonları ekle
    console.log('\n1️⃣ business_staff tablosuna kolonlar ekleniyor...');
    
    try {
      await sql`
        ALTER TABLE business_staff 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2) DEFAULT 0
      `;
      console.log('✅ business_staff tablosuna updated_at ve salary kolonları eklendi');
    } catch (error) {
      console.log('⚠️ Kolon ekleme hatası (zaten var olabilir):', error.message);
    }
    
    // Menu categories tablosunda auth kontrolünü bypass et
    console.log('\n2️⃣ Menu categories tablosu kontrol ediliyor...');
    
    const menuCheck = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.columns 
      WHERE table_name = 'business_menu_categories'
    `;
    
    console.log('📊 business_menu_categories kolon sayısı:', menuCheck.rows[0].count);
    
    // Test data ekle
    console.log('\n3️⃣ Test verisi ekleniyor...');
    
    try {
      await sql`
        INSERT INTO business_staff (
          business_id, full_name, email, phone, role, position,
          hire_date, status, permissions, working_hours, salary, created_at, updated_at
        ) VALUES (
          1, 'Test Staff Member', 'test@staff.com', '0555-123-4567', 'staff', 'Cashier',
          '2025-01-01', 'active', '["view_dashboard"]', '{"monday": {"start": "09:00", "end": "17:00"}}', 5000.00, NOW(), NOW()
        ) 
        ON CONFLICT (business_id, email) DO NOTHING
      `;
      console.log('✅ Test personel eklendi');
    } catch (error) {
      console.log('⚠️ Test personel ekleme hatası:', error.message);
    }
    
    // Table structure'ını göster
    console.log('\n4️⃣ Tablo yapıları kontrol ediliyor...');
    
    const staffColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'business_staff'
      ORDER BY ordinal_position
    `;
    
    console.log('👥 business_staff kolonları:');
    staffColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) nullable: ${col.is_nullable}`);
    });
    
  } catch (error) {
    console.error('❌ Database fix hatası:', error.message);
  }
}

fixBusinessTables();