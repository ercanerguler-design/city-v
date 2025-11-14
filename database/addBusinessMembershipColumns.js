import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// .env.local'i yükle
config({ path: '.env.local' });

async function addBusinessMembershipColumns() {
  try {
    console.log('🔧 Business users tablosuna membership kolonları ekleniyor...');

    // Membership type ve expiry date kolonları
    await sql`
      ALTER TABLE business_users 
      ADD COLUMN IF NOT EXISTS membership_type VARCHAR(50) DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS membership_expiry_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS max_cameras INTEGER DEFAULT 1
    `;
    console.log('✅ Kolonlar eklendi');

    // Check constraint ekle (sadece yoksa)
    try {
      await sql`
        ALTER TABLE business_users 
        ADD CONSTRAINT check_membership_type 
        CHECK (membership_type IN ('free', 'premium', 'enterprise'))
      `;
      console.log('✅ Check constraint eklendi');
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log('⚠️  Check constraint zaten mevcut');
      } else {
        throw error;
      }
    }

    // Default camera limitlerini ayarla
    await sql`
      UPDATE business_users 
      SET max_cameras = CASE 
        WHEN membership_type = 'premium' THEN 10
        WHEN membership_type = 'enterprise' THEN 50
        ELSE 1
      END
      WHERE max_cameras IS NULL OR max_cameras = 0 OR max_cameras = 1
    `;
    console.log('✅ Camera limitleri güncellendi');

    // Index ekle
    await sql`CREATE INDEX IF NOT EXISTS idx_business_users_membership ON business_users(membership_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_users_expiry ON business_users(membership_expiry_date)`;
    console.log('✅ Index\'ler eklendi');

    console.log('🎉 Business membership sistemi başarıyla eklendi!');
    console.log('');
    console.log('📋 Membership Tipleri:');
    console.log('  - free: 1 kamera');
    console.log('  - premium: 10 kamera');
    console.log('  - enterprise: 50 kamera');

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  }
}

addBusinessMembershipColumns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
