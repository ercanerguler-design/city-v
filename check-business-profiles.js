require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkProfiles() {
  try {
    console.log('🔍 Business kullanıcıları ve profilleri kontrol ediliyor...\n');
    
    const result = await sql`
      SELECT 
        bu.id, 
        bu.email, 
        bu.full_name, 
        bu.membership_type,
        bu.max_cameras,
        bp.id as profile_id, 
        bp.business_name,
        bp.business_type,
        bp.address
      FROM business_users bu 
      LEFT JOIN business_profiles bp ON bu.id = bp.user_id 
      ORDER BY bu.created_at DESC 
      LIMIT 10
    `;
    
    console.log(`Toplam ${result.rows.length} kullanıcı bulundu:\n`);
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   İsim: ${user.full_name || 'Yok'}`);
      console.log(`   Üyelik: ${user.membership_type} (${user.max_cameras} kamera)`);
      console.log(`   Profile: ${user.profile_id ? '✅ VAR' : '❌ YOK'}`);
      if (user.profile_id) {
        console.log(`   İşletme: ${user.business_name || 'İsimsiz'}`);
        console.log(`   Tip: ${user.business_type || 'Belirtilmemiş'}`);
      }
      console.log('');
    });
    
    const withoutProfile = result.rows.filter(u => !u.profile_id);
    if (withoutProfile.length > 0) {
      console.log(`\n⚠️ ${withoutProfile.length} kullanıcının profili YOK!`);
      console.log('Bu kullanıcılar dashboard menülerini kullanamaz.\n');
      console.log('Profil oluşturmak için:');
      withoutProfile.forEach(u => {
        console.log(`\nINSERT INTO business_profiles (user_id, business_name, business_type) VALUES (${u.id}, '${u.full_name || u.email.split('@')[0]}', 'restaurant');`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    process.exit(0);
  }
}

checkProfiles();
