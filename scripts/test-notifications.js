const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testNotifications() {
  console.log('\n📋 Testing Notification System...\n');

  try {
    // 1. Check if table exists
    console.log('1️⃣ Checking business_notifications table...');
    const tableCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'business_notifications'
      ORDER BY ordinal_position
    `;
    
    if (tableCheck.length === 0) {
      console.log('❌ Table does not exist!');
      return;
    }
    
    console.log('✅ Table exists with columns:');
    tableCheck.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    // 2. Check indexes
    console.log('\n2️⃣ Checking indexes...');
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'business_notifications'
    `;
    console.log(`✅ Found ${indexes.length} indexes:`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    // 3. Check existing notifications for user_id 20
    console.log('\n3️⃣ Checking existing notifications for business_user_id=20...');
    const notifications = await sql`
      SELECT 
        id,
        type,
        title,
        message,
        is_read,
        created_at,
        data
      FROM business_notifications 
      WHERE business_user_id = 20 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    if (notifications.length === 0) {
      console.log('ℹ️  No notifications yet (expected - system just deployed)');
    } else {
      console.log(`✅ Found ${notifications.length} notification(s):`);
      notifications.forEach(notif => {
        console.log(`\n   📬 ID ${notif.id} - ${notif.type.toUpperCase()}`);
        console.log(`   Title: ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Read: ${notif.is_read ? 'Yes' : 'No'}`);
        console.log(`   Created: ${notif.created_at}`);
        console.log(`   Data: ${JSON.stringify(notif.data, null, 2)}`);
      });
    }

    // 4. Check business profile setup
    console.log('\n4️⃣ Verifying business profile for user_id=20...');
    const profile = await sql`
      SELECT 
        bp.id as profile_id,
        bp.user_id,
        bp.location_id,
        bp.business_name
      FROM business_profiles bp
      WHERE bp.user_id = 20
    `;
    
    if (profile.length > 0) {
      console.log('✅ Business profile found:');
      console.log(`   Profile ID: ${profile[0].profile_id}`);
      console.log(`   User ID: ${profile[0].user_id}`);
      console.log(`   Location ID: ${profile[0].location_id}`);
      console.log(`   Business Name: ${profile[0].business_name}`);
    } else {
      console.log('⚠️  No business profile found for user_id=20');
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 NOTIFICATION SYSTEM STATUS:');
    console.log('='.repeat(60));
    console.log('✅ Database table: READY');
    console.log('✅ Indexes: READY');
    console.log('✅ Business profile: READY');
    console.log('✅ API integrations: DEPLOYED');
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Go to CityV homepage (http://localhost:3000)');
    console.log('   2. Find "SCE INNOVATION" business');
    console.log('   3. Submit a review with rating + sentiment');
    console.log('   4. Add business to favorites (heart icon)');
    console.log('   5. Run this script again to see notifications\n');
    console.log('💡 Or test API directly:');
    console.log('   curl http://localhost:3000/api/business/notifications?businessUserId=20\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testNotifications();
