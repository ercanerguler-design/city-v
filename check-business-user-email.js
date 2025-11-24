require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUserEmail() {
  try {
    const result = await pool.query(`
      SELECT id, email
      FROM business_users 
      WHERE email = $1
    `, ['2egrub@gmail.com']);
    
    if (result.rowCount === 0) {
      console.log('❌ 2egrub@gmail.com bulunamadı!');
    } else {
      console.log('👤 Kullanıcı bilgileri:', result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    pool.end();
  }
}

checkUserEmail();
