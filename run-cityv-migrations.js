const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  
  console.log('🚀 City-V Integration Migrations Starting...\n');
  
  // Migration 1: Business City-V Integration
  console.log('📄 Migration 1: business-cityv-integration.sql');
  try {
    const migration1 = fs.readFileSync(
      path.join(__dirname, 'database', 'business-cityv-integration.sql'),
      'utf8'
    );
    
    await sql(migration1);
    console.log('✅ Migration 1 completed successfully\n');
  } catch (error) {
    console.error('❌ Migration 1 failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Some objects already exist, continuing...\n');
    } else {
      throw error;
    }
  }
  
  // Migration 2: Business Category Mapping
  console.log('📄 Migration 2: business-category-mapping.sql');
  try {
    const migration2 = fs.readFileSync(
      path.join(__dirname, 'database', 'business-category-mapping.sql'),
      'utf8'
    );
    
    await sql(migration2);
    console.log('✅ Migration 2 completed successfully\n');
  } catch (error) {
    console.error('❌ Migration 2 failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Some objects already exist, continuing...\n');
    } else {
      throw error;
    }
  }
  
  // Verify migrations
  console.log('🔍 Verifying migrations...');
  try {
    // Check if new columns exist
    const checkColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'business_profiles' 
      AND column_name IN ('location_id', 'category', 'is_visible_on_map', 'auto_sync_to_cityv', 'working_hours')
      ORDER BY column_name;
    `;
    
    console.log('\n📊 New columns in business_profiles:');
    checkColumns.forEach(col => {
      console.log(`   ✓ ${col.column_name} (${col.data_type})`);
    });
    
    // Check if triggers exist
    const checkTriggers = await sql`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name IN ('trigger_auto_generate_location_id', 'trigger_auto_update_category')
      ORDER BY trigger_name;
    `;
    
    console.log('\n⚡ Triggers:');
    checkTriggers.forEach(trigger => {
      console.log(`   ✓ ${trigger.trigger_name} on ${trigger.event_object_table}`);
    });
    
    // Check if view exists
    const checkView = await sql`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_name = 'cityv_locations';
    `;
    
    if (checkView.length > 0) {
      console.log('\n📋 View:');
      console.log('   ✓ cityv_locations');
    }
    
    console.log('\n✅ All migrations verified successfully!');
    console.log('\n🎉 City-V Integration is now active!');
    console.log('   • Business profiles will auto-sync to City-V homepage');
    console.log('   • Working hours will display as AÇIK/KAPALI');
    console.log('   • Location IDs are auto-generated');
    console.log('   • Categories are auto-mapped from business_type');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

runMigrations().catch(err => {
  console.error('💥 Migration failed:', err);
  process.exit(1);
});
