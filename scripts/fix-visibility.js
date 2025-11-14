const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixVisibility() {
  try {
    console.log('🔧 Fixing business profile visibility...\n');
    
    // Update visibility for all business profiles
    const result = await sql`
      UPDATE business_profiles 
      SET 
        is_visible_on_map = true,
        auto_sync_to_cityv = true,
        updated_at = NOW()
      WHERE is_visible_on_map = false OR auto_sync_to_cityv = false
      RETURNING id, business_name, city, is_visible_on_map, auto_sync_to_cityv
    `;
    
    console.log(`✅ ${result.length} business profile(s) updated:\n`);
    
    result.forEach((profile) => {
      console.log(`   📍 ${profile.business_name} (${profile.city})`);
      console.log(`      - is_visible_on_map: ${profile.is_visible_on_map}`);
      console.log(`      - auto_sync_to_cityv: ${profile.auto_sync_to_cityv}\n`);
    });
    
    // Verify all profiles are now visible
    const allProfiles = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_visible_on_map = true THEN 1 ELSE 0 END) as visible,
        SUM(CASE WHEN auto_sync_to_cityv = true THEN 1 ELSE 0 END) as synced
      FROM business_profiles
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;
    
    const stats = allProfiles[0];
    console.log('📊 Final Statistics:');
    console.log(`   Total Profiles with Coordinates: ${stats.total}`);
    console.log(`   Visible on Map: ${stats.visible}`);
    console.log(`   Auto-Sync Enabled: ${stats.synced}`);
    
    if (stats.total === stats.visible && stats.total === stats.synced) {
      console.log('\n🎉 All profiles are now visible and synced!');
    } else {
      console.log('\n⚠️ Some profiles still need attention');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixVisibility();
