const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Z1HBqLuCNi0w@ep-solitary-wind-ad4zkrm3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTrackingTables() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating tracking tables...\n');

    // 1. Business Views Tablosu
    console.log('📋 Creating business_views table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_views (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
        location_id VARCHAR(100),
        location_name VARCHAR(255),
        location_category VARCHAR(50),
        source VARCHAR(50) DEFAULT 'map',
        viewed_at TIMESTAMP DEFAULT NOW(),
        user_agent TEXT,
        ip_address VARCHAR(50)
      );
    `);
    console.log('✅ business_views table created\n');

    // 2. Business Views Indexes
    console.log('📋 Creating business_views indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_business_views_business_id ON business_views(business_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_business_views_viewed_at ON business_views(viewed_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_business_views_source ON business_views(source);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_business_views_location_id ON business_views(location_id);`);
    console.log('✅ business_views indexes created\n');

    // 3. Business Favorites Tablosu
    console.log('📋 Creating business_favorites table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_favorites (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
        user_email VARCHAR(255),
        location_id VARCHAR(100) NOT NULL,
        location_name VARCHAR(255) NOT NULL,
        location_category VARCHAR(50),
        location_address TEXT,
        location_coordinates JSONB,
        added_at TIMESTAMP DEFAULT NOW(),
        user_agent TEXT,
        source VARCHAR(50) DEFAULT 'map',
        UNIQUE(business_id, location_id)
      );
    `);
    console.log('✅ business_favorites table created\n');

    // 4. Business Favorites Indexes
    console.log('📋 Creating business_favorites indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_business_favorites_business_id ON business_favorites(business_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_business_favorites_location_id ON business_favorites(location_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_business_favorites_added_at ON business_favorites(added_at);`);
    console.log('✅ business_favorites indexes created\n');

    // 5. Business Views Stats View
    console.log('📋 Creating business_view_stats view...');
    await client.query(`DROP VIEW IF EXISTS business_view_stats;`);
    await client.query(`
      CREATE VIEW business_view_stats AS
      SELECT
        business_id,
        COUNT(*) as total_views,
        COUNT(CASE WHEN DATE(viewed_at) = CURRENT_DATE THEN 1 END) as today_views,
        COUNT(CASE WHEN viewed_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week_views,
        COUNT(CASE WHEN viewed_at >= NOW() - INTERVAL '30 days' THEN 1 END) as month_views,
        COUNT(CASE WHEN source = 'map' THEN 1 END) as map_views,
        COUNT(CASE WHEN source = 'list' THEN 1 END) as list_views,
        COUNT(CASE WHEN source = 'search' THEN 1 END) as search_views
      FROM business_views
      GROUP BY business_id;
    `);
    console.log('✅ business_view_stats view created\n');

    // 6. Business Favorites Stats View
    console.log('📋 Creating business_favorites_stats view...');
    await client.query(`DROP VIEW IF EXISTS business_favorites_stats;`);
    await client.query(`
      CREATE VIEW business_favorites_stats AS
      SELECT
        business_id,
        COUNT(*) as total_favorites,
        COUNT(CASE WHEN DATE(added_at) = CURRENT_DATE THEN 1 END) as today_favorites,
        COUNT(CASE WHEN added_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week_favorites,
        COUNT(CASE WHEN added_at >= NOW() - INTERVAL '30 days' THEN 1 END) as month_favorites,
        COUNT(CASE WHEN location_category = 'cafe' THEN 1 END) as cafe_favorites,
        COUNT(CASE WHEN location_category = 'restaurant' THEN 1 END) as restaurant_favorites,
        COUNT(CASE WHEN location_category = 'bank' THEN 1 END) as bank_favorites
      FROM business_favorites
      GROUP BY business_id;
    `);
    console.log('✅ business_favorites_stats view created\n');

    // 7. Mevcut Verileri Kontrol Et
    console.log('📊 Checking existing data...');
    const viewsResult = await client.query('SELECT COUNT(*) as count FROM business_views');
    const favoritesResult = await client.query('SELECT COUNT(*) as count FROM business_favorites');
    
    console.log(`   business_views: ${viewsResult.rows[0].count} kayıt`);
    console.log(`   business_favorites: ${favoritesResult.rows[0].count} kayıt\n`);

    console.log('✅ All tracking tables created successfully!');
    console.log('\n🎉 Artık favorilere ekleme ve görüntüleme takibi çalışacak!\n');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createTrackingTables()
  .then(() => {
    console.log('✨ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
