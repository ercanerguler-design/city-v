const { sql } = require('@vercel/postgres');

async function setupAndTestFavorites() {
  try {
    console.log('🔧 Setting up favorites tracking...\n');

    // 1. Create table
    await sql`
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
      )
    `;
    console.log('✅ business_favorites table created/verified');

    // 2. Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_business_favorites_business_id ON business_favorites(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_favorites_location_id ON business_favorites(location_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_business_favorites_added_at ON business_favorites(added_at)`;
    console.log('✅ Indexes created');

    // 3. Create view
    await sql`
      CREATE OR REPLACE VIEW business_favorites_stats AS
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
      GROUP BY business_id
    `;
    console.log('✅ business_favorites_stats view created\n');

    // 4. Get business_user_id from business_profiles
    const profiles = await sql`
      SELECT id, user_id, business_name 
      FROM business_profiles 
      WHERE user_id IN (6, 8)
      ORDER BY user_id
    `;

    console.log('📊 Found business profiles:', profiles);

    if (!profiles.rows || profiles.rows.length === 0) {
      console.log('⚠️ No business profiles found. Run business setup first.');
      return;
    }

    // 5. Add test favorites for first business
    const testBusiness = profiles.rows[0];
    console.log(`\n🎯 Adding test favorites for: ${testBusiness.business_name} (profile_id: ${testBusiness.id})\n`);

    const testFavorites = [
      { location_id: 'ank-1', name: 'Anıtkabir', category: 'museum', coords: [39.9254, 32.8369] },
      { location_id: 'ank-2', name: 'Atakule', category: 'shopping', coords: [39.9062, 32.8543] },
      { location_id: 'ank-3', name: 'Kızılay Meydanı', category: 'square', coords: [39.9199, 32.8543] },
      { location_id: 'ank-cafe-1', name: 'Starbucks Tunalı', category: 'cafe', coords: [39.9162, 32.8543] },
      { location_id: 'ank-rest-1', name: 'Nusr-Et Ankara', category: 'restaurant', coords: [39.9062, 32.8643] },
    ];

    for (const fav of testFavorites) {
      await sql`
        INSERT INTO business_favorites (
          business_id, 
          location_id, 
          location_name, 
          location_category,
          location_coordinates,
          source,
          added_at
        ) VALUES (
          ${testBusiness.id},
          ${fav.location_id},
          ${fav.name},
          ${fav.category},
          ${JSON.stringify(fav.coords)}::jsonb,
          'map',
          NOW()
        )
        ON CONFLICT (business_id, location_id) DO NOTHING
      `;
      console.log(`✅ Added: ${fav.name} (${fav.category})`);
    }

    // Add 2 more from yesterday
    await sql`
      INSERT INTO business_favorites (
        business_id, location_id, location_name, location_category,
        location_coordinates, source, added_at
      ) VALUES 
        (${testBusiness.id}, 'ank-bank-1', 'Ziraat Bankası', 'bank', '[]'::jsonb, 'list', NOW() - INTERVAL '1 day'),
        (${testBusiness.id}, 'ank-cafe-2', 'Kahve Dünyası', 'cafe', '[]'::jsonb, 'search', NOW() - INTERVAL '2 days')
      ON CONFLICT DO NOTHING
    `;

    // 6. Query stats
    const stats = await sql`
      SELECT * FROM business_favorites_stats 
      WHERE business_id = ${testBusiness.id}
    `;

    console.log('\n📊 Favorites Stats:');
    if (stats.rows && stats.rows.length > 0) {
      const s = stats.rows[0];
      console.log(`   Total: ${s.total_favorites}`);
      console.log(`   Today: ${s.today_favorites}`);
      console.log(`   This Week: ${s.week_favorites}`);
      console.log(`   This Month: ${s.month_favorites}`);
      console.log(`   Cafes: ${s.cafe_favorites}`);
      console.log(`   Restaurants: ${s.restaurant_favorites}`);
      console.log(`   Banks: ${s.bank_favorites}`);
    } else {
      console.log('   No stats yet (this is normal for first run)');
    }

    console.log('\n✅ Favorites tracking setup complete!');
    console.log(`🎯 Business ID to use in API: ${testBusiness.id}`);
    console.log(`🔗 Test API: /api/business/favorites/stats?businessId=${testBusiness.id}`);

  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupAndTestFavorites();
