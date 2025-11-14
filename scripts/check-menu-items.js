require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkMenuItems() {
  try {
    // Business profile ID for user 20
    const profiles = await sql`
      SELECT id, business_name, user_id 
      FROM business_profiles 
      WHERE user_id = 20
    `;
    
    console.log('📋 Business Profiles:', profiles);
    
    if (profiles.length === 0) {
      console.log('❌ No business profile found for user 20');
      return;
    }
    
    const businessId = profiles[0].id;
    console.log(`\n🏢 Checking menu items for business ID: ${businessId}`);
    
    // Check menu categories
    const categories = await sql`
      SELECT * FROM business_menu_categories 
      WHERE business_id = ${businessId}
    `;
    
    console.log(`\n📂 Categories: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id})`);
    });
    
    // Check menu items
    const items = await sql`
      SELECT mi.*, mc.name as category_name
      FROM business_menu_items mi
      JOIN business_menu_categories mc ON mi.category_id = mc.id
      WHERE mc.business_id = ${businessId}
    `;
    
    console.log(`\n🍽️  Menu Items: ${items.length}`);
    items.forEach(item => {
      console.log(`  - ${item.name} (${item.category_name}) - ₺${item.price}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMenuItems();
