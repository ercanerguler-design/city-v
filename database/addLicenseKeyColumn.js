// business_users tablosuna license_key kolonu ekle
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function addLicenseKeyColumn() {
  try {
    console.log('🔧 business_users tablosuna license_key kolonu ekleniyor...\n');

    // license_key kolonunu ekle
    await sql`
      ALTER TABLE business_users 
      ADD COLUMN IF NOT EXISTS license_key VARCHAR(255) UNIQUE
    `;

    console.log('✅ license_key kolonu eklendi\n');

    // Index ekle (hızlı arama için)
    await sql`
      CREATE INDEX IF NOT EXISTS idx_business_users_license_key 
      ON business_users(license_key)
    `;

    console.log('✅ license_key index eklendi\n');

    console.log('🎉 Migration tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

addLicenseKeyColumn();
