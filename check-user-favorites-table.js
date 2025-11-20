require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Veritabanı bağlantısı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function checkUserFavoritesTable() {
  try {
    console.log('📋 user_favorites tablosu kontrol ediliyor...');
    
    // Tablo var mı kontrol et
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_favorites'
    `);
    
    console.log('📊 Tablo varlığı:', tables.rows.length > 0 ? 'VAR' : 'YOK');
    
    if (tables.rows.length === 0) {
      console.log('❌ user_favorites tablosu bulunamadı!');
      console.log('✅ Tablo oluşturuluyor...');
      
      await query(`
        CREATE TABLE user_favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          location_id VARCHAR(255) NOT NULL,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, location_id)
        )
      `);
      
      console.log('✅ user_favorites tablosu oluşturuldu!');
    } else {
      console.log('✅ user_favorites tablosu mevcut');
    }
    
    // Tablo yapısını kontrol et
    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_favorites'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Tablo yapısı:', columns.rows);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Hata:', error);
    await pool.end();
  } finally {
    process.exit(0);
  }
}

checkUserFavoritesTable();