const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessVisibility() {
  try {
    console.log('🔍 Checking business profiles visibility...\n');
    
    const result = await sql`
      SELECT 
        id,
        location_id,
        user_id,
        business_name,
        category,
        city,
        latitude,
        longitude,
        is_visible_on_map,
        auto_sync_to_cityv,
        address
      FROM business_profiles 
      WHERE user_id = 20
    `;
    
    if (result.length > 0) {
      const profile = result[0];
      console.log('✅ Business profile found:');
      console.log(`   ID: ${profile.id}`);
      console.log(`   Location ID: ${profile.location_id}`);
      console.log(`   Business: ${profile.business_name}`);
      console.log(`   Category: ${profile.category}`);
      console.log(`   City: ${profile.city}`);
      console.log(`   Latitude: ${profile.latitude}`);
      console.log(`   Longitude: ${profile.longitude}`);
      console.log(`   is_visible_on_map: ${profile.is_visible_on_map}`);
      console.log(`   auto_sync_to_cityv: ${profile.auto_sync_to_cityv}`);
      console.log(`   Address: ${profile.address || 'NULL'}`);
      
      console.log('\n📊 Visibility Status:');
      if (!profile.is_visible_on_map) {
        console.log('   ❌ is_visible_on_map = false');
      } else {
        console.log('   ✅ is_visible_on_map = true');
      }
      
      if (!profile.auto_sync_to_cityv) {
        console.log('   ❌ auto_sync_to_cityv = false');
      } else {
        console.log('   ✅ auto_sync_to_cityv = true');
      }
      
      if (!profile.latitude || !profile.longitude) {
        console.log('   ❌ Missing coordinates');
      } else {
        console.log('   ✅ Coordinates available');
      }
      
      console.log('\n🔧 Fix Required:');
      if (!profile.is_visible_on_map || !profile.auto_sync_to_cityv) {
        console.log('   Run: fetch("/api/admin/fix-visibility", {method: "POST"})');
      } else {
        console.log('   No fix needed - visibility is enabled!');
      }
    } else {
      console.log('❌ Business profile not found for user_id = 20');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBusinessVisibility();
