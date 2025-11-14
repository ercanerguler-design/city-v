import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin tarafından business user'a kredi atama
 * POST /api/cityvadmin/assign-credits
 * Body: { businessUserId, credits, description }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessUserId, credits, description, adminId } = body;

    // Validation
    if (!businessUserId) {
      return NextResponse.json(
        { error: 'Business User ID gerekli' },
        { status: 400 }
      );
    }

    if (!credits || isNaN(credits)) {
      return NextResponse.json(
        { error: 'Geçerli bir kredi miktarı girin' },
        { status: 400 }
      );
    }

    const creditsAmount = parseInt(credits);

    // Mevcut krediyi al
    const userResult = await sql`
      SELECT campaign_credits, email, full_name
      FROM business_users
      WHERE id = ${businessUserId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const currentCredits = user.campaign_credits || 0;
    const newCredits = currentCredits + creditsAmount;

    // Kredi güncelle
    await sql`
      UPDATE business_users
      SET campaign_credits = ${newCredits},
          credits_last_updated = NOW()
      WHERE id = ${businessUserId}
    `;

    // Transaction kaydı (created_by_admin_id NULL bırakılıyor - admin sistemi ayrı)
    await sql`
      INSERT INTO campaign_credit_transactions (
        business_user_id, transaction_type,
        credits_amount, credits_before, credits_after,
        description
      )
      VALUES (
        ${businessUserId}, 'admin_grant',
        ${creditsAmount}, ${currentCredits}, ${newCredits},
        ${description || 'Admin tarafından kredi eklendi'}
      )
    `;

    console.log(`✅ Admin kredi ataması: ${user.email} → ${creditsAmount} kredi eklendi (${currentCredits} → ${newCredits})`);

    return NextResponse.json({
      success: true,
      message: `${creditsAmount} kredi başarıyla eklendi`,
      user: {
        email: user.email,
        fullName: user.full_name,
        previousCredits: currentCredits,
        newCredits,
        creditsAdded: creditsAmount
      }
    });

  } catch (error: any) {
    console.error('❌ Admin kredi atama hatası:', error);
    return NextResponse.json(
      { error: 'Kredi atanamadı', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Tüm business userları listele (admin için)
 * GET /api/cityvadmin/assign-credits
 */
export async function GET(request: NextRequest) {
  try {
    const result = await sql`
      SELECT 
        bu.id,
        bu.email,
        bu.full_name,
        bu.membership_type,
        bu.campaign_credits,
        bu.total_campaigns_created,
        bu.credits_last_updated,
        bu.created_at,
        bp.business_name,
        bp.business_type
      FROM business_users bu
      LEFT JOIN business_profiles bp ON bp.user_id = bu.id
      WHERE bu.is_active = true
      ORDER BY bu.membership_type DESC, bu.campaign_credits ASC
    `;

    return NextResponse.json({
      success: true,
      users: result.rows
    });

  } catch (error: any) {
    console.error('❌ Admin kullanıcı listesi hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar listelenemedi', details: error.message },
      { status: 500 }
    );
  }
}
