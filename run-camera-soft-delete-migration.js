const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Kamera Soft Delete Migration başlatılıyor...\n');

  try {
    // 1. deleted_at column ekle
    console.log('1️⃣ business_cameras tablosuna deleted_at column ekleniyor...');
    await sql`
      ALTER TABLE business_cameras 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `;
    console.log('   ✅ deleted_at column eklendi\n');

    // 2. Index ekle (performans)
    console.log('2️⃣ Index oluşturuluyor...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_business_cameras_deleted_at 
      ON business_cameras(deleted_at) 
      WHERE deleted_at IS NULL
    `;
    console.log('   ✅ idx_business_cameras_deleted_at oluşturuldu\n');

    // 3. Composite index (business_user_id + deleted_at)
    console.log('3️⃣ Composite index oluşturuluyor...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_business_cameras_active 
      ON business_cameras(business_user_id, deleted_at) 
      WHERE deleted_at IS NULL
    `;
    console.log('   ✅ idx_business_cameras_active oluşturuldu\n');

    // 4. Comment ekle
    console.log('4️⃣ Column comment ekleniyor...');
    await sql`
      COMMENT ON COLUMN business_cameras.deleted_at IS 
      'Soft delete için. NULL = aktif, timestamp = silinmiş ama tarihsel veriler korunuyor'
    `;
    console.log('   ✅ Comment eklendi\n');

    // 5. Mevcut kameraları kontrol et
    const cameras = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE deleted_at IS NULL) as active,
        COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted
      FROM business_cameras
    `;
    
    console.log('📊 Kamera İstatistikleri:');
    console.log(`   Toplam: ${cameras[0].total}`);
    console.log(`   Aktif: ${cameras[0].active}`);
    console.log(`   Silinmiş: ${cameras[0].deleted}\n`);

    console.log('✅ Migration başarıyla tamamlandı!');
    console.log('\n📝 Kullanım:');
    console.log('   - Dashboard: WHERE deleted_at IS NULL (sadece aktif kameralar)');
    console.log('   - Raporlar: deleted_at\'e bakmadan tüm veriler');
    console.log('   - Silme: UPDATE business_cameras SET deleted_at = NOW() WHERE id = X');
    console.log('   - Geri yükleme: UPDATE business_cameras SET deleted_at = NULL WHERE id = X\n');

  } catch (error) {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  }
}

runMigration();
