const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkIdStructure() {
  try {
    console.log('🔍 Checking ID structure and relationships...\n');
    
    // 1. Business Users
    console.log('👥 BUSINESS USERS:');
    const businessUsers = await sql`SELECT id, email, full_name FROM business_users ORDER BY id`;
    console.log(`Total: ${businessUsers.length}`);
    businessUsers.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Name: ${u.full_name}`);
    });
    
    // 2. Business Profiles
    console.log('\n🏢 BUSINESS PROFILES:');
    const businessProfiles = await sql`SELECT id, user_id, business_name FROM business_profiles ORDER BY id`;
    console.log(`Total: ${businessProfiles.length}`);
    businessProfiles.forEach(p => {
      console.log(`  - Profile ID: ${p.id}, User ID: ${p.user_id}, Name: ${p.business_name}`);
    });
    
    // 3. Business Cameras
    console.log('\n📷 BUSINESS CAMERAS:');
    const cameras = await sql`SELECT id, business_user_id, camera_name FROM business_cameras ORDER BY id`;
    console.log(`Total: ${cameras.length}`);
    cameras.forEach(c => {
      console.log(`  - Camera ID: ${c.id}, Business User ID: ${c.business_user_id}, Name: ${c.camera_name}`);
    });
    
    // 4. Crowd Analysis
    console.log('\n👨‍👩‍👧‍👦 CROWD ANALYSIS:');
    const crowdData = await sql`
      SELECT ca.id, ca.camera_id, ca.people_count, bc.camera_name, bc.business_user_id
      FROM crowd_analysis ca
      LEFT JOIN business_cameras bc ON ca.camera_id = bc.id
      ORDER BY ca.timestamp DESC
      LIMIT 5
    `;
    console.log(`Total records: ${crowdData.length}`);
    crowdData.forEach(c => {
      console.log(`  - Analysis ID: ${c.id}, Camera ID: ${c.camera_id}, Business User: ${c.business_user_id}, People: ${c.people_count}`);
    });
    
    // 5. Menu Data
    console.log('\n🍽️ MENU DATA:');
    const menuCategories = await sql`SELECT id, business_id, name FROM business_menu_categories ORDER BY business_id`;
    console.log(`Total categories: ${menuCategories.length}`);
    const grouped = {};
    menuCategories.forEach(c => {
      if (!grouped[c.business_id]) grouped[c.business_id] = [];
      grouped[c.business_id].push(c.name);
    });
    Object.entries(grouped).forEach(([businessId, cats]) => {
      console.log(`  - Business ID ${businessId}: ${cats.length} categories (${cats.join(', ')})`);
    });
    
    // 6. Reviews
    console.log('\n⭐ REVIEWS:');
    const reviews = await sql`
      SELECT lr.id, lr.location_id, lr.user_name, bp.business_name, bp.user_id
      FROM location_reviews lr
      LEFT JOIN business_profiles bp ON CAST(lr.location_id AS INTEGER) = bp.id
      ORDER BY lr.created_at DESC
      LIMIT 5
    `;
    console.log(`Total reviews: ${reviews.length}`);
    reviews.forEach(r => {
      console.log(`  - Review ID: ${r.id}, Location ID: ${r.location_id}, Business: ${r.business_name}, User ID: ${r.user_id}`);
    });
    
    // 7. Check for mismatches
    console.log('\n⚠️ CHECKING FOR ID MISMATCHES:');
    
    // Check if business_users.id matches business_profiles.user_id
    const mismatch1 = await sql`
      SELECT bu.id as business_user_id, bp.id as profile_id, bp.user_id, bu.email, bp.business_name
      FROM business_users bu
      LEFT JOIN business_profiles bp ON bu.id = bp.user_id
      WHERE bp.id IS NULL
    `;
    if (mismatch1.length > 0) {
      console.log('❌ Business users without profiles:');
      mismatch1.forEach(m => console.log(`  - User ID ${m.business_user_id}: ${m.email}`));
    } else {
      console.log('✅ All business users have profiles');
    }
    
    // Check if cameras are linked to correct business users
    const mismatch2 = await sql`
      SELECT bc.id, bc.camera_name, bc.business_user_id, bu.email
      FROM business_cameras bc
      LEFT JOIN business_users bu ON bc.business_user_id = bu.id
      WHERE bu.id IS NULL
    `;
    if (mismatch2.length > 0) {
      console.log('❌ Cameras with invalid business_user_id:');
      mismatch2.forEach(m => console.log(`  - Camera ${m.id}: ${m.camera_name} → User ID ${m.business_user_id} (NOT FOUND)`));
    } else {
      console.log('✅ All cameras linked to valid business users');
    }
    
    // Check menu data
    const mismatch3 = await sql`
      SELECT mc.id, mc.name, mc.business_id, bp.business_name
      FROM business_menu_categories mc
      LEFT JOIN business_profiles bp ON mc.business_id = bp.id
      WHERE bp.id IS NULL
    `;
    if (mismatch3.length > 0) {
      console.log('❌ Menu categories with invalid business_id:');
      mismatch3.forEach(m => console.log(`  - Category ${m.id}: ${m.name} → Business ID ${m.business_id} (NOT FOUND)`));
    } else {
      console.log('✅ All menu categories linked to valid businesses');
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`  - Business Users: ${businessUsers.length}`);
    console.log(`  - Business Profiles: ${businessProfiles.length}`);
    console.log(`  - Cameras: ${cameras.length}`);
    console.log(`  - Crowd Analysis Records: ${crowdData.length}`);
    console.log(`  - Menu Categories: ${menuCategories.length}`);
    console.log(`  - Reviews: ${reviews.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

checkIdStructure();
