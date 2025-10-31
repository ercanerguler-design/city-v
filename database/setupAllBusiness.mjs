import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database URL from environment
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ POSTGRES_URL veya DATABASE_URL bulunamadı!');
  process.exit(1);
}

console.log('🚀 TÜM Business Tabloları Oluşturuluyor...\n');

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1
});

async function setupAllBusinessTables() {
  try {
    // 1. Business tabloları
    console.log('📋 1/2 - Business tabloları oluşturuluyor...');
    const businessSql = readFileSync(join(__dirname, 'full-business-setup.sql'), 'utf8');
    await sql.unsafe(businessSql);
    console.log('✅ business_users, business_profiles, business_subscriptions oluşturuldu\n');
    
    // 2. Kamera tablosu
    console.log('📋 2/2 - Kamera tablosu oluşturuluyor...');
    const cameraSql = readFileSync(join(__dirname, 'business-cameras.sql'), 'utf8');
    await sql.unsafe(cameraSql);
    console.log('✅ business_cameras tablosu oluşturuldu\n');
    
    // Kontroller
    const users = await sql`SELECT COUNT(*) as count FROM business_users`;
    const cameras = await sql`SELECT COUNT(*) as count FROM business_cameras`;
    
    console.log('📊 Sonuç:');
    console.log(`   👥 Business kullanıcıları: ${users[0].count}`);
    console.log(`   📹 Kameralar: ${cameras[0].count}`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

setupAllBusinessTables()
  .then(() => {
    console.log('\n✅ TÜM TABLOLAR HAZIR!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Kurulum başarısız:', error);
    process.exit(1);
  });
