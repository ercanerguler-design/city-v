const { sql } = require('@vercel/postgres');

async function setupSentimentTables() {
  try {
    console.log('🎭 Setting up sentiment tracking tables...\n');

    // 1. location_sentiments tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS location_sentiments (
        id SERIAL PRIMARY KEY,
        location_id VARCHAR(100) NOT NULL,
        sentiment VARCHAR(20) NOT NULL,
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ location_sentiments table created');

    // 2. Index'ler
    await sql`CREATE INDEX IF NOT EXISTS idx_location_sentiments_location ON location_sentiments(location_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_location_sentiments_created ON location_sentiments(created_at)`;
    console.log('✅ Indexes created');

    // 3. Sentiment stats view
    await sql`
      CREATE OR REPLACE VIEW location_sentiment_stats AS
      SELECT
        location_id,
        COUNT(*) as total_sentiments,
        COUNT(CASE WHEN sentiment = 'happy' THEN 1 END) as happy_count,
        COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN sentiment = 'sad' THEN 1 END) as sad_count,
        COUNT(CASE WHEN sentiment = 'angry' THEN 1 END) as angry_count,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as today_sentiments
      FROM location_sentiments
      GROUP BY location_id
    `;
    console.log('✅ location_sentiment_stats view created');

    // 4. Test verisi ekle
    const testLocations = ['ank-1', 'ank-2', 'ank-3', '16', '6'];
    const sentiments = ['happy', 'happy', 'neutral', 'sad', 'happy', 'neutral', 'angry'];
    
    console.log('\n📊 Adding test sentiment data...');
    for (const loc of testLocations) {
      for (let i = 0; i < 3; i++) {
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000); // i saat önce
        await sql`
          INSERT INTO location_sentiments (location_id, sentiment, created_at)
          VALUES (${loc}, ${sentiment}, ${timestamp.toISOString()})
        `;
      }
      console.log(`✅ Added sentiments for location: ${loc}`);
    }

    // 5. Stats'ı göster
    const stats = await sql`
      SELECT * FROM location_sentiment_stats
      LIMIT 5
    `;

    console.log('\n📊 Sentiment Stats:');
    stats.rows.forEach(s => {
      console.log(`\n   Location: ${s.location_id}`);
      console.log(`   Total: ${s.total_sentiments}`);
      console.log(`   😊 Happy: ${s.happy_count}`);
      console.log(`   😐 Neutral: ${s.neutral_count}`);
      console.log(`   😞 Sad: ${s.sad_count}`);
      console.log(`   😡 Angry: ${s.angry_count}`);
      console.log(`   Today: ${s.today_sentiments}`);
    });

    console.log('\n✅ Sentiment tracking setup complete!');

  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupSentimentTables();
