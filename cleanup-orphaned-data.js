const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function cleanupOrphanedData() {
  try {
    console.log('🧹 Cleaning up orphaned menu data...\n');
    
    // Find orphaned menu items
    console.log('🔍 Finding orphaned menu items...');
    const orphanedItems = await sql`
      SELECT mi.id, mi.name, mi.business_id
      FROM business_menu_items mi
      WHERE NOT EXISTS (
        SELECT 1 FROM business_profiles bp WHERE bp.id = mi.business_id
      )
    `;
    console.log(`Found ${orphanedItems.length} orphaned menu items`);
    
    // Find orphaned menu categories
    console.log('\n🔍 Finding orphaned menu categories...');
    const orphanedCategories = await sql`
      SELECT mc.id, mc.name, mc.business_id
      FROM business_menu_categories mc
      WHERE NOT EXISTS (
        SELECT 1 FROM business_profiles bp WHERE bp.id = mc.business_id
      )
    `;
    console.log(`Found ${orphanedCategories.length} orphaned menu categories`);
    orphanedCategories.forEach(c => {
      console.log(`  - Category ${c.id}: ${c.name} (Business ID ${c.business_id} - DOESN'T EXIST)`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  THIS WILL DELETE ORPHANED DATA!');
    console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Delete orphaned menu items first (foreign key constraint)
    if (orphanedItems.length > 0) {
      console.log('\n🗑️  Deleting orphaned menu items...');
      const deletedItems = await sql`
        DELETE FROM business_menu_items
        WHERE NOT EXISTS (
          SELECT 1 FROM business_profiles bp WHERE bp.id = business_menu_items.business_id
        )
        RETURNING id
      `;
      console.log(`✅ Deleted ${deletedItems.length} orphaned menu items`);
    }
    
    // Delete orphaned menu categories
    if (orphanedCategories.length > 0) {
      console.log('\n🗑️  Deleting orphaned menu categories...');
      const deletedCategories = await sql`
        DELETE FROM business_menu_categories
        WHERE NOT EXISTS (
          SELECT 1 FROM business_profiles bp WHERE bp.id = business_menu_categories.business_id
        )
        RETURNING id
      `;
      console.log(`✅ Deleted ${deletedCategories.length} orphaned menu categories`);
    }
    
    // Verify cleanup
    console.log('\n✅ VERIFICATION:');
    const remainingCategories = await sql`SELECT COUNT(*) as count FROM business_menu_categories`;
    const remainingItems = await sql`SELECT COUNT(*) as count FROM business_menu_items`;
    console.log(`  - Remaining menu categories: ${remainingCategories[0].count}`);
    console.log(`  - Remaining menu items: ${remainingItems[0].count}`);
    
    // Show valid data
    console.log('\n📊 VALID DATA (business_id = 15):');
    const validCategories = await sql`
      SELECT id, name FROM business_menu_categories WHERE business_id = 15
    `;
    console.log(`  - Categories: ${validCategories.length}`);
    validCategories.forEach(c => console.log(`    • ${c.name}`));
    
    const validItems = await sql`
      SELECT COUNT(*) as count FROM business_menu_items WHERE business_id = 15
    `;
    console.log(`  - Menu items: ${validItems[0].count}`);
    
    console.log('\n✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

cleanupOrphanedData();
