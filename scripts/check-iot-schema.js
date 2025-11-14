require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

(async () => {
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'iot_devices'
    ORDER BY ordinal_position
  `;
  
  console.log('iot_devices columns:');
  cols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
  
  process.exit(0);
})();
