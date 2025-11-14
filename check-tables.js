import { query } from './lib/db.js';

async function quickCheck() {
  console.log('🔍 Quick table check\n');
  
  const tables = await query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('location_reviews', 'business_interactions')
    ORDER BY table_name
  `);
  
  console.log('Tables found:', tables.rows);
  
  if (tables.rows.length < 2) {
    console.log('\n❌ Tables missing! Creating them...\n');
    
    // Create location_reviews
    await query(`
      CREATE TABLE IF NOT EXISTS location_reviews (
        id SERIAL PRIMARY KEY,
        location_id VARCHAR(100) NOT NULL,
        user_id INTEGER,
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        sentiment VARCHAR(20),
        price_rating VARCHAR(20),
        tags TEXT[],
        is_verified BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ location_reviews created');
    
    // Create business_interactions
    await query(`
      CREATE TABLE IF NOT EXISTS business_interactions (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER NOT NULL,
        interaction_type VARCHAR(50) NOT NULL,
        location_id VARCHAR(100),
        user_email VARCHAR(255),
        sentiment VARCHAR(20),
        rating INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ business_interactions created');
  } else {
    console.log('\n✅ Both tables exist!');
  }
  
  process.exit(0);
}

quickCheck().catch(console.error);
