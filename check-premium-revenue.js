require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkPremiumRevenue() {
  try {
    console.log('💰 Premium kullanıcıları kontrol ediyorum...\n');
    
    // Premium kullanıcıları getir
    const users = await sql`
      SELECT 
        id, 
        email, 
        membership_tier, 
        premium_subscription_type,
        CASE 
          WHEN premium_subscription_type = 'monthly' THEN 49.99 
          ELSE 399.99 
        END as price
      FROM users 
      WHERE membership_tier = 'premium'
    `;
    
    console.log('📊 Premium Kullanıcılar:');
    console.log('========================\n');
    
    users.rows.forEach(user => {
      console.log(`👤 ${user.email}`);
      console.log(`   Abonelik: ${user.premium_subscription_type || 'monthly'}`);
      console.log(`   Fiyat: ₺${user.price}`);
      console.log('');
    });
    
    // Gelir hesaplama
    const revenue = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE premium_subscription_type = 'monthly') as monthly_count,
        COUNT(*) FILTER (WHERE premium_subscription_type = 'yearly') as yearly_count,
        COALESCE(SUM(CASE WHEN premium_subscription_type = 'monthly' THEN 49.99 ELSE 0 END), 0) as monthly_revenue,
        COALESCE(SUM(CASE WHEN premium_subscription_type = 'yearly' THEN 399.99 ELSE 0 END), 0) as yearly_revenue
      FROM users
      WHERE membership_tier = 'premium'
    `;
    
    console.log('💰 Gelir Hesaplaması:');
    console.log('====================\n');
    console.log(`📅 Aylık abonelik: ${revenue.rows[0].monthly_count} üye → ₺${revenue.rows[0].monthly_revenue}`);
    console.log(`🗓️ Yıllık abonelik: ${revenue.rows[0].yearly_count} üye → ₺${revenue.rows[0].yearly_revenue}`);
    console.log(`💎 Toplam: ₺${parseFloat(revenue.rows[0].monthly_revenue) + parseFloat(revenue.rows[0].yearly_revenue)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

checkPremiumRevenue();
