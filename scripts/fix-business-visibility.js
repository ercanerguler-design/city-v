const { query } = require('../lib/db.ts');

async function fixBusinessVisibility() {
  try {
    console.log('🔍 Checking business_profiles visibility settings...\n');
    
    // Check current state
    const checkResult = await query(
      `SELECT 
        user_id, 
        business_name, 
        city,
        is_visible_on_map, 
        auto_sync_to_cityv, 
        latitude, 
        longitude 
      FROM business_profiles`
    );
    
    console.log(`📊 Total business profiles: ${checkResult.rows.length}\n`);
    
    if (checkResult.rows.length === 0) {
      console.log('⚠️  No business profiles found!');
      return;
    }
    
    // Show current state
    checkResult.rows.forEach(profile => {
      console.log(`Business: ${profile.business_name}`);
      console.log(`  City: ${profile.city ||  'NULL'}`);
      console.log(`  Visible on map: ${profile.is_visible_on_map}`);
      console.log(`  Auto sync: ${profile.auto_sync_to_cityv}`);
      console.log(`  Has coordinates: ${profile.latitude && profile.longitude ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    // Fix all profiles - set visible and auto_sync to TRUE
    console.log('🔧 Fixing visibility settings...\n');
    
    const updateResult = await query(
      `UPDATE business_profiles 
       SET 
         is_visible_on_map = true,
         auto_sync_to_cityv = true
       WHERE is_visible_on_map = false 
          OR auto_sync_to_cityv = false
          OR is_visible_on_map IS NULL
          OR auto_sync_to_cityv IS NULL
       RETURNING user_id, business_name`
    );
    
    if (updateResult.rows.length > 0) {
      console.log(`✅ Updated ${updateResult.rows.length} profiles:`);
      updateResult.rows.forEach(p => {
        console.log(`  - ${p.business_name} (user_id: ${p.user_id})`);
      });
    } else {
      console.log('✅ All profiles already visible!');
    }
    
    console.log('\n🎉 Done! Business locations should now appear on map.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBusinessVisibility();
