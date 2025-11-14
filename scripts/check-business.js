require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBusinessProfile() {
  const profiles = await sql`
    SELECT id, user_id, business_name 
    FROM business_profiles 
    WHERE business_name LIKE '%SCE%'
  `;
  
  console.log('Business Profiles:', profiles);
  
  const cameras = await sql`
    SELECT id, business_user_id, camera_name
    FROM business_cameras
    WHERE business_user_id = 20
  `;
  
  console.log('Cameras:', cameras);
}

checkBusinessProfile().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
