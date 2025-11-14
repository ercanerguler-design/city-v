import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ POSTGRES_URL bulunamadı!');
  process.exit(1);
}

console.log('🚀 Business Personel Tablosu Oluşturuluyor...\n');

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1
});

async function setupBusinessEmployees() {
  try {
    const sqlFile = join(__dirname, 'business-employees.sql');
    const sqlContent = readFileSync(sqlFile, 'utf8');
    
    console.log('📋 SQL dosyası okundu: business-employees.sql');
    
    await sql.unsafe(sqlContent);
    
    console.log('✅ business_employees tablosu başarıyla oluşturuldu!');
    console.log('✅ Trigger ve index\'ler eklendi');
    console.log('✅ Örnek personel verileri eklendi\n');
    
    const employees = await sql`SELECT * FROM business_employees`;
    console.log(`👥 Toplam personel sayısı: ${employees.length}`);
    
    if (employees.length > 0) {
      console.log('\n📋 Örnek Personeller:');
      employees.forEach(emp => {
        console.log(`   - ${emp.full_name} (${emp.position}) - ${emp.shift}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

setupBusinessEmployees()
  .then(() => {
    console.log('\n✅ Kurulum tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Kurulum başarısız:', error);
    process.exit(1);
  });
