require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔧 Kampanyaları aktif hale getiriyoruz...\n');
    
    // Mevcut kampanyaların hem start hem end date'ini düzeltelim
    const updateResult = await sql`
      UPDATE business_campaigns
      SET 
        start_date = CURRENT_DATE - INTERVAL '1 day',
        end_date = CURRENT_DATE + INTERVAL '7 days',
        is_active = true
      WHERE id IN (17, 20, 21)
      RETURNING id, title, business_id, start_date, end_date, is_active
    `;
    
    console.log(`✅ ${updateResult.rowCount} kampanya güncellendi:\n`);
    updateResult.rows.forEach(c => {
      console.log(`  [${c.id}] ${c.title}`);
      console.log(`    Business ID: ${c.business_id}`);
      console.log(`    Tarih: ${new Date(c.start_date).toLocaleDateString()} - ${new Date(c.end_date).toLocaleDateString()}`);
      console.log(`    Aktif: ${c.is_active ? '✅' : '❌'}\n`);
    });
    
    // Push notifications da güncelleyelim
    const notifUpdate = await sql`
      UPDATE push_notifications
      SET sent_at = NOW()
      WHERE campaign_id IN (17, 20, 21)
      RETURNING id, campaign_id, title
    `;
    
    console.log(`✅ ${notifUpdate.rowCount} push notification güncellendi\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
})();
