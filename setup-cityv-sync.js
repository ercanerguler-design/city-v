require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function setupDatabase() {
  console.log('🔧 Database setup başlatılıyor...\n');
  
  try {
    // 1. business_interactions tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS business_interactions (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER NOT NULL,
        interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'review', 'route', 'menu_view', 'campaign_view', 'sentiment')),
        location_id VARCHAR(100),
        user_email VARCHAR(255),
        sentiment VARCHAR(20),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ business_interactions tablosu oluşturuldu');

    // 2. Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_business_interactions_business ON business_interactions(business_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_interactions_type ON business_interactions(interaction_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_interactions_location ON business_interactions(location_id)`;
    console.log('✅ Indexes oluşturuldu');

    // 3. auto_sync_to_cityv aktif et
    const updateResult = await sql`
      UPDATE business_profiles
      SET auto_sync_to_cityv = true,
          is_visible_on_map = true
      WHERE user_id = 6
      RETURNING business_name, auto_sync_to_cityv, is_visible_on_map
    `;
    
    if (updateResult.rows.length > 0) {
      const business = updateResult.rows[0];
      console.log('\n✅ İşletme City-V haritasına eklendi:');
      console.log(`   📍 ${business.business_name}`);
      console.log(`   🗺️ Haritada Görünür: ${business.is_visible_on_map}`);
      console.log(`   🔄 Otomatik Senkronizasyon: ${business.auto_sync_to_cityv}`);
    }

    console.log('\n🎉 Tüm ayarlar tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

setupDatabase();
