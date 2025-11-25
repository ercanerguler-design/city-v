const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('🔧 Fixing price_rating column type...');
  
  try {
    // First, drop any existing constraints
    console.log('🗑️ Dropping existing constraints...');
    await sql`
      ALTER TABLE location_reviews 
      DROP CONSTRAINT IF EXISTS location_reviews_price_rating_check
    `;
    
    // ALTER TABLE to change column type from INTEGER to VARCHAR(20)
    await sql`
      ALTER TABLE location_reviews 
      ALTER COLUMN price_rating TYPE VARCHAR(20) USING price_rating::VARCHAR
    `;
    
    console.log('✅ price_rating column changed to VARCHAR(20)');
    
    // Verify the change
    const result = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'location_reviews' 
        AND column_name = 'price_rating'
    `;
    
    console.log('📋 Verified column type:');
    result.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.udt_name})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
})();
