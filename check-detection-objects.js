require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkDetectionObjects() {
  try {
    console.log('🔍 detection_objects kolonunu kontrol ediyorum...\n');

    // Son 10 kaydı kontrol et
    const result = await sql`
      SELECT 
        id,
        device_id,
        people_count,
        detection_objects,
        analysis_timestamp,
        created_at
      FROM iot_crowd_analysis
      WHERE device_id = '60'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log(`✅ ${result.rows.length} kayıt bulundu\n`);

    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ID: ${row.id}`);
      console.log(`   Device: ${row.device_id}`);
      console.log(`   People: ${row.people_count}`);
      console.log(`   Detection Objects:`, row.detection_objects);
      console.log(`   Type:`, typeof row.detection_objects);
      
      if (row.detection_objects) {
        try {
          const parsed = typeof row.detection_objects === 'string' 
            ? JSON.parse(row.detection_objects) 
            : row.detection_objects;
          console.log(`   Parsed:`, parsed);
        } catch (e) {
          console.log(`   Parse error:`, e.message);
        }
      } else {
        console.log(`   ⚠️ NULL veya undefined!`);
      }
      console.log('');
    });

    // Kaç kayıtta detection_objects var?
    const countResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(detection_objects) as with_objects,
        COUNT(*) - COUNT(detection_objects) as without_objects
      FROM iot_crowd_analysis
      WHERE device_id = '60'
    `;

    console.log('📊 İstatistikler:');
    console.log(`   Toplam: ${countResult.rows[0].total}`);
    console.log(`   detection_objects VAR: ${countResult.rows[0].with_objects}`);
    console.log(`   detection_objects YOK: ${countResult.rows[0].without_objects}`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit(0);
  }
}

checkDetectionObjects();
