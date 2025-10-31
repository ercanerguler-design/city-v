import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🚀 Personel ve Kampanya tabloları oluşturuluyor...');

    // Personel tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS business_staff (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) NOT NULL DEFAULT 'employee',
        position VARCHAR(100),
        salary DECIMAL(10, 2),
        hire_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'active',
        photo_url TEXT,
        permissions JSONB DEFAULT '{"cameras": false, "menu": false, "reports": false, "settings": false}'::jsonb,
        working_hours JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(business_id, email)
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_staff_business ON business_staff(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_status ON business_staff(business_id, status)`;

    // Kampanya tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS business_marketing_campaigns (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        campaign_type VARCHAR(50) NOT NULL,
        discount_type VARCHAR(20),
        discount_value DECIMAL(10, 2),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        target_audience VARCHAR(50) DEFAULT 'all',
        max_radius_km DECIMAL(5, 2) DEFAULT 5.0,
        status VARCHAR(20) DEFAULT 'draft',
        sent_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_business ON business_marketing_campaigns(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON business_marketing_campaigns(start_date, end_date)`;

    // Notification log
    await sql`
      CREATE TABLE IF NOT EXISTS push_notification_logs (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES business_marketing_campaigns(id) ON DELETE CASCADE,
        user_id INTEGER,
        sent_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'sent',
        opened_at TIMESTAMP,
        clicked_at TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_notification_logs_campaign ON push_notification_logs(campaign_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON push_notification_logs(user_id)`;

    return NextResponse.json({
      success: true,
      message: '✅ Personel ve Kampanya tabloları oluşturuldu!',
      tables: ['business_staff', 'business_marketing_campaigns', 'push_notification_logs']
    });

  } catch (error: any) {
    console.error('❌ Tablo oluşturma hatası:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
