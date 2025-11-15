import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔧 Creating business_notifications table...');

    // Check if table exists
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'business_notifications'
      );
    `);

    if (checkTable.rows[0].exists) {
      return NextResponse.json({
        success: true,
        message: 'business_notifications tablosu zaten mevcut',
        exists: true
      });
    }

    // Create table
    await query(`
      CREATE TABLE IF NOT EXISTS business_notifications (
        id SERIAL PRIMARY KEY,
        business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_business_notifications_user_id ON business_notifications(business_user_id);
      CREATE INDEX IF NOT EXISTS idx_business_notifications_created_at ON business_notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_business_notifications_is_read ON business_notifications(is_read);
    `);

    console.log('✅ business_notifications table created successfully');

    return NextResponse.json({
      success: true,
      message: 'business_notifications tablosu oluşturuldu',
      exists: false
    });

  } catch (error: any) {
    console.error('❌ Error creating notifications table:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
