// Setup location_reviews and business_interactions tables
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

const sql = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL || '', {
  ssl: 'require'
});

async function setupTables() {
  try {
    console.log('📦 Setting up database tables...');

    // 1. Location Reviews Table
    console.log('\n1️⃣ Creating location_reviews table...');
    const reviewsSQL = fs.readFileSync(
      path.join(process.cwd(), 'database', 'location-reviews.sql'),
      'utf-8'
    );
    await sql.unsafe(reviewsSQL);
    console.log('✅ location_reviews table ready');

    // 2. Business Interactions Table
    console.log('\n2️⃣ Creating business_interactions table...');
    const interactionsSQL = fs.readFileSync(
      path.join(process.cwd(), 'database', 'business-interactions.sql'),
      'utf-8'
    );
    await sql.unsafe(interactionsSQL);
    console.log('✅ business_interactions table ready');

    // 3. Verify tables exist
    console.log('\n3️⃣ Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('location_reviews', 'business_interactions')
      ORDER BY table_name
    `;
    
    console.log('📊 Found tables:', tables.map(t => t.table_name).join(', '));

    console.log('\n✅ Database setup complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup error:', error);
    process.exit(1);
  }
}

setupTables();
