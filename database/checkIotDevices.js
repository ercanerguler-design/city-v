require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkTable() {
  const result = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'iot_devices' 
    ORDER BY ordinal_position
  `;
  
  console.log('iot_devices sütunları:');
  result.rows.forEach(c => console.log('  -', c.column_name, ':', c.data_type));
  process.exit(0);
}

checkTable();
