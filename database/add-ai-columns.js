// Kamera tablosuna AI kolonlarını ekle
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Z1HBqLuCNi0w@ep-solitary-wind-ad4zkrm3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function addAICamColumns() {
  try {
    console.log('📋 Kamera tablosuna AI kolonları ekleniyor...');

    await pool.query(`
      ALTER TABLE business_cameras 
      ADD COLUMN IF NOT EXISTS calibration_line JSONB DEFAULT NULL
    `);
    console.log('✅ calibration_line kolonu eklendi');

    await pool.query(`
      ALTER TABLE business_cameras 
      ADD COLUMN IF NOT EXISTS entry_direction VARCHAR(50) DEFAULT 'up_to_down'
    `);
    console.log('✅ entry_direction kolonu eklendi');

    await pool.query(`
      ALTER TABLE business_cameras 
      ADD COLUMN IF NOT EXISTS zones JSONB DEFAULT '[]'::jsonb
    `);
    console.log('✅ zones kolonu eklendi');

    await pool.query(`
      ALTER TABLE business_cameras 
      ADD COLUMN IF NOT EXISTS calibration_data JSONB DEFAULT '{}'::jsonb
    `);
    console.log('✅ calibration_data kolonu eklendi');

    // Mevcut kolonları kontrol et
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'business_cameras'
      AND column_name IN ('calibration_line', 'entry_direction', 'zones', 'calibration_data')
      ORDER BY column_name
    `);

    console.log('\n✅ AI Kolonları Başarıyla Eklendi:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n🎯 Artık şunları yapabilirsiniz:');
    console.log('   1. Kalibrasyon çizgisi çizin (giriş/çıkış)');
    console.log('   2. Bölge poligonları oluşturun (masa, raf, vb.)');
    console.log('   3. AI detection ile insan sayımı yapın');
    console.log('   4. Heat map ile yoğunluk analizi görün');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
  }
}

addAICamColumns();
