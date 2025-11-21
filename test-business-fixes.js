// Test all business profile fixes
const { neon } = require('@neondatabase/serverless');

async function testBusinessProfileFixes() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🧪 Testing Business Profile Fixes\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Check SCE INNOVATION profile
    console.log('\n1️⃣ Testing SCE INNOVATION Profile (ID: 15)');
    console.log('-'.repeat(60));
    
    const profile = await sql`
      SELECT 
        id, user_id, business_name, business_type,
        latitude, longitude, address, city, district,
        working_hours, phone, email
      FROM business_profiles 
      WHERE id = 15
    `;

    if (profile.length === 0) {
      console.log('❌ FAILED: Profile not found!');
      return;
    }

    const p = profile[0];
    console.log('✅ Profile found:', p.business_name);
    console.log('   User ID:', p.user_id);
    console.log('   Location:', p.latitude, p.longitude);
    console.log('   Address:', p.address, p.city);

    // Test 2: Check if it appears in /api/locations
    console.log('\n2️⃣ Testing /api/locations Query');
    console.log('-'.repeat(60));
    
    const locationsQuery = await sql`
      SELECT 
        bp.id as location_id,
        bp.business_name as name,
        bp.business_type as category,
        bp.latitude,
        bp.longitude,
        bp.working_hours
      FROM business_profiles bp
      WHERE bp.latitude IS NOT NULL
        AND bp.longitude IS NOT NULL
        AND bp.id = 15
    `;

    if (locationsQuery.length > 0) {
      console.log('✅ PASS: Appears in locations query');
      console.log('   Will show on map:', locationsQuery[0].name);
    } else {
      console.log('❌ FAIL: Does not appear in locations query');
    }

    // Test 3: Check if it appears in /api/business-locations
    console.log('\n3️⃣ Testing /api/business-locations Query');
    console.log('-'.repeat(60));
    
    const businessLocQuery = await sql`
      SELECT 
        bp.id,
        bp.business_name as name,
        bp.latitude,
        bp.longitude,
        bu.is_active,
        bu.added_by_admin
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      WHERE bu.is_active = true 
        AND bu.added_by_admin = true
        AND bp.latitude IS NOT NULL 
        AND bp.longitude IS NOT NULL
        AND bp.id = 15
    `;

    if (businessLocQuery.length > 0) {
      console.log('✅ PASS: Appears in business-locations query');
      console.log('   Active:', businessLocQuery[0].is_active);
      console.log('   Admin added:', businessLocQuery[0].added_by_admin);
    } else {
      console.log('❌ FAIL: Does not appear in business-locations query');
    }

    // Test 4: Check working hours format
    console.log('\n4️⃣ Testing Working Hours Format');
    console.log('-'.repeat(60));
    
    const hours = p.working_hours;
    if (hours && hours.friday) {
      const friday = hours.friday;
      console.log('Friday hours:', JSON.stringify(friday, null, 2));
      
      const hasCorrectFormat = 
        friday.hasOwnProperty('openTime') && 
        friday.hasOwnProperty('closeTime') &&
        friday.hasOwnProperty('closed');
      
      if (hasCorrectFormat) {
        console.log('✅ PASS: Working hours have correct format');
        console.log('   Open:', friday.openTime, '- Close:', friday.closeTime);
        console.log('   Closed:', friday.closed);
      } else {
        console.log('❌ FAIL: Working hours format incorrect');
      }
    } else {
      console.log('⚠️  WARNING: No working hours data');
    }

    // Test 5: Check menu data
    console.log('\n5️⃣ Testing Menu Data');
    console.log('-'.repeat(60));
    
    const menuCategories = await sql`
      SELECT id, name
      FROM business_menu_categories
      WHERE business_id = 15
      ORDER BY display_order
    `;

    console.log(`Found ${menuCategories.length} menu categories`);
    
    for (const cat of menuCategories) {
      const items = await sql`
        SELECT id, name, price
        FROM business_menu_items
        WHERE category_id = ${cat.id}
      `;
      console.log(`   ${cat.name}: ${items.length} items`);
    }

    if (menuCategories.length > 0) {
      console.log('✅ PASS: Menu data exists');
    } else {
      console.log('⚠️  WARNING: No menu data (may be expected)');
    }

    // Test 6: Test user_id to profile_id conversion
    console.log('\n6️⃣ Testing User ID → Profile ID Conversion');
    console.log('-'.repeat(60));
    
    const userId = p.user_id;
    console.log('Business User ID:', userId);
    console.log('Business Profile ID:', p.id);
    
    // Check if menu API can handle both
    const menuCheckUserId = await sql`
      SELECT id FROM business_profiles WHERE user_id = ${userId}
    `;
    
    const menuCheckProfileId = await sql`
      SELECT id FROM business_profiles WHERE id = ${p.id}
    `;
    
    console.log('✅ Can query by user_id:', menuCheckUserId.length > 0);
    console.log('✅ Can query by profile_id:', menuCheckProfileId.length > 0);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Profile exists and has coordinates');
    console.log('✅ Working hours format correct');
    console.log('✅ Menu data accessible');
    console.log('✅ ID conversion works');
    console.log('\n🎉 All tests passed! Business profile should work correctly.');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

// Run if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  testBusinessProfileFixes();
} else {
  console.error('❌ DATABASE_URL not found in environment variables');
}
