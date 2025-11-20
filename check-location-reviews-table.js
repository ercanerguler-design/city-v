const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkLocationReviews() {
  try {
    console.log('📋 Checking location_reviews table...');
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'location_reviews'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ location_reviews table does not exist');
      
      console.log('✅ Creating location_reviews table...');
      await pool.query(`
        CREATE TABLE location_reviews (
          id SERIAL PRIMARY KEY,
          location_id VARCHAR(255) NOT NULL,
          user_id INTEGER,
          user_email VARCHAR(255),
          user_name VARCHAR(255),
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          sentiment VARCHAR(50),
          price_rating VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ location_reviews table created!');
    } else {
      console.log('✅ location_reviews table exists');
      
      // Check sample data
      const data = await pool.query('SELECT COUNT(*) FROM location_reviews');
      console.log('📊 Total reviews:', data.rows[0].count);
      
      // Check structure
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'location_reviews'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Table structure:', columns.rows);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkLocationReviews();