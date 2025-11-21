// Test script to verify admin business member creation saves to database
const { neon } = require('@neondatabase/serverless');

async function testAdminMemberCreation() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Checking admin-created business members...\n');

  try {
    // Check business_users created by admin
    const adminMembers = await sql`
      SELECT 
        id,
        email,
        full_name,
        company_name,
        added_by_admin,
        is_active,
        membership_type,
        membership_expiry_date,
        max_cameras,
        license_key,
        created_at
      FROM business_users
      WHERE added_by_admin = true
      ORDER BY created_at DESC
    `;

    console.log(`📊 Found ${adminMembers.length} admin-created business members:\n`);
    
    if (adminMembers.length === 0) {
      console.log('⚠️  No business members created by admin yet');
      console.log('💡 This is normal if admin panel hasn\'t been used to add members\n');
      return;
    }

    for (const member of adminMembers) {
      console.log(`👤 ${member.full_name} (${member.email})`);
      console.log(`   Company: ${member.company_name}`);
      console.log(`   Plan: ${member.membership_type} (${member.max_cameras} cameras)`);
      console.log(`   License: ${member.license_key}`);
      console.log(`   Status: ${member.is_active ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   Expiry: ${member.membership_expiry_date || 'No expiry'}`);
      console.log(`   Added: ${new Date(member.created_at).toLocaleString('tr-TR')}`);

      // Check if they have a profile
      const profiles = await sql`
        SELECT id, business_name, address, city, latitude, longitude
        FROM business_profiles
        WHERE user_id = ${member.id}
      `;

      if (profiles.length > 0) {
        console.log(`   Profile: ✅ ${profiles[0].business_name} (ID: ${profiles[0].id})`);
        console.log(`   Location: ${profiles[0].city || 'Not set'} - ${profiles[0].address || 'Not set'}`);
      } else {
        console.log(`   Profile: ⚠️  No profile found`);
      }

      // Check subscription
      const subscriptions = await sql`
        SELECT plan_type, start_date, end_date, monthly_price, is_active
        FROM business_subscriptions
        WHERE user_id = ${member.id}
      `;

      if (subscriptions.length > 0) {
        const sub = subscriptions[0];
        console.log(`   Subscription: ✅ ${sub.plan_type} (${sub.monthly_price}₺/month)`);
        console.log(`   Period: ${new Date(sub.start_date).toLocaleDateString('tr-TR')} - ${new Date(sub.end_date).toLocaleDateString('tr-TR')}`);
        console.log(`   Status: ${sub.is_active ? 'Active' : 'Inactive'}`);
      } else {
        console.log(`   Subscription: ⚠️  No subscription found`);
      }

      console.log('');
    }

    // Summary
    console.log('📈 Summary:');
    console.log(`   Total admin members: ${adminMembers.length}`);
    console.log(`   Active members: ${adminMembers.filter(m => m.is_active).length}`);
    console.log(`   Premium plans: ${adminMembers.filter(m => m.membership_type === 'premium').length}`);
    console.log(`   Enterprise plans: ${adminMembers.filter(m => m.membership_type === 'enterprise').length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  testAdminMemberCreation();
} else {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('💡 Make sure to load .env.local or set DATABASE_URL');
}
