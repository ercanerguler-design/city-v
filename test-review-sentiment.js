// Test Review and Sentiment API endpoints
import { query } from './lib/db.js';

async function testReviewSentimentSystem() {
  console.log('🧪 Testing Review & Sentiment System\n');
  
  try {
    // 1. Check if tables exist
    console.log('1️⃣ Checking tables...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('location_reviews', 'business_interactions', 'business_profiles')
      ORDER BY table_name
    `);
    
    console.log('📋 Existing tables:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
    const hasReviews = tables.rows.some(r => r.table_name === 'location_reviews');
    const hasInteractions = tables.rows.some(r => r.table_name === 'business_interactions');
    const hasProfiles = tables.rows.some(r => r.table_name === 'business_profiles');
    
    if (!hasReviews || !hasInteractions) {
      console.log('\n❌ Missing required tables!');
      console.log('\n📝 Creating missing tables...');
      
      if (!hasReviews) {
        await query(`
          CREATE TABLE IF NOT EXISTS location_reviews (
            id SERIAL PRIMARY KEY,
            location_id VARCHAR(100) NOT NULL,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            user_email VARCHAR(255),
            user_name VARCHAR(255),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            sentiment VARCHAR(20) CHECK (sentiment IN ('happy', 'sad', 'angry', 'neutral', 'excited', 'disappointed')),
            price_rating VARCHAR(20),
            tags TEXT[],
            is_verified BOOLEAN DEFAULT false,
            helpful_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log('✅ location_reviews table created');
      }
      
      if (!hasInteractions) {
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
        console.log('✅ business_interactions table created');
      }
    } else {
      console.log('✅ All required tables exist\n');
    }
    
    // 2. Check business_profiles for testing
    if (hasProfiles) {
      console.log('2️⃣ Sample business profiles:');
      const profiles = await query(`
        SELECT user_id, business_name, location_id
        FROM business_profiles
        LIMIT 5
      `);
      
      if (profiles.rows.length > 0) {
        profiles.rows.forEach(profile => {
          console.log(`   - ${profile.business_name} (user_id: ${profile.user_id}, location_id: ${profile.location_id})`);
        });
      } else {
        console.log('   ⚠️ No business profiles found');
      }
    }
    
    // 3. Test inserting a sentiment
    console.log('\n3️⃣ Testing sentiment insertion...');
    const testLocationId = 'test-location-' + Date.now();
    const testUserId = 1; // Assuming user 1 exists
    
    const sentimentResult = await query(`
      INSERT INTO business_interactions 
      (business_user_id, interaction_type, location_id, sentiment, created_at)
      VALUES ($1, 'sentiment', $2, $3, $4)
      RETURNING id, sentiment, created_at
    `, [testUserId, testLocationId, 'happy', new Date().toISOString()]);
    
    console.log('✅ Sentiment inserted:', sentimentResult.rows[0]);
    
    // 4. Test inserting a review
    console.log('\n4️⃣ Testing review insertion...');
    const reviewResult = await query(`
      INSERT INTO location_reviews
      (location_id, user_email, user_name, rating, comment, sentiment)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, rating, sentiment, created_at
    `, [testLocationId, 'test@test.com', 'Test User', 5, 'Test comment', 'happy']);
    
    console.log('✅ Review inserted:', reviewResult.rows[0]);
    
    // 5. Clean up test data
    console.log('\n5️⃣ Cleaning up test data...');
    await query('DELETE FROM business_interactions WHERE location_id = $1', [testLocationId]);
    await query('DELETE FROM location_reviews WHERE location_id = $1', [testLocationId]);
    console.log('✅ Test data cleaned');
    
    console.log('\n✅ All tests passed! Review & Sentiment system is working.\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Details:', error);
  }
  
  process.exit(0);
}

testReviewSentimentSystem();
