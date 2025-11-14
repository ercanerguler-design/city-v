/**
 * Gerçek ESP32-CAM Ekle: Giriş Kapısı
 * IP: 192.168.1.3, Port: 80, HD: 1600x1200
 */

require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function addCamera() {
  console.log('📹 Kamera ekleniyor: 192.168.1.3...');
  
  try {
    // Business user kontrol (business_name yerine company_name)
    const user = await sql`SELECT id, company_name FROM business_users WHERE id = 6 LIMIT 1`;
    
    if (user.rows.length === 0) {
      console.error('❌ Business user bulunamadı!');
      return;
    }
    
    const businessId = user.rows[0].id;
    console.log(`✅ Business: ${user.rows[0].company_name} (ID: ${businessId})`);

    // Aynı IP kontrolü
    const existing = await sql`
      SELECT id, camera_name 
      FROM business_cameras 
      WHERE business_user_id = ${businessId} AND ip_address = '192.168.1.3'
    `;

    if (existing.rows.length > 0) {
      console.log('⚠️ Kamera zaten kayıtlı:', existing.rows[0]);
      return;
    }

    // Kamera ekle
    const result = await sql`
      INSERT INTO business_cameras (
        business_user_id, camera_name, ip_address, port,
        stream_url, location_description, status, resolution, ai_enabled
      ) VALUES (
        ${businessId},
        'ESP32-CAM HD - Giriş Kapısı',
        '192.168.1.3',
        80,
        'http://192.168.1.3:80/stream',
        'Giriş Kapısı - Ana Salon',
        'active',
        '1600x1200',
        true
      )
      RETURNING id, camera_name, ip_address, port, resolution
    `;

    console.log('✅ Kamera eklendi!');
    console.log('📹 Detay:', result.rows[0]);
    console.log('📺 Test URL: http://192.168.1.3:80/stream');
    console.log('🎯 Çözünürlük: 1600x1200 (UXGA Ultra HD)');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    process.exit(0);
  }
}

addCamera();
