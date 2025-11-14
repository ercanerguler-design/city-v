import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 Kampanya POST body:', body);

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
    } = body;

    // Detaylı validasyon
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID gerekli' },
        { status: 400 }
      );
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Kampanya başlığı gerekli' },
        { status: 400 }
      );
    }

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'Kampanya açıklaması gerekli' },
        { status: 400 }
      );
    }

    if (!discountPercent || discountPercent <= 0 || discountPercent > 100) {
      return NextResponse.json(
        { error: 'Geçerli bir indirim oranı giriniz (1-100)' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Başlangıç ve bitiş tarihleri gerekli' },
        { status: 400 }
      );
    }

    console.log('✅ Validasyon geçti, kredi kontrol ediliyor...');

    // 1. Business profile'dan user_id'yi bul ve kredi kontrol et
    const profileResult = await sql`
      SELECT bp.user_id, bu.campaign_credits, bu.email, bu.membership_type
      FROM business_profiles bp
      JOIN business_users bu ON bp.user_id = bu.id
      WHERE bp.id = ${businessId}
    `;

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Business profili bulunamadı' },
        { status: 404 }
      );
    }

    const businessUser = profileResult.rows[0];
    const currentCredits = businessUser.campaign_credits || 0;
    const CAMPAIGN_COST = 2; // Her kampanya 2 kredi harcar

    console.log(`💳 Kredi durumu: ${currentCredits} kredi (Gerekli: ${CAMPAIGN_COST})`);

    if (currentCredits < CAMPAIGN_COST) {
      return NextResponse.json(
        { 
          error: 'Yetersiz kredi', 
          message: `Kampanya oluşturmak için ${CAMPAIGN_COST} kredi gerekli. Mevcut krediniz: ${currentCredits}`,
          needsMoreCredits: true,
          currentCredits,
          requiredCredits: CAMPAIGN_COST
        },
        { status: 402 } // Payment Required
      );
    }

    console.log('✅ Yeterli kredi var, kampanya oluşturuluyor...');

    // 2. Kampanya oluştur - image_url eklendi
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

    // 3. Kampanya istatistiklerini güncelle
    await sql`
      UPDATE business_campaigns 
      SET notification_sent = true, notification_sent_at = NOW()
      WHERE id = ${campaign.id}
    `;

    // 4. Krediyi düş ve transaction kaydet
    const newCredits = currentCredits - CAMPAIGN_COST;
    
    await sql`
      UPDATE business_users 
      SET campaign_credits = ${newCredits},
          total_campaigns_created = total_campaigns_created + 1,
          credits_last_updated = NOW()
      WHERE id = ${businessUser.user_id}
    `;

    // Transaction kaydı
    await sql`
      INSERT INTO campaign_credit_transactions (
        business_user_id, campaign_id, transaction_type,
        credits_amount, credits_before, credits_after, description
      )
      VALUES (
        ${businessUser.user_id}, ${campaign.id}, 'spent',
        ${-CAMPAIGN_COST}, ${currentCredits}, ${newCredits},
        ${`Kampanya oluşturuldu: ${title}`}
      )
    `;

    console.log(`✅ ${CAMPAIGN_COST} kredi harcandı. Kalan kredi: ${newCredits}`);

    return NextResponse.json({
      success: true,
      campaign,
      notification,
      creditsUsed: CAMPAIGN_COST,
      creditsRemaining: newCredits,
      message: `Kampanya oluşturuldu! ${CAMPAIGN_COST} kredi kullanıldı. Kalan: ${newCredits}`
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
