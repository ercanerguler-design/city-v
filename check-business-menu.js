const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessMenu() {
  try {
    console.log('🔍 Checking business menu categories...\n');
    
    // Business profiles ile menu kategorilerini kontrol et
    const result = await sql`
      SELECT 
        bp.id, 
        bp.business_name, 
        bp.user_id,
        bu.company_name,
        bu.is_active as business_active,
        COUNT(bmc.id) as category_count,
        COUNT(CASE WHEN bmc.is_active = true THEN 1 END) as active_category_count
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      LEFT JOIN business_menu_categories bmc ON bmc.business_id = bp.id
      WHERE bu.is_active = true
      GROUP BY bp.id, bp.business_name, bp.user_id, bu.company_name, bu.is_active
      ORDER BY category_count DESC
    `;
    
    console.log('📊 Business Menu Status:');
    console.log('─'.repeat(80));
    
    result.forEach(r => {
      const status = r.active_category_count > 0 ? '✅' : '❌';
      console.log(`${status} ${r.business_name || r.company_name}`);
      console.log(`   Profile ID: ${r.id}, User ID: ${r.user_id}`);
      console.log(`   Total Categories: ${r.category_count}, Active: ${r.active_category_count}`);
      console.log('');
    });
    
    // Menu items sayısını da kontrol et
    console.log('\n🍽️ Checking menu items...\n');
    
    const itemsResult = await sql`
      SELECT 
        bp.id as profile_id,
        bp.business_name,
        bmc.id as category_id,
        bmc.name as category_name,
        bmc.is_active as category_active,
        COUNT(bmi.id) as item_count
      FROM business_profiles bp
      INNER JOIN business_menu_categories bmc ON bmc.business_id = bp.id
      LEFT JOIN business_menu_items bmi ON bmi.category_id = bmc.id
      GROUP BY bp.id, bp.business_name, bmc.id, bmc.name, bmc.is_active
      ORDER BY bp.business_name, bmc.name
    `;
    
    console.log('📋 Menu Items by Category:');
    console.log('─'.repeat(80));
    
    let currentBusiness = null;
    itemsResult.forEach(r => {
      if (currentBusiness !== r.business_name) {
        currentBusiness = r.business_name;
        console.log(`\n🏪 ${r.business_name} (Profile ID: ${r.profile_id})`);
      }
      const status = r.category_active ? '✅' : '❌';
      console.log(`   ${status} ${r.category_name}: ${r.item_count} items`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBusinessMenu();
