import { Pool } from 'pg';

// PostgreSQL bağlantı havuzu
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});

// Query wrapper fonksiyonu
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      console.log('📋 Executed query', { text, duration, rows: result.rowCount });
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

// Pool'u kapatmak için utility fonksiyon
export async function closePool() {
  await pool.end();
}

export default pool;