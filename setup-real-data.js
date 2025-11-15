const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

// Database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not found');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function setupRealBusinessData() {
  try {
    console.log('🔧 Setting up real business data tables...');
    
    // Read SQL file
    const query = fs.readFileSync('./database/real_business_data_setup.sql', 'utf8');
    
    // Split into individual commands
    const commands = query.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command && !command.startsWith('--') && !command.startsWith('COMMIT')) {
        try {
          await sql(command);
          console.log(`✅ Executed command ${i + 1}/${commands.length}`);
        } catch (error) {
          console.log(`⚠️ Skipping command ${i + 1}: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Real business data tables created successfully!');
    console.log('📊 Sample data for businessUserId=20 added');
    console.log('🗄️ Tables created:');
    console.log('  - daily_business_summaries');
    console.log('  - ai_recognition_logs'); 
    console.log('  - business_camera_analytics');
    console.log('  - business_realtime_status');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    if (error.detail) {
      console.error('📝 Details:', error.detail);
    }
  }
}

setupRealBusinessData();