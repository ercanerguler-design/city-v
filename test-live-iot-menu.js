const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testLiveIoTAPI() {
  try {
    console.log('🔍 Testing Live IoT API query...\n');
    
    // live-iot-data API'sinin yaptığı query'yi simüle et
    const result = await sql`
      SELECT 
        bp.id as business_id,
        bp.business_name,
        bp.business_type,
        bp.address,
        bu.id as user_id,
        bu.is_active as business_active,
        
        bc.id as camera_id,
        bc.camera_name,
        bc.is_active as camera_active
        
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      LEFT JOIN business_cameras bc ON bu.id = bc.business_user_id AND bc.is_active = true
      
      WHERE bu.is_active = true
        AND bc.id IS NOT NULL
      
      ORDER BY bc.created_at DESC
    `;
    
    console.log(`✅ Found ${result.length} active business IoT devices\n`);
    
    if (result.length === 0) {
      console.log('⚠️ No IoT devices found!');
      return;
    }
    
    // Business'leri grupla
    const businessMap = new Map();
    
    for (const row of result) {
      const businessId = row.business_id;
      
      if (!businessMap.has(businessId)) {
        // Menu kategorilerini çek
        const menuResult = await sql`
          SELECT COUNT(*) as category_count 
          FROM business_menu_categories 
          WHERE business_id = ${businessId} AND is_active = true
        `;
        
        const categoryCount = parseInt(menuResult[0]?.category_count || '0');
        
        businessMap.set(businessId, {
          id: businessId,
          business_profile_id: businessId,
          name: row.business_name,
          type: row.business_type,
          address: row.address,
          isActive: row.business_active,
          hasMenu: categoryCount > 0,
          menuCategoryCount: categoryCount,
          cameras: []
        });
      }
      
      const business = businessMap.get(businessId);
      
      if (row.camera_id) {
        business.cameras.push({
          id: row.camera_id,
          name: row.camera_name,
          isActive: row.camera_active
        });
      }
    }
    
    const businesses = Array.from(businessMap.values());
    
    console.log('📊 Business IoT Data:');
    console.log('─'.repeat(80));
    
    businesses.forEach(b => {
      console.log(`\n🏪 ${b.name}`);
      console.log(`   Profile ID: ${b.business_profile_id}`);
      console.log(`   Cameras: ${b.cameras.length}`);
      console.log(`   Has Menu: ${b.hasMenu ? '✅ YES' : '❌ NO'}`);
      console.log(`   Menu Categories: ${b.menuCategoryCount}`);
      console.log(`   Should Show Button: ${b.business_profile_id && (b.hasMenu || b.menuCategoryCount > 0) ? '✅ YES' : '❌ NO'}`);
    });
    
    console.log('\n\n📋 API Response Preview:');
    console.log(JSON.stringify({
      success: true,
      businesses: businesses,
      count: businesses.length
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testLiveIoTAPI();
