const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('🔧 Fixing location_reviews table...\n');
  
  try {
    // Step 1: Check existing data
    console.log('📊 Step 1: Checking existing data...');
    const existing = await sql`
      SELECT id, sentiment, price_rating 
      FROM location_reviews 
      WHERE sentiment IS NOT NULL OR price_rating IS NOT NULL
      LIMIT 10
    `;
    console.log(`Found ${existing.length} reviews with sentiment/price data`);
    existing.forEach(r => {
      console.log(`  ID ${r.id}: sentiment='${r.sentiment}', price='${r.price_rating}'`);
    });
    
    // Step 2: Drop old sentiment constraint
    console.log('\n🗑️ Step 2: Dropping old sentiment constraint...');
    await sql`
      ALTER TABLE location_reviews 
      DROP CONSTRAINT IF EXISTS location_reviews_sentiment_check
    `;
    console.log('✅ Old constraint dropped');
    
    // Step 3: Drop old price_rating constraint if exists
    console.log('\n🗑️ Step 3: Dropping old price_rating constraint...');
    await sql`
      ALTER TABLE location_reviews 
      DROP CONSTRAINT IF EXISTS location_reviews_price_rating_check
    `;
    console.log('✅ Old price constraint dropped');
    
    // Step 4: Update existing data to match new schema
    console.log('\n🔄 Step 4: Updating existing data...');
    
    // Map old sentiment values to new ones
    await sql`
      UPDATE location_reviews 
      SET sentiment = CASE 
        WHEN sentiment = 'positive' THEN 'happy'
        WHEN sentiment = 'negative' THEN 'sad'
        WHEN sentiment = 'neutral' THEN 'neutral'
        ELSE sentiment
      END
      WHERE sentiment IN ('positive', 'negative', 'neutral')
    `;
    console.log('✅ Sentiment values updated');
    
    // Map old price_rating integer values to new string values
    await sql`
      UPDATE location_reviews 
      SET price_rating = CASE 
        WHEN price_rating = '1' THEN 'very_cheap'
        WHEN price_rating = '2' THEN 'cheap'
        WHEN price_rating = '3' THEN 'fair'
        WHEN price_rating = '4' THEN 'expensive'
        WHEN price_rating = '5' THEN 'very_expensive'
        ELSE price_rating
      END
      WHERE price_rating IN ('1', '2', '3', '4', '5')
    `;
    console.log('✅ Price rating values updated');
    
    // Step 5: Add new constraints
    console.log('\n✅ Step 5: Adding new constraints...');
    await sql`
      ALTER TABLE location_reviews
      ADD CONSTRAINT location_reviews_sentiment_check 
      CHECK (sentiment IN ('happy', 'sad', 'angry', 'neutral', 'excited', 'disappointed'))
    `;
    console.log('✅ New sentiment constraint added');
    
    await sql`
      ALTER TABLE location_reviews
      ADD CONSTRAINT location_reviews_price_rating_check 
      CHECK (price_rating IN ('very_cheap', 'cheap', 'fair', 'expensive', 'very_expensive'))
    `;
    console.log('✅ New price_rating constraint added');
    
    console.log('\n🎉 All done! location_reviews table is ready.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Details:', error.detail || 'No details');
  }
  
  process.exit(0);
})();
