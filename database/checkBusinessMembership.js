// Business kullanıcılarının membership bilgilerini kontrol et
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkMemberships() {
  try {
    console.log('\n🔍 Business kullanıcılarının membership bilgileri kontrol ediliyor...\n');

    const result = await sql`
      SELECT 
        id,
        email,
        full_name,
        company_name,
        membership_type,
        membership_expiry_date,
        max_cameras,
        added_by_admin,
        created_at
      FROM business_users
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (result.rows.length === 0) {
      console.log('❌ Hiç business kullanıcı bulunamadı');
      return;
    }

    console.log(`📊 Toplam ${result.rows.length} kullanıcı bulundu:\n`);
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   👤 İsim: ${user.full_name}`);
      console.log(`   🏢 Şirket: ${user.company_name}`);
      console.log(`   📋 Membership: ${user.membership_type || 'YOK! (NULL)'}`);
      console.log(`   📅 Bitiş: ${user.membership_expiry_date || 'YOK! (NULL)'}`);
      console.log(`   📷 Max Kamera: ${user.max_cameras || 'YOK! (NULL)'}`);
      console.log(`   🔧 Admin Ekledi: ${user.added_by_admin ? 'Evet' : 'Hayır'}`);
      console.log(`   ⏰ Oluşturulma: ${new Date(user.created_at).toLocaleString('tr-TR')}`);
      console.log('');
    });

    // Membership type NULL olanları say
    const nullMemberships = result.rows.filter(u => !u.membership_type);
    if (nullMemberships.length > 0) {
      console.log(`⚠️ ${nullMemberships.length} kullanıcının membership_type bilgisi YOK!`);
      console.log('📧 Etkilenen kullanıcılar:');
      nullMemberships.forEach(u => console.log(`   - ${u.email}`));
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkMemberships();
