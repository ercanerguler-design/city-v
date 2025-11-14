require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔍 Business users kontrol ediliyor...\n');
    
    const users = await sql`
      SELECT 
        bu.id,
        bu.email,
        bu.full_name,
        bu.is_active,
        bu.added_by_admin,
        bu.created_at,
        bp.business_name,
        bp.business_type
      FROM business_users bu
      LEFT JOIN business_profiles bp ON bp.user_id = bu.id
      ORDER BY bu.created_at DESC
      LIMIT 5
    `;
    
    console.log(`✅ Toplam ${users.rowCount} business user bulundu\n`);
    
    if (users.rowCount === 0) {
      console.log('❌ Hiç business user yok!\n');
      console.log('💡 Çözüm: MANUEL_BUSINESS_UYELEIK.md dosyasındaki script ile business user ekle.\n');
    } else {
      users.rows.forEach(row => {
        const active = row.is_active ? '✅' : '❌';
        const admin = row.added_by_admin ? '👑' : '👤';
        console.log(`${active} ${admin} [${row.id}] ${row.email}`);
        console.log(`   Ad: ${row.full_name || 'Belirtilmemiş'}`);
        console.log(`   İşletme: ${row.business_name || '❌ Profil yok'}`);
        console.log(`   Tür: ${row.business_type || '-'}`);
        console.log(`   Kayıt: ${row.created_at}\n`);
      });
      
      const activeCount = users.rows.filter(r => r.is_active).length;
      const withProfile = users.rows.filter(r => r.business_name).length;
      console.log(`📊 Aktif: ${activeCount}/${users.rowCount} | Profilli: ${withProfile}/${users.rowCount}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
})();
