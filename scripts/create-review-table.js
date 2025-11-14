require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createReviewTable() {
  try {
    console.log('📝 Creating location_reviews table...');

    await sql`
      CREATE TABLE IF NOT EXISTS location_reviews (
        id SERIAL PRIMARY KEY,
        location_id VARCHAR(255) NOT NULL,
        user_id INTEGER,
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        sentiment VARCHAR(50),
        price_rating VARCHAR(50),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_location_reviews_location 
      ON location_reviews(location_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_location_reviews_user 
      ON location_reviews(user_id)
    `;

    console.log('✅ location_reviews table created successfully!');
    
    // Test query
    const result = await sql`SELECT COUNT(*) as count FROM location_reviews`;
    console.log(`📊 Current reviews count: ${result[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

createReviewTable();
