const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkNewBusiness() {
  try {
    console.log('🔍 Checking new business (ID: 25)...\n');
    
    // Business user bilgisi
    const businessUser = await sql`
      SELECT id, email, company_name, is_active, created_at
      FROM business_users
      WHERE id = 25
    `;
    
    if (businessUser.length === 0) {
      console.log('❌ Business user bulunamadı!');
      return;
    }
    
    console.log('✅ Business User:', {
      id: businessUser[0].id,
      email: businessUser[0].email,
      company: businessUser[0].company_name,
      active: businessUser[0].is_active,
      created: businessUser[0].created_at
    });
    
    // Business profile
    const profile = await sql`
      SELECT id, business_name, business_type, address
      FROM business_profiles
      WHERE user_id = 25
    `;
    
    console.log('\n📋 Business Profile:', profile.length > 0 ? {
      id: profile[0].id,
      name: profile[0].business_name,
      type: profile[0].business_type,
      address: profile[0].address
    } : '❌ Yok');
    
    // Kameralar
    const cameras = await sql`
      SELECT id, camera_name, device_id, ip_address, is_active, ai_enabled, created_at
      FROM business_cameras
      WHERE business_user_id = 25
      ORDER BY created_at DESC
    `;
    
    console.log('\n📹 Cameras:', cameras.length);
    cameras.forEach((cam, i) => {
      console.log(`  ${i + 1}. ${cam.camera_name}`);
      console.log(`     Device ID: ${cam.device_id}`);
      console.log(`     Active: ${cam.is_active}, AI: ${cam.ai_enabled}`);
      console.log(`     Created: ${cam.created_at}`);
    });
    
    // IoT crowd analysis verileri
    if (cameras.length > 0) {
      console.log('\n📊 IoT Crowd Analysis Data:');
      
      for (const cam of cameras) {
        const analysis = await sql`
          SELECT 
            people_count, 
            crowd_density, 
            current_occupancy,
            analysis_timestamp,
            created_at
          FROM iot_crowd_analysis
          WHERE device_id = ${cam.device_id}
          ORDER BY analysis_timestamp DESC
          LIMIT 5
        `;
        
        console.log(`\n  Camera: ${cam.camera_name} (Device: ${cam.device_id})`);
        console.log(`  Records: ${analysis.length}`);
        
        if (analysis.length > 0) {
          console.log('  Latest 3 records:');
          analysis.slice(0, 3).forEach((a, i) => {
            console.log(`    ${i + 1}. People: ${a.people_count}, Density: ${a.crowd_density}, Time: ${a.analysis_timestamp}`);
          });
        } else {
          console.log('  ❌ No analysis data found for this camera!');
        }
      }
    }
    
    // Daily summaries
    console.log('\n📈 Daily Business Summaries:');
    const summaries = await sql`
      SELECT 
        summary_date,
        total_visitors,
        total_entries,
        avg_occupancy,
        active_cameras_count,
        total_analysis_records,
        created_at
      FROM daily_business_summaries
      WHERE business_user_id = 25
      ORDER BY summary_date DESC
      LIMIT 7
    `;
    
    if (summaries.length > 0) {
      console.log(`  Found ${summaries.length} daily summaries:`);
      summaries.forEach(s => {
        console.log(`    ${s.summary_date}: ${s.total_visitors} visitors, ${s.active_cameras_count} cameras, ${s.total_analysis_records} records`);
      });
    } else {
      console.log('  ❌ No daily summaries found!');
      console.log('  ℹ️  Summaries are created by scheduled task or manual trigger');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkNewBusiness();
