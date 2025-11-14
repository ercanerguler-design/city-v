require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  // Business 20'ye kamera ekle
  await sql`
    UPDATE iot_devices 
    SET business_id = 20
    WHERE device_id = 29
  `;

  // Crowd analysis'i de business 20'ye bağla
  await sql`
    UPDATE iot_crowd_analysis
    SET device_id = 29
    WHERE device_id IN (SELECT device_id FROM iot_devices WHERE business_id = 20)
  `;

  const cameras = await sql`
    SELECT device_id, device_name, ip_address, stream_url, business_id 
    FROM iot_devices 
    WHERE business_id = 20
  `;
  
  console.log('✅ Business 20 Cameras:', cameras.rows);

  const analysis = await sql`
    SELECT COUNT(*) as count, device_id 
    FROM iot_crowd_analysis 
    WHERE device_id = 29
    GROUP BY device_id
  `;
  
  console.log('✅ Analysis Records:', analysis.rows);
  
  process.exit(0);
})();
