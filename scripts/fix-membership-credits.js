require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixMembershipAndCredits() {
  console.log('🔧 Membership ve Credits düzeltiliyor...\n');

  try {
    // User ID 20'yi enterprise yap ve 75 kredi ver
    console.log('📝 User ID 20 güncelleniyor...');
    
    const result = await sql`
      UPDATE business_users 
      SET 
        membership_type = 'enterprise',
        campaign_credits = 75,
        max_cameras = 50,
        membership_expiry_date = NOW() + INTERVAL '1 year'
      WHERE id = 20
      RETURNING id, email, membership_type, campaign_credits, max_cameras
    `;

    if (result.length > 0) {
      console.log('✅ Güncelleme başarılı:');
      console.log('   Email:', result[0].email);
      console.log('   Membership:', result[0].membership_type);
      console.log('   Credits:', result[0].campaign_credits);
      console.log('   Max Cameras:', result[0].max_cameras);
    } else {
      console.log('❌ User ID 20 bulunamadı!');
    }

    // Profile visibility'yi de kontrol et
    console.log('\n📝 Profile visibility kontrol ediliyor...');
    
    const profileResult = await sql`
      UPDATE business_profiles 
      SET 
        is_visible_on_map = true,
        auto_sync_to_cityv = true
      WHERE user_id = 20
      RETURNING id, business_name, is_visible_on_map, auto_sync_to_cityv
    `;

    if (profileResult.length > 0) {
      console.log('✅ Profile güncellendi:');
      console.log('   Business:', profileResult[0].business_name);
      console.log('   Visible:', profileResult[0].is_visible_on_map);
      console.log('   Auto Sync:', profileResult[0].auto_sync_to_cityv);
    }

    console.log('\n✅ Tüm güncellemeler tamamlandı!');
    console.log('\n🔄 Şimdi browser\'da localStorage.clear() yapın ve sayfayı yenileyin (Ctrl+Shift+R)');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

fixMembershipAndCredits();
