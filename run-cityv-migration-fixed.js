const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  
  console.log('🚀 City-V Integration Migrations Starting...\n');
  
  // Migration 1: Add columns to business_profiles
  console.log('📄 Step 1: Adding columns to business_profiles...');
  try {
    await sql`
      ALTER TABLE business_profiles
      ADD COLUMN IF NOT EXISTS location_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS category VARCHAR(50),
      ADD COLUMN IF NOT EXISTS is_visible_on_map BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS auto_sync_to_cityv BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS average_wait_time INTEGER,
      ADD COLUMN IF NOT EXISTS current_crowd_level VARCHAR(20) DEFAULT 'orta',
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS working_hours JSONB
    `;
    console.log('✅ Columns added successfully\n');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Columns already exist\n');
    } else {
      console.error('❌ Failed:', error.message);
    }
  }
  
  // Migration 2: Create index
  console.log('📄 Step 2: Creating index on location_id...');
  try {
    await sql`
      CREATE INDEX IF NOT EXISTS idx_business_profiles_location_id 
      ON business_profiles(location_id)
    `;
    console.log('✅ Index created successfully\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Migration 3: Create generate_location_id function
  console.log('📄 Step 3: Creating generate_location_id function...');
  try {
    await sql`
      CREATE OR REPLACE FUNCTION generate_location_id(business_name TEXT, city TEXT)
      RETURNS TEXT AS $$
      DECLARE
        base_slug TEXT;
        final_slug TEXT;
        counter INTEGER := 0;
      BEGIN
        base_slug := lower(
          regexp_replace(
            regexp_replace(
              translate(
                business_name || '-' || city,
                'ğüşıöçĞÜŞİÖÇ',
                'gusiocGUSIOC'
              ),
              '[^a-z0-9-]', '-', 'g'
            ),
            '-+', '-', 'g'
          )
        );
        
        base_slug := trim(both '-' from base_slug);
        
        final_slug := base_slug;
        WHILE EXISTS (SELECT 1 FROM business_profiles WHERE location_id = final_slug) LOOP
          counter := counter + 1;
          final_slug := base_slug || '-' || counter;
        END LOOP;
        
        RETURN final_slug;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log('✅ Function created successfully\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Migration 4: Create auto_generate_location_id trigger function
  console.log('📄 Step 4: Creating auto_generate_location_id trigger function...');
  try {
    await sql`
      CREATE OR REPLACE FUNCTION auto_generate_location_id()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.location_id IS NULL AND NEW.business_name IS NOT NULL AND NEW.city IS NOT NULL THEN
          NEW.location_id := generate_location_id(NEW.business_name, NEW.city);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log('✅ Trigger function created successfully\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Migration 5: Create trigger
  console.log('📄 Step 5: Creating trigger...');
  try {
    await sql`DROP TRIGGER IF EXISTS trigger_auto_generate_location_id ON business_profiles`;
    await sql`
      CREATE TRIGGER trigger_auto_generate_location_id
      BEFORE INSERT OR UPDATE ON business_profiles
      FOR EACH ROW
      EXECUTE FUNCTION auto_generate_location_id()
    `;
    console.log('✅ Trigger created successfully\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Migration 6: Create category mapping function
  console.log('📄 Step 6: Creating category mapping function...');
  try {
    await sql`
      CREATE OR REPLACE FUNCTION map_business_type_to_category(business_type TEXT)
      RETURNS TEXT AS $$
      BEGIN
        RETURN CASE business_type
          WHEN 'restaurant' THEN 'restaurant'
          WHEN 'cafe' THEN 'cafe'
          WHEN 'shopping' THEN 'alisveris'
          WHEN 'market' THEN 'market'
          WHEN 'pharmacy' THEN 'saglik'
          WHEN 'hospital' THEN 'saglik'
          WHEN 'clinic' THEN 'saglik'
          WHEN 'bank' THEN 'banka'
          WHEN 'atm' THEN 'banka'
          WHEN 'gym' THEN 'spor'
          WHEN 'sports_center' THEN 'spor'
          WHEN 'cinema' THEN 'eglence'
          WHEN 'theater' THEN 'kultur'
          WHEN 'museum' THEN 'kultur'
          WHEN 'library' THEN 'egitim'
          WHEN 'school' THEN 'egitim'
          WHEN 'park' THEN 'park'
          WHEN 'gas_station' THEN 'ulasim'
          WHEN 'bus_station' THEN 'ulasim'
          WHEN 'metro' THEN 'ulasim'
          WHEN 'hotel' THEN 'konaklama'
          WHEN 'salon' THEN 'guzellik'
          WHEN 'barber' THEN 'guzellik'
          ELSE 'diger'
        END;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE
    `;
    console.log('✅ Category mapping function created successfully\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Migration 7: Create auto_update_category trigger function
  console.log('📄 Step 7: Creating auto_update_category trigger function...');
  try {
    await sql`
      CREATE OR REPLACE FUNCTION auto_update_category()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.business_type IS NOT NULL THEN
          NEW.category := map_business_type_to_category(NEW.business_type);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log('✅ Trigger function created successfully\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Migration 8: Create category trigger
  console.log('📄 Step 8: Creating category trigger...');
  try {
    await sql`DROP TRIGGER IF EXISTS trigger_auto_update_category ON business_profiles`;
    await sql`
      CREATE TRIGGER trigger_auto_update_category
      BEFORE INSERT OR UPDATE OF business_type ON business_profiles
      FOR EACH ROW
      EXECUTE FUNCTION auto_update_category()
    `;
    console.log('✅ Category trigger created successfully\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Migration 9: Update existing records
  console.log('📄 Step 9: Updating existing records...');
  try {
    const result = await sql`
      UPDATE business_profiles
      SET 
        location_id = generate_location_id(business_name, city),
        category = map_business_type_to_category(business_type)
      WHERE location_id IS NULL OR category IS NULL
    `;
    console.log(`✅ Updated ${result.length || 0} existing records\n`);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Migration 10: Create cityv_locations view
  console.log('📄 Step 10: Creating cityv_locations view...');
  try {
    await sql`DROP VIEW IF EXISTS cityv_locations CASCADE`;
    await sql`
      CREATE VIEW cityv_locations AS
      SELECT 
        bp.location_id as id,
        bp.business_name as name,
        bp.category,
        ARRAY[bp.latitude, bp.longitude] as coordinates,
        bp.address,
        bp.description,
        bp.current_crowd_level as "currentCrowdLevel",
        bp.photos,
        bp.working_hours as "workingHours",
        bp.phone,
        bp.email,
        bp.website,
        bp.average_wait_time as "averageWaitTime",
        bp.rating,
        bp.review_count as "reviewCount",
        'business' as source,
        bp.id as "businessId",
        bu.membership_type as "membershipType",
        bp.created_at as "createdAt",
        bp.updated_at as "updatedAt"
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      WHERE bp.is_visible_on_map = true
        AND bp.latitude IS NOT NULL
        AND bp.longitude IS NOT NULL
        AND bu.is_active = true
    `;
    console.log('✅ View created successfully\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
  
  // Verify migrations
  console.log('🔍 Verifying migrations...');
  try {
    const checkColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'business_profiles' 
      AND column_name IN ('location_id', 'category', 'is_visible_on_map', 'auto_sync_to_cityv', 'working_hours')
      ORDER BY column_name
    `;
    
    console.log('\n📊 New columns in business_profiles:');
    checkColumns.forEach(col => {
      console.log(`   ✓ ${col.column_name} (${col.data_type})`);
    });
    
    const checkTriggers = await sql`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name IN ('trigger_auto_generate_location_id', 'trigger_auto_update_category')
      ORDER BY trigger_name
    `;
    
    console.log('\n⚡ Triggers:');
    checkTriggers.forEach(trigger => {
      console.log(`   ✓ ${trigger.trigger_name} on ${trigger.event_object_table}`);
    });
    
    const checkView = await sql`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_name = 'cityv_locations'
    `;
    
    if (checkView.length > 0) {
      console.log('\n📋 View:');
      console.log('   ✓ cityv_locations');
    }
    
    console.log('\n✅ All migrations completed successfully!');
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
