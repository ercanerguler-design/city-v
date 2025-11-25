const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const result = await sql`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'location_reviews' 
      AND column_name IN ('sentiment', 'price_rating')
    ORDER BY ordinal_position
  `;
  
  console.log('📋 location_reviews COLUMNS:');
  result.forEach(col => {
    console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} (${col.udt_name})`);
  });
  
  process.exit(0);
})();
