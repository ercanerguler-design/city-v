const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('🔍 Checking sentiment constraint...');
  
  try {
    // Check current constraint
    const constraints = await sql`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'location_reviews'::regclass
        AND conname LIKE '%sentiment%'
    `;
    
    console.log('📋 Current sentiment constraint:');
    constraints.forEach(c => {
      console.log(`  ${c.constraint_name}`);
      console.log(`  ${c.definition}`);
    });
    
    // Drop old constraint
    console.log('\n🗑️ Dropping old constraint...');
    await sql`
      ALTER TABLE location_reviews 
      DROP CONSTRAINT IF EXISTS location_reviews_sentiment_check
    `;
    
    // Add new constraint with correct values
    console.log('✅ Adding new constraint...');
    await sql`
      ALTER TABLE location_reviews
      ADD CONSTRAINT location_reviews_sentiment_check 
      CHECK (sentiment IN ('happy', 'sad', 'angry', 'neutral', 'excited', 'disappointed'))
    `;
    
    console.log('✅ Sentiment constraint updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
})();
