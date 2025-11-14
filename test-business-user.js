// Test business user oluşturma ve kontrol
const { query } = require('./lib/db');
const bcrypt = require('bcryptjs');

async function testBusinessUser() {
  try {
    console.log('🔍 Checking business users...\n');

    // Tüm business users'ları listele
    const users = await query('SELECT * FROM business_users ORDER BY created_at DESC LIMIT 5');
    console.log('📋 Business Users:', users.rows.length);
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}, Active: ${user.is_active}, Admin Added: ${user.added_by_admin})`);
    });

    console.log('\n🔍 Checking subscriptions...\n');
    const subs = await query('SELECT * FROM business_subscriptions ORDER BY created_at DESC LIMIT 5');
    console.log('📋 Subscriptions:', subs.rows.length);
    subs.rows.forEach(sub => {
      console.log(`  - User ID: ${sub.user_id}, Plan: ${sub.plan_type}, Active: ${sub.is_active}`);
    });

    console.log('\n🔍 Checking profiles...\n');
    const profiles = await query('SELECT * FROM business_profiles ORDER BY created_at DESC LIMIT 5');
    console.log('📋 Profiles:', profiles.rows.length);
    profiles.rows.forEach(profile => {
      console.log(`  - ${profile.business_name} (User ID: ${profile.user_id})`);
    });

    // Eğer kullanıcı yoksa test kullanıcısı oluştur
    if (users.rows.length === 0) {
      console.log('\n🆕 Creating test business user...\n');
      
      const passwordHash = await bcrypt.hash('test123', 10);
      const licenseKey = `CITYV-PREMIUM-${Date.now()}-TEST`;

      await query('BEGIN');

      const userResult = await query(
        `INSERT INTO business_users (
          email, password_hash, full_name, phone, role, added_by_admin, is_active, email_verified
        ) VALUES ($1, $2, $3, $4, 'business_user', true, true, true)
        RETURNING id`,
        ['test@business.com', passwordHash, 'Test İşletmesi', '+905551234567']
      );

      const userId = userResult.rows[0].id;
      console.log('✅ User created:', userId);

      await query(
        `INSERT INTO business_subscriptions (
          user_id, plan_type, max_cameras, monthly_price,
          start_date, end_date, is_active, license_key
        ) VALUES ($1, 'premium', 10, 249.00, NOW(), NOW() + INTERVAL '1 year', true, $2)`,
        [userId, licenseKey]
      );
      console.log('✅ Subscription created');

      await query(
        `INSERT INTO business_profiles (
          user_id, business_name, business_type, latitude, longitude, address
        ) VALUES ($1, 'Test İşletmesi', 'restaurant', 39.9334, 32.8597, 'Ankara Test Mahallesi')`,
        [userId]
      );
      console.log('✅ Profile created');

      await query('COMMIT');

      console.log('\n✅ Test user created successfully!');
      console.log('Email: test@business.com');
      console.log('Password: test123');
      console.log('License:', licenseKey);
    }

    console.log('\n✅ Test completed!\n');

  } catch (error) {
    await query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testBusinessUser();
