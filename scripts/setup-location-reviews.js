const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setupLocationReviews() {
  try {
    console.log('🔧 Setting up location_reviews table...\n');
    
    // Check if table exists
    const checkTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'location_reviews'
      )
    `;
    
    if (checkTable[0].exists) {
      console.log('✅ location_reviews table already exists');
      
      // Show structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'location_reviews'
        ORDER BY ordinal_position
      `;
      
      console.log('\n📋 Table Structure:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
      });
      
      return;
    }
    
    console.log('⚠️  location_reviews table does not exist, creating...\n');
    
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS location_reviews (
        id SERIAL PRIMARY KEY,
        location_id VARCHAR(255) NOT NULL,
        user_id INTEGER,
        user_email VARCHAR(255),
        user_name VARCHAR(255) DEFAULT 'Anonim Kullanıcı',
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
        price_rating INTEGER CHECK (price_rating BETWEEN 1 AND 3),
        tags TEXT[],
        is_verified BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_location_reviews_location ON location_reviews(location_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_location_reviews_user ON location_reviews(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_location_reviews_created ON location_reviews(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_location_reviews_sentiment ON location_reviews(sentiment)`;
    
    console.log('✅ location_reviews table created successfully!');
    console.log('✅ Indexes created');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupLocationReviews();
