const { neon } = require('@neondatabase/serverless');

async function fixBusinessProfile() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔧 SCE INNOVATION business profileni duzeltiyoruz...');
    
    // Ankara merkezine yakın koordinatlar (örnek: ODTÜ yakını)
    const lat = 39.894;
    const lng = 32.781;
    
    const result = await sql`
      UPDATE business_profiles 
      SET 
        latitude = ${lat},
        longitude = ${lng},
        is_visible_on_map = true,
        category = 'technology'
      WHERE id = 15
      RETURNING *
    `;
    
    console.log('✅ Business profile guncellendi:');
    console.log('  - ID:', result[0].id);
    console.log('  - Isim:', result[0].business_name);
    console.log('  - Koordinatlar:', result[0].latitude, result[0].longitude);
    console.log('  - Map gorunur:', result[0].is_visible_on_map);
    console.log('  - Auto sync:', result[0].auto_sync_to_cityv);
    console.log('  - Kategori:', result[0].category);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

fixBusinessProfile();