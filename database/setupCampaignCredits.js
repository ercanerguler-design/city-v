require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function setupCampaignCredits() {
  try {
    console.log('🎯 Kampanya Kredi Sistemi Kurulumu\n');

    // 1. business_users tablosuna kredi kolonları ekle
    console.log('📋 1. business_users tablosuna kredi kolonları ekleniyor...');
    
    await sql`
      ALTER TABLE business_users 
      ADD COLUMN IF NOT EXISTS campaign_credits INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_campaigns_created INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS credits_last_updated TIMESTAMP DEFAULT NOW()
    `;
    
    console.log('✅ Kredi kolonları eklendi\n');

    // 2. Mevcut üyelere membership_type'a göre kredi ata
    console.log('📋 2. Mevcut üyelere kredi atanıyor...');
    
    // Premium üyeler: 15 kredi
    const premiumResult = await sql`
      UPDATE business_users 
      SET campaign_credits = 15,
          credits_last_updated = NOW()
      WHERE membership_type = 'premium' 
        AND campaign_credits = 0
      RETURNING id, email, membership_type, campaign_credits
    `;
    console.log(`   ✅ ${premiumResult.rowCount} Premium üyeye 15 kredi atandı`);
    
    // Enterprise üyeler: 39 kredi
    const enterpriseResult = await sql`
      UPDATE business_users 
      SET campaign_credits = 39,
          credits_last_updated = NOW()
      WHERE membership_type = 'enterprise'
        AND campaign_credits = 0
      RETURNING id, email, membership_type, campaign_credits
    `;
    console.log(`   ✅ ${enterpriseResult.rowCount} Enterprise üyeye 39 kredi atandı\n`);

    // 3. campaign_credit_transactions tablosu oluştur (kredi geçmişi için)
    console.log('📋 3. campaign_credit_transactions tablosu oluşturuluyor...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS campaign_credit_transactions (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
        campaign_id INTEGER REFERENCES business_campaigns(id) ON DELETE SET NULL,
        transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'spent', 'refund', 'admin_grant'
        credits_amount INTEGER NOT NULL,
        credits_before INTEGER NOT NULL,
        credits_after INTEGER NOT NULL,
        description TEXT,
        created_by_admin_id INTEGER REFERENCES business_users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ campaign_credit_transactions tablosu oluşturuldu\n');

    // 4. Mevcut durumu göster
    console.log('📊 Mevcut Kredi Durumu:\n');
    
    const usersWithCredits = await sql`
      SELECT 
        id,
        email,
        full_name,
        membership_type,
        campaign_credits,
        total_campaigns_created
      FROM business_users
      WHERE is_active = true
      ORDER BY membership_type DESC, campaign_credits DESC
    `;
    
    usersWithCredits.rows.forEach(user => {
      const emoji = user.membership_type === 'enterprise' ? '💎' : user.membership_type === 'premium' ? '👑' : '⭐';
      console.log(`${emoji} [${user.membership_type.toUpperCase()}] ${user.email}`);
      console.log(`   📊 Kredi: ${user.campaign_credits} | Oluşturulan Kampanya: ${user.total_campaigns_created}\n`);
    });

    console.log('✅ Kampanya Kredi Sistemi başarıyla kuruldu!\n');
    console.log('📋 Özellikler:');
    console.log('   • Premium: 15 kredi başlangıç');
    console.log('   • Enterprise: 39 kredi başlangıç');
    console.log('   • Her kampanya: 2 kredi harcanır');
    console.log('   • Admin kredi atayabilir (cityvadmin)');
    console.log('   • Kredi bitince "Kredi Satın Al" butonu çıkar\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

setupCampaignCredits();
