require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkReviewsTable() {
  try {
    console.log('📋 Checking location_reviews table structure...\n');
    
    // Check table columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'location_reviews'
      ORDER BY ordinal_position
    `;
    
    console.log('✅ Columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Check constraints
    console.log('\n📋 Checking constraints...');
    const constraints = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'location_reviews'
    `;
    
    console.log('✅ Constraints:');
    constraints.forEach(c => {
      console.log(`  - ${c.constraint_name}: ${c.constraint_type}`);
    });
    
    // Check CHECK constraints detail
    const checks = await sql`
      SELECT 
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'location_reviews'
    `;
    
    if (checks.length > 0) {
      console.log('\n📋 CHECK Constraints Details:');
      checks.forEach(c => {
        console.log(`  - ${c.constraint_name}:`);
        console.log(`    ${c.check_clause}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkReviewsTable();
