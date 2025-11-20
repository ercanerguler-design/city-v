const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkBusinessReviewsMapping() {
  try {
    console.log('📋 Business profiles and reviews check...');
    
    // Business profiles count
    const businessCount = await pool.query('SELECT COUNT(*) FROM business_profiles');
    console.log('🏢 Business profiles:', businessCount.rows[0].count);
    
    // Reviews count
    const reviewCount = await pool.query('SELECT COUNT(*) FROM location_reviews');
    console.log('💬 Total reviews:', reviewCount.rows[0].count);
    
    // Check matching location_ids
    const matchingQuery = `
      SELECT 
        bp.id as business_id,
        bp.business_name,
        bp.location_id,
        COUNT(lr.id) as review_count
      FROM business_profiles bp
      LEFT JOIN location_reviews lr ON bp.location_id = lr.location_id
      GROUP BY bp.id, bp.business_name, bp.location_id
      ORDER BY review_count DESC
    `;
    
    const matching = await pool.query(matchingQuery);
    console.log('📊 Business profile -> Reviews mapping:');
    matching.rows.forEach(row => {
      console.log(`  - ${row.business_name}: ${row.review_count} reviews (location_id: ${row.location_id})`);
    });
    
    // Sample review location_ids
    const sampleReviews = await pool.query('SELECT DISTINCT location_id FROM location_reviews LIMIT 10');
    console.log('📋 Sample review location_ids:', sampleReviews.rows.map(r => r.location_id));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkBusinessReviewsMapping();