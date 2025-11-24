import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Database'den son 50 bildirimi al (push_notifications tablosundan)
    const result = await sql`
      SELECT 
        pn.id,
        pn.business_id as "businessId",
        pn.campaign_id as "campaignId",
        pn.title,
        pn.message,
        pn.notification_type as type,
        pn.sent_at as "createdAt",
        COALESCE(pn.is_read, false) as read,
        bp.business_name as "businessName",
        bc.discount_percent,
        bc.discount_amount
      FROM push_notifications pn
      LEFT JOIN business_profiles bp ON pn.business_id = bp.id
      LEFT JOIN business_campaigns bc ON pn.campaign_id = bc.id
      WHERE pn.notification_type = 'campaign'
      ORDER BY pn.sent_at DESC
      LIMIT 50
    `;

    const notifications = result.rows.map(row => ({
      id: row.id,
      businessId: row.businessId,
      campaignId: row.campaignId,
      title: row.title,
      message: row.message,
      type: row.type,
      createdAt: row.createdAt,
      read: row.read,
      businessName: row.businessName,
      value: row.discount_percent || row.discount_amount
    }));

    console.log(`✅ Fetched ${notifications.length} notifications from database`);

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error: any) {
    console.error('❌ Bildirimler getirilemedi:', error);
    return NextResponse.json(
      { 
        success: false, 
        notifications: [],
        error: error.message 
      },
      { status: 200 } // 200 döndür ama boş liste
    );
  }
}
