const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function createBackupTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Backup tabloları oluşturuluyor...');
    console.log('📦 Database:', process.env.DATABASE_URL ? 'Connected' : 'No connection string');

    // SQL dosyasını oku
    const sqlFile = path.join(__dirname, 'createBackupTables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // SQL komut bloklarını ayır (CREATE TABLE, CREATE INDEX, CREATE FUNCTION)
    const commands = [];
    let currentCommand = '';
    let inFunction = false;
    
    for (const line of sql.split('\n')) {
      const trimmed = line.trim();
      
      // Yorum satırlarını atla
      if (trimmed.startsWith('--')) continue;
      
      // Function başlangıcı
      if (trimmed.includes('CREATE OR REPLACE FUNCTION')) {
        inFunction = true;
      }
      
      currentCommand += line + '\n';
      
      // Function bitişi
      if (inFunction && trimmed.includes('$$ LANGUAGE')) {
        inFunction = false;
        commands.push(currentCommand.trim());
        currentCommand = '';
      }
      // Normal komut bitişi (;)
      else if (!inFunction && trimmed.endsWith(';')) {
        commands.push(currentCommand.trim());
        currentCommand = '';
      }
    }
    
    // Komutları çalıştır
    for (const command of commands) {
      if (command.length > 0) {
        const preview = command.replace(/\s+/g, ' ').substring(0, 60);
        console.log(`📝 ${preview}...`);
        await pool.query(command);
      }
    }

    console.log('✅ Backup tabloları başarıyla oluşturuldu!');
    console.log('📋 Oluşturulan tablolar:');
    console.log('   - business_profiles_backup');
    console.log('   - business_cameras_backup');
    console.log('   - business_campaigns_backup');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup tabloları oluşturulurken hata:', error);
    await pool.end();
    process.exit(1);
  }
}

createBackupTables();
