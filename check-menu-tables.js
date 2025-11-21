const { Pool } = require('pg');

async function checkMenuTables() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL bulunamadı');
    return;
  }

  console.log('🔍 Menu tabloları kontrol ediliyor...\n');
  
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    // Menu categories tablosu var mı kontrol et
    const categoriesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'business_menu_categories'
      );
    `);
    
    console.log('📋 business_menu_categories tablosu:', categoriesCheck.rows[0].exists ? '✅ Mevcut' : '❌ Bulunamadı');
    
    if (categoriesCheck.rows[0].exists) {
      // Tablo yapısını kontrol et
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'business_menu_categories'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Tablo yapısı:');
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
      
      // Kayıt sayısını kontrol et
      const count = await pool.query('SELECT COUNT(*) FROM business_menu_categories');
      console.log(`\n📈 Toplam kategori: ${count.rows[0].count}`);
      
      // Örnek kayıtları göster
      if (parseInt(count.rows[0].count) > 0) {
        const samples = await pool.query('SELECT * FROM business_menu_categories LIMIT 3');
        console.log('\n📝 Örnek kategoriler:');
        samples.rows.forEach(cat => {
          console.log(`  ID: ${cat.id} | Name: ${cat.name} | Business: ${cat.business_id} | Active: ${cat.is_active}`);
        });
      }
    }
    
    // Menu items tablosu da kontrol et
    const itemsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'business_menu_items'
      );
    `);
    
    console.log('\n📋 business_menu_items tablosu:', itemsCheck.rows[0].exists ? '✅ Mevcut' : '❌ Bulunamadı');
    
    if (!categoriesCheck.rows[0].exists) {
      console.log('\n🔧 Menu categories tablosu oluşturuluyor...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS business_menu_categories (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          icon VARCHAR(10) DEFAULT '📦',
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      console.log('✅ business_menu_categories tablosu oluşturuldu');
      
      // Demo kategoriler ekle
      await pool.query(`
        INSERT INTO business_menu_categories (business_id, name, icon, display_order) VALUES
        (1, 'Ana Yemekler', '🍽️', 1),
        (1, 'İçecekler', '🥤', 2),
        (1, 'Tatlılar', '🍰', 3),
        (1, 'Kahvaltı', '🥐', 4)
        ON CONFLICT DO NOTHING;
      `);
      
      console.log('✅ Demo kategoriler eklendi');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

// .env.local'den DATABASE_URL oku
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      if (line.startsWith('DATABASE_URL=') || line.startsWith('POSTGRES_URL=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        process.env[key] = value;
      }
    });
  }
} catch (error) {
  console.log('⚠️ .env.local okunamadı, environment variables kullanılacak');
}

checkMenuTables();