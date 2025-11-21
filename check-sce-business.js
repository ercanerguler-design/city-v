// Check SCE INNOVATION business profile data
const { neon } = require('@neondatabase/serverless');

async function checkSCEBusiness() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Checking SCE INNOVATION business profile (ID: 15)...\n');

  try {
    // Get business profile
    const profile = await sql`
      SELECT 
        id, user_id, business_name, business_type, 
        latitude, longitude, 
        working_hours,
        address, city, district,
        phone, email, website,
        created_at, updated_at
      FROM business_profiles 
      WHERE id = 15
    `;

    if (profile.length === 0) {
      console.log('❌ Business profile ID 15 not found!');
      return;
    }

    const biz = profile[0];
    console.log('📋 Business Profile Data:');
    console.log('  ID:', biz.id);
    console.log('  Name:', biz.business_name);
    console.log('  Type:', biz.business_type);
    console.log('  Location:', biz.address, biz.district, biz.city);
    console.log('  Coordinates:', biz.latitude, biz.longitude);
    console.log('  Created:', biz.created_at);
    console.log('  Updated:', biz.updated_at);
    console.log('\n📅 Working Hours:');
    console.log(JSON.stringify(biz.working_hours, null, 2));

    // Check if coordinates exist
    if (!biz.latitude || !biz.longitude) {
      console.log('\n⚠️  WARNING: No coordinates! This will prevent map display.');
    }

    // Parse working hours
    if (biz.working_hours) {
      console.log('\n🕐 Working Hours Analysis:');
      const hours = biz.working_hours;
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      
      days.forEach((day, idx) => {
        if (hours[day]) {
          console.log(`  ${dayNames[idx]} (${day}):`, hours[day].open, '-', hours[day].close, hours[day].closed ? '(KAPALI)' : '(AÇIK)');
        }
      });
    }

    // Check business user
    const user = await sql`
      SELECT id, email, company_name, is_active, membership_type, max_cameras
      FROM business_users
      WHERE id = ${biz.user_id}
    `;

    if (user.length > 0) {
      console.log('\n👤 Business User:');
      console.log('  User ID:', user[0].id);
      console.log('  Email:', user[0].email);
      console.log('  Company:', user[0].company_name);
      console.log('  Active:', user[0].is_active);
      console.log('  Plan:', user[0].membership_type);
      console.log('  Max Cameras:', user[0].max_cameras);
    }

    // Check menu data
    const menuCategories = await sql`
      SELECT id, name, display_order
      FROM business_menu_categories
      WHERE business_id = 15
      ORDER BY display_order
    `;

    console.log(`\n🍽️  Menu Categories: ${menuCategories.length}`);
    for (const cat of menuCategories) {
      const items = await sql`
        SELECT id, name, price
        FROM business_menu_items
        WHERE category_id = ${cat.id}
        ORDER BY display_order
      `;
      console.log(`  ${cat.name}: ${items.length} items`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSCEBusiness();
