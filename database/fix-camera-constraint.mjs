import postgres from 'postgres';

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ POSTGRES_URL bulunamadı!');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

(async () => {
  try {
    await sql`ALTER TABLE business_cameras DROP CONSTRAINT IF EXISTS business_cameras_business_user_id_ip_address_port_key`;
    console.log('✅ UNIQUE constraint silindi - aynı IP tekrar eklenebilir!');
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await sql.end();
  }
})();
