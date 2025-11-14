require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixPriceRatingConstraint() {
  try {
    console.log('🔧 Fixing price_rating constraint...\n');
    
    // Drop old constraint
    await pool.query(`
      ALTER TABLE location_reviews 
      DROP CONSTRAINT IF EXISTS location_reviews_price_rating_check
    `);
    console.log('✅ Old constraint dropped');
    
    // Add new constraint (1-5)
    await pool.query(`
      ALTER TABLE location_reviews 
      ADD CONSTRAINT location_reviews_price_rating_check 
      CHECK (price_rating >= 1 AND price_rating <= 5)
    `);
    console.log('✅ New constraint added (1-5)');
    
    console.log('\n✅ Price rating constraint fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixPriceRatingConstraint();
