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
  console.error('   .env.local dosyasında POSTGRES_URL tanımlı mı kontrol edin.');
  process.exit(1);
}

console.log('🚀 Business Kamera Tablosu Oluşturuluyor...\n');

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1
});

async function setupBusinessCameras() {
  try {
    // SQL dosyasını oku
    const sqlFile = join(__dirname, 'business-cameras.sql');
    const sqlContent = readFileSync(sqlFile, 'utf8');
    
    console.log('📋 SQL dosyası okundu: business-cameras.sql');
    
    // SQL komutlarını çalıştır
    await sql.unsafe(sqlContent);
    
    console.log('✅ business_cameras tablosu başarıyla oluşturuldu!');
    console.log('✅ Trigger ve index\'ler eklendi');
    console.log('✅ Örnek kamera verileri eklendi\n');
    
    // Kontrol
    const cameras = await sql`SELECT * FROM business_cameras`;
    console.log(`📹 Toplam kamera sayısı: ${cameras.length}`);
    
    if (cameras.length > 0) {
      console.log('\n📋 Örnek Kameralar:');
      cameras.forEach(cam => {
        console.log(`   - ${cam.camera_name} (${cam.ip_address}:${cam.port}) - ${cam.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

setupBusinessCameras()
  .then(() => {
    console.log('\n✅ Kurulum tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Kurulum başarısız:', error);
    process.exit(1);
  });
