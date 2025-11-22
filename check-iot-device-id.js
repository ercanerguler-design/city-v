require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

(async () => {
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'iot_crowd_analysis' AND column_name IN ('device_id', 'people_count', 'crowd_density')
  `;
  console.log('iot_crowd_analysis kolonları:');
  console.log(cols);
  
  const samples = await sql`SELECT device_id, people_count, crowd_density FROM iot_crowd_analysis LIMIT 5`;
  console.log('\nÖrnek veriler:');
  samples.forEach(s => {
    console.log(`Device ID: "${s.device_id}" (${typeof s.device_id}), People: ${s.people_count}, Density: ${s.crowd_density}`);
  });
})();
