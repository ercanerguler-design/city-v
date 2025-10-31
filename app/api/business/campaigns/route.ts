import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const { 
      businessId, 
      title, 
      description, 
      discountPercent,
      discountAmount, 
      startDate, 
      endDate,
      targetAudience = 'all',
      imageUrl
    } = await request.json();

    if (!businessId || !title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Tüm kampanya bilgileri gerekli' },
        { status: 400 }
      );
    }

    // Kampanya oluştur - image_url eklendi
    const result = await sql`
      INSERT INTO business_campaigns (
        business_id, title, description, discount_percent, discount_amount,
        start_date, end_date, target_audience, image_url, is_active
      )
      VALUES (
        ${businessId}, ${title}, ${description}, ${discountPercent || null}, ${discountAmount || null},
        ${startDate}, ${endDate}, ${targetAudience}, ${imageUrl || null}, true
      )
      RETURNING *
    `;

    const campaign = result.rows[0];

    // Push notification oluştur
    const notification = {
      id: Date.now(),
      businessId,
      campaignId: campaign.id,
      title: `🎉 Yeni Kampanya: ${title}`,
      message: `${description} - %${discountPercent} indirim!`,
      type: 'campaign',
      createdAt: new Date().toISOString(),
      read: false
    };

    // Vercel KV'ye bildirim kaydet (ana CityV kullanıcıları için)
    await kv.lpush('cityv:notifications', JSON.stringify(notification));
    
    // Business notifications tablosuna kaydet
    await sql`
      INSERT INTO push_notifications (
        business_id, campaign_id, title, message, notification_type, sent_at
      )
      VALUES (
        ${businessId}, ${campaign.id}, ${notification.title}, 
        ${notification.message}, 'campaign', NOW()
      )
    `;

    // Kampanya istatistiklerini güncelle
    await sql`
      UPDATE business_campaigns 
      SET notification_sent = true, notification_sent_at = NOW()
      WHERE id = ${campaign.id}
    `;

    return NextResponse.json({
      success: true,
      campaign,
      notification,
      message: 'Kampanya oluşturuldu ve tüm kullanıcılara bildirim gönderildi'
    });

  } catch (error: any) {
    console.error('Kampanya oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kampanya oluşturulamadı', details: error.message },
      { status: 500 }
    );
  }
}

// Kampanyaları getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT * FROM business_campaigns 
      WHERE business_id = ${businessId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      campaigns: result.rows
    });

  } catch (error: any) {
    console.error('Kampanyaları getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kampanyalar getirilemedi', details: error.message },
      { status: 500 }
    );
  }
}
