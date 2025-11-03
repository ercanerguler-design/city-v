require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔍 Aktif kampanyalar kontrol ediliyor...\n');
    
    const result = await sql`
      SELECT 
        bc.id,
        bc.title,
        bc.discount_percent,
        bc.start_date,
        bc.end_date,
        bc.is_active,
        bc.created_at,
        bp.business_name
      FROM business_campaigns bc
      JOIN business_profiles bp ON bc.business_id = bp.id
      ORDER BY bc.created_at DESC
      LIMIT 10
    `;
    
    console.log(`✅ Toplam ${result.rowCount} kampanya bulundu\n`);
    
    if (result.rowCount === 0) {
      console.log('❌ Hiç kampanya yok! Business Dashboard\'dan kampanya oluştur.\n');
    } else {
      result.rows.forEach(row => {
        const active = row.is_active ? '✅' : '❌';
        console.log(`${active} [${row.id}] ${row.business_name}`);
        console.log(`   Başlık: ${row.title}`);
        console.log(`   İndirim: %${row.discount_percent}`);
        console.log(`   Tarih: ${row.start_date} → ${row.end_date}`);
        console.log(`   Oluşturma: ${row.created_at}\n`);
      });
      
      // Aktif kampanya sayısı
      const activeCount = result.rows.filter(r => r.is_active).length;
      console.log(`📊 Aktif kampanya sayısı: ${activeCount}/${result.rowCount}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
})();
