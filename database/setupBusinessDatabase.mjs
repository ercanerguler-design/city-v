// Business Membership System - Database Setup Script
// Bu script Vercel Postgres'e business tablolarını oluşturur

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local'i yükle
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  console.log('🚀 Business Membership System - Database Setup Başlatılıyor...\n');
  
  try {
    const client = await pool.connect();
    console.log('✅ Database bağlantısı başarılı!\n');

    // SQL dosyasını oku
    const sqlFile = path.join(process.cwd(), 'database', 'full-business-setup.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log('📋 SQL script çalıştırılıyor...\n');
    
    // SQL'i çalıştır
    await client.query(sql);
    
    console.log('\n✅ Tüm tablolar başarıyla oluşturuldu!\n');
    
    // Oluşturulan tabloları kontrol et
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'business_%'
      ORDER BY table_name
    `);
    
    console.log('📊 Oluşturulan Business tabloları:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    client.release();
    
    console.log('\n🎉 Database setup tamamlandı!\n');
    console.log('📝 Şimdi admin panelde "Yeni Üye Ekle" butonunu kullanabilirsiniz.\n');
    
  } catch (error) {
    console.error('\n❌ Hata oluştu:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);
