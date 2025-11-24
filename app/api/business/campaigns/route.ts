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

    // İndirim yüzdesi veya tutarı opsiyonel - en az biri olmalı
    if (discountPercent && (discountPercent <= 0 || discountPercent > 100)) {
      return NextResponse.json(
        { error: 'İndirim yüzdesi 1-100 arasında olmalı' },
        { status: 400 }
      );
    }

    if (discountAmount && discountAmount <= 0) {
      return NextResponse.json(
        { error: 'İndirim tutarı 0\'dan büyük olmalı' },
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

    // 2. Kampanya oluştur
    const result = await sql`
      INSERT INTO business_campaigns (
        business_id, title, description, discount_percent, discount_amount,
        start_date, end_date, target_audience, is_active
      )
      VALUES (
        ${businessId}, ${title}, ${description}, ${discountPercent || null}, ${discountAmount || null},
        ${startDate}, ${endDate}, ${targetAudience}, true
      )
      RETURNING *
    `;

    const campaign = result.rows[0];

    // Push notification oluştur
    const notificationTitle = `🎉 Yeni Kampanya: ${title}`;
    const notificationMessage = discountPercent 
      ? `${description} - %${discountPercent} indirim!`
      : discountAmount 
        ? `${description} - ${discountAmount}₺ indirim!`
        : description;

    const notification = {
      id: Date.now(),
      businessId,
      campaignId: campaign.id,
      title: notificationTitle,
      message: notificationMessage,
      type: 'campaign',
      createdAt: new Date().toISOString(),
      read: false
    };

    // Vercel KV'ye bildirim kaydet (ana CityV kullanıcıları için) - KV yoksa skip
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await kv.lpush('cityv:notifications', JSON.stringify(notification));
        console.log('✅ Notification sent to Vercel KV');
      } else {
        console.log('⚠️ Vercel KV not configured, skipping KV notification');
      }
    } catch (kvError) {
      console.error('⚠️ KV notification failed (non-critical):', kvError);
      // KV hatası kampanyayı durdurmasın
    }
    
    // Business notifications tablosuna kaydet
    // ✅ FIX: business_id = business_profiles.id (businessId parametresi zaten profile ID)
    await sql`
      INSERT INTO push_notifications (
        business_id, campaign_id, title, message, notification_type, sent_at
      )
      VALUES (
        ${businessId}, ${campaign.id}, ${notificationTitle}, 
        ${notificationMessage}, 'campaign', NOW()
      )
    `;
    
    console.log('✅ Push notification kaydedildi:', {
      businessId,
      campaignId: campaign.id,
      title: notificationTitle
    });

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

    // ✅ FIX: Süresi dolan kampanyaları otomatik deaktif et (Türkiye saatine göre)
    await sql`
      UPDATE business_campaigns 
      SET is_active = false
      WHERE business_id = ${businessId}
        AND is_active = true
        AND (end_date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul') < (NOW() AT TIME ZONE 'Europe/Istanbul')
    `;

    console.log('✅ Süresi dolan kampanyalar deaktif edildi');

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

// Kampanya güncelleme
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const body = await request.json();
    const updates = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID gerekli (URL parameter olarak gönderilmeli)' },
        { status: 400 }
      );
    }
    
    console.log('📝 Kampanya güncelleniyor:', { campaignId, updates });

    // Güncellenebilir alanlar
    const allowedFields = ['title', 'description', 'discount_percent', 'discount_amount', 'start_date', 'end_date', 'target_audience', 'is_active'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updates[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek alan bulunamadı' },
        { status: 400 }
      );
    }

    // ✅ FIX: Vercel Postgres için Manuel UPDATE (her alan için if/else)
    let result;
    
    // Tek tek alanlara göre UPDATE yap (Vercel Postgres limitation)
    const field = Object.keys(updates).find(key => allowedFields.includes(key));
    
    if (!field) {
      return NextResponse.json(
        { error: 'Geçerli alan bulunamadı' },
        { status: 400 }
      );
    }

    // Manuel field mapping (Vercel Postgres sql`` template literal için)
    if (field === 'title') {
      result = await sql`UPDATE business_campaigns SET title = ${updates.title}, updated_at = NOW() WHERE id = ${campaignId} RETURNING *`;
    } else if (field === 'description') {
      result = await sql`UPDATE business_campaigns SET description = ${updates.description}, updated_at = NOW() WHERE id = ${campaignId} RETURNING *`;
    } else if (field === 'discount_percent') {
      result = await sql`UPDATE business_campaigns SET discount_percent = ${updates.discount_percent}, updated_at = NOW() WHERE id = ${campaignId} RETURNING *`;
    } else if (field === 'discount_amount') {
      result = await sql`UPDATE business_campaigns SET discount_amount = ${updates.discount_amount}, updated_at = NOW() WHERE id = ${campaignId} RETURNING *`;
    } else if (field === 'start_date') {
      result = await sql`UPDATE business_campaigns SET start_date = ${updates.start_date}, updated_at = NOW() WHERE id = ${campaignId} RETURNING *`;
    } else if (field === 'end_date') {
      result = await sql`UPDATE business_campaigns SET end_date = ${updates.end_date}, updated_at = NOW() WHERE id = ${campaignId} RETURNING *`;
    } else if (field === 'target_audience') {
      result = await sql`UPDATE business_campaigns SET target_audience = ${updates.target_audience}, updated_at = NOW() WHERE id = ${campaignId} RETURNING *`;
    } else if (field === 'is_active') {
      result = await sql`UPDATE business_campaigns SET is_active = ${updates.is_active}, updated_at = NOW() WHERE id = ${campaignId} RETURNING *`;
    } else {
      // Çoklu alan güncellemesi - tüm alanları birlikte güncelle
      result = await sql`
        UPDATE business_campaigns 
        SET 
          title = COALESCE(${updates.title || null}, title),
          description = COALESCE(${updates.description || null}, description),
          discount_percent = COALESCE(${updates.discount_percent || null}, discount_percent),
          discount_amount = COALESCE(${updates.discount_amount || null}, discount_amount),
          start_date = COALESCE(${updates.start_date || null}, start_date),
          end_date = COALESCE(${updates.end_date || null}, end_date),
          target_audience = COALESCE(${updates.target_audience || null}, target_audience),
          is_active = COALESCE(${updates.is_active !== undefined ? updates.is_active : null}, is_active),
          updated_at = NOW()
        WHERE id = ${campaignId}
        RETURNING *
      `;
    }

    console.log('✅ Kampanya güncellendi:', campaignId);

    return NextResponse.json({
      success: true,
      campaign: result.rows[0],
      message: 'Kampanya başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('Kampanya güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kampanya güncellenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// Kampanya silme
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID gerekli' },
        { status: 400 }
      );
    }

    // Kampanyayı sil
    await sql`
      DELETE FROM business_campaigns 
      WHERE id = ${campaignId}
    `;

    console.log('✅ Kampanya silindi:', campaignId);

    return NextResponse.json({
      success: true,
      message: 'Kampanya başarıyla silindi'
    });

  } catch (error: any) {
    console.error('Kampanya silme hatası:', error);
    return NextResponse.json(
      { error: 'Kampanya silinemedi', details: error.message },
      { status: 500 }
    );
  }
}

