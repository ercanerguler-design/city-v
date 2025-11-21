const { Pool } = require('pg');

async function fixMenuCategoriesTable() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL bulunamadı');
    return;
  }

  console.log('🔧 business_menu_categories tablosunu düzeltiliyor...\n');
  
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    // Mevcut tablo yapısını kontrol et
    console.log('📋 Mevcut tablo yapısı:');
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'business_menu_categories'
      ORDER BY ordinal_position;
    `);
    
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // Eksik kolonları kontrol et ve ekle
    const requiredColumns = [
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', default: 'NOW()' },
      { name: 'is_active', type: 'BOOLEAN', default: 'true' }
    ];
    
    console.log('\n🔧 Eksik kolonlar kontrol ediliyor...');
    
    for (const column of requiredColumns) {
      const exists = structure.rows.find(row => row.column_name === column.name);
      
      if (!exists) {
        console.log(`➕ ${column.name} kolonu ekleniyor...`);
        
        await pool.query(`
          ALTER TABLE business_menu_categories 
          ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default};
        `);
        
        console.log(`✅ ${column.name} kolonu eklendi`);
      } else {
        console.log(`✅ ${column.name} kolonu zaten mevcut`);
      }
    }
    
    // Güncellenmiş tablo yapısını göster
    console.log('\n📋 Güncellenmiş tablo yapısı:');
    const newStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'business_menu_categories'
      ORDER BY ordinal_position;
    `);
    
    newStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Test verisi ekle
    console.log('\n🧪 Test kategorisi ekleniyor...');
    const testResult = await pool.query(`
      INSERT INTO business_menu_categories (business_id, name, icon, display_order, is_active) 
      VALUES (1, 'API Test Kategorisi', '🧪', 999, true)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `);
    
    if (testResult.rows.length > 0) {
      console.log('✅ Test kategorisi eklendi:', testResult.rows[0]);
    } else {
      console.log('ℹ️ Test kategorisi zaten mevcut');
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

fixMenuCategoriesTable();