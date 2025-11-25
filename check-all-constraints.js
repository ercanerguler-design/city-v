const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('🔍 Checking ALL constraints on location_reviews...');
  
  try {
    const constraints = await sql`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'location_reviews'::regclass
      ORDER BY conname
    `;
    
    console.log(`\n📋 Found ${constraints.length} constraints:\n`);
    constraints.forEach(c => {
      console.log(`${c.constraint_name}`);
      console.log(`  Type: ${c.constraint_type}`);
      console.log(`  Definition: ${c.definition}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
})();
