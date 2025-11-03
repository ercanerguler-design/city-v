require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkPushTable() {
  try {
    console.log('🔍 push_notifications tablosu kontrol ediliyor...\n');

    // Tablo var mı kontrol et
    const checkResult = await sql.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'push_notifications'
      )
    `);

    const tableExists = checkResult.rows[0].exists;

    if (tableExists) {
      console.log('✅ push_notifications tablosu MEVCUT\n');
      
      // Tablo yapısını göster
      const structure = await sql.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'push_notifications'
        ORDER BY ordinal_position
      `);

      console.log('📋 Tablo Yapısı:');
      structure.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });

      // Kayıt sayısını göster
      const countResult = await sql.query('SELECT COUNT(*) FROM push_notifications');
      console.log(`\n📊 Toplam kayıt: ${countResult.rows[0].count}`);

    } else {
      console.log('❌ push_notifications tablosu YOK, oluşturuluyor...\n');

      await sql.query(`
        CREATE TABLE push_notifications (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL,
          campaign_id INTEGER,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          notification_type VARCHAR(50),
          target_users TEXT[],
          sent_count INTEGER DEFAULT 0,
          read_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          sent_at TIMESTAMP
        )
      `);

      console.log('✅ push_notifications tablosu oluşturuldu!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

checkPushTable();
