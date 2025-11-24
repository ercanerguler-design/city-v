require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkCamera60Business() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment!');
    return;
  }
  
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Camera ID 60 Business Bağlantısı Kontrolü\n');
    
    // Camera 60 detayları
    const cameraResult = await sql`
      SELECT 
        bc.*,
        bu.email,
        bu.is_active as user_active,
        bp.business_name,
        bp.business_type
      FROM business_cameras bc
      LEFT JOIN business_users bu ON bc.business_user_id = bu.id
      LEFT JOIN business_profiles bp ON bu.id = bp.user_id
      WHERE bc.id = 60
    `;
    
    if (cameraResult.length === 0) {
      console.log('❌ Camera ID 60 bulunamadı!');
      return;
    }
    
    const camera = cameraResult[0];
    console.log('📸 Camera ID 60 Detayları:');
    console.log('  - device_id:', camera.device_id);
    console.log('  - business_user_id:', camera.business_user_id);
    console.log('  - is_active:', camera.is_active);
    console.log('  - Business Email:', camera.email);
    console.log('  - User Active:', camera.user_active);
    console.log('  - Business Name:', camera.business_name);
    console.log('  - Business Type:', camera.business_type);
    console.log();
    
    // Sidebar API'nin kullandığı query'yi test et
    const sidebarQueryResult = await sql`
      SELECT 
        bp.business_name,
        bp.business_type,
        bu.email,
        bu.is_active,
        bc.id as camera_id,
        bc.device_id,
        bc.is_active as camera_active
      FROM business_profiles bp
      INNER JOIN business_users bu ON bp.user_id = bu.id
      LEFT JOIN business_cameras bc ON bu.id = bc.business_user_id AND bc.is_active = true
      WHERE bu.is_active = true AND bc.id IS NOT NULL AND bc.id = 60
    `;
    
    console.log('🔍 Sidebar API Query Test (Camera ID 60):');
    if (sidebarQueryResult.length > 0) {
      console.log('✅ Sidebar query\'den döndü:', JSON.stringify(sidebarQueryResult[0], null, 2));
    } else {
      console.log('❌ Sidebar query\'den sonuç gelmedi!');
      console.log('\n🔧 Muhtemel Sebepler:');
      console.log('  1. bu.is_active = false olabilir');
      console.log('  2. bc.is_active = false olabilir');
      console.log('  3. business_profile kaydı eksik olabilir');
      console.log('  4. INNER JOIN business_users filtreleme yapıyor olabilir');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

checkCamera60Business();
