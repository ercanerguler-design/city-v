// Premium Subscription Type Field Eklemek için Migration Script
import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function addPremiumSubscriptionType() {
  try {
    console.log('🔧 Premium subscription type field ekleniyor...');
    
    // Check if column exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' 
        AND column_name='premium_subscription_type';
    `;
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ premium_subscription_type field zaten mevcut');
      return;
    }
    
    // Add column
    await sql`
      ALTER TABLE users 
      ADD COLUMN premium_subscription_type VARCHAR(20) DEFAULT 'monthly';
    `;
    
    console.log('✅ premium_subscription_type field eklendi');
    
    // Update existing premium users
    await sql`
      UPDATE users 
      SET premium_subscription_type = 'monthly' 
      WHERE membership_tier = 'premium' 
        AND premium_subscription_type IS NULL;
    `;
    
    console.log('✅ Mevcut premium kullanıcılar güncellendi');
    
    // Verify
    const verify = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE premium_subscription_type IS NOT NULL;
    `;
    
    console.log(`✅ ${verify.rows[0].count} kullanıcı premium_subscription_type değerine sahip`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  }
}

addPremiumSubscriptionType()
  .then(() => {
    console.log('🎉 Migration tamamlandı');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration başarısız:', error);
    process.exit(1);
  });
