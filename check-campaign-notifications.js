require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  try {
    console.log('🔍 Kampanya ve Bildirimler Kontrol Ediliyor...\n');
    
    // 1. Business Campaigns
    console.log('📊 BUSINESS CAMPAIGNS:');
    const campaigns = await sql`
      SELECT 
        bc.id,
        bc.business_id,
        bc.title,
        bc.discount_percent,
        bc.discount_amount,
        bc.start_date,
        bc.end_date,
        bc.is_active,
        bc.created_at,
        bp.business_name,
        bp.id as profile_id
      FROM business_campaigns bc
      JOIN business_profiles bp ON bc.business_id = bp.id
      WHERE bc.is_active = true
        AND bc.start_date <= NOW()
        AND bc.end_date >= NOW()
      ORDER BY bc.created_at DESC
      LIMIT 5
    `;
    
    console.log(`✅ ${campaigns.rowCount} aktif kampanya var\n`);
    campaigns.rows.forEach(c => {
      console.log(`  [${c.id}] ${c.title}`);
      console.log(`    İşletme: ${c.business_name} (Profile ID: ${c.profile_id})`);
      console.log(`    İndirim: ${c.discount_percent ? `%${c.discount_percent}` : `${c.discount_amount}₺`}`);
      console.log(`    Geçerlilik: ${new Date(c.start_date).toLocaleDateString()} - ${new Date(c.end_date).toLocaleDateString()}`);
      console.log('');
    });
    
    // 2. Push Notifications
    console.log('🔔 PUSH NOTIFICATIONS:');
    const notifications = await sql`
      SELECT 
        pn.id,
        pn.campaign_id,
        pn.business_id,
        pn.title,
        pn.message,
        pn.notification_type,
        pn.sent_at,
        bp.business_name
      FROM push_notifications pn
      LEFT JOIN business_profiles bp ON pn.business_id = bp.id
      WHERE pn.notification_type = 'campaign'
        AND pn.sent_at >= NOW() - INTERVAL '48 hours'
      ORDER BY pn.sent_at DESC
      LIMIT 10
    `;
    
    console.log(`✅ Son 48 saatte ${notifications.rowCount} bildirim gönderildi\n`);
    notifications.rows.forEach(n => {
      console.log(`  [${n.id}] ${n.title}`);
      console.log(`    Kampanya ID: ${n.campaign_id}`);
      console.log(`    Business ID: ${n.business_id}`);
      console.log(`    İşletme: ${n.business_name || 'N/A'}`);
      console.log(`    Gönderim: ${new Date(n.sent_at).toLocaleString('tr-TR')}`);
      console.log('');
    });
    
    // 3. Join Test - ProHeader'ın kullandığı query
    console.log('🔗 JOIN TEST (ProHeader Query):');
    const joinTest = await sql`
      SELECT 
        pn.id as notification_id,
        pn.campaign_id,
        pn.title,
        pn.message as description,
        pn.sent_at as created_at,
        bc.discount_percent,
        bc.discount_amount,
        bc.start_date,
        bc.end_date,
        bc.is_active,
        bp.id as business_id,
        bp.business_name,
        bp.category as business_type,
        bp.latitude,
        bp.longitude,
        bp.address
       FROM push_notifications pn
       INNER JOIN business_campaigns bc ON pn.campaign_id = bc.id
       INNER JOIN business_profiles bp ON pn.business_id = bp.id
       WHERE pn.notification_type = 'campaign'
         AND bc.is_active = true
         AND bc.start_date <= NOW()
         AND bc.end_date >= NOW()
         AND pn.sent_at >= NOW() - INTERVAL '24 hours'
       ORDER BY pn.sent_at DESC
       LIMIT 5
    `;
    
    console.log(`✅ API'nin döndüreceği ${joinTest.rowCount} kampanya var\n`);
    if (joinTest.rowCount === 0) {
      console.log('⚠️ PROBLEM: Join sonucu boş! Muhtemel sebepler:');
      console.log('   1. business_campaigns.business_id ≠ business_profiles.id');
      console.log('   2. push_notifications.business_id ≠ business_profiles.id');
      console.log('   3. Son 24 saatte gönderilmiş bildirim yok\n');
      
      // Debug için join olmadan kontrol
      console.log('🔍 DETAYLI KONTROL:');
      const bcIds = campaigns.rows.map(c => c.business_id);
      const pnIds = notifications.rows.map(n => n.business_id);
      console.log('  Campaign business_id\'ler:', bcIds);
      console.log('  Notification business_id\'ler:', pnIds);
      
      // business_profiles kontrol
      if (bcIds.length > 0) {
        const profiles = await sql`SELECT id, business_name FROM business_profiles WHERE id = ANY(${bcIds})`;
        console.log(`  Bu business_id'lere sahip ${profiles.rowCount} profile bulundu`);
      }
    } else {
      joinTest.rows.forEach(r => {
        console.log(`  ✅ [${r.campaign_id}] ${r.title}`);
        console.log(`    Business: ${r.business_name}`);
        console.log(`    İndirim: ${r.discount_percent ? `%${r.discount_percent}` : `${r.discount_amount}₺`}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
