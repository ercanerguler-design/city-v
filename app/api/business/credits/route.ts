import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Business user'ın kampanya kredisi bilgilerini getir
 * GET /api/business/credits?userId=123
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID gerekli' },
        { status: 400 }
      );
    }

    // Kredi bilgilerini getir
    const result = await sql`
      SELECT 
        id,
        email,
        full_name,
        membership_type,
        campaign_credits,
        total_campaigns_created,
        credits_last_updated
      FROM business_users
      WHERE id = ${userId}
      AND is_active = true
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      credits: {
        current: user.campaign_credits || 0,
        membershipType: user.membership_type,
        totalCampaigns: user.total_campaigns_created || 0,
        lastUpdated: user.credits_last_updated
      }
    });

  } catch (error: any) {
    console.error('❌ Kredi bilgisi hatası:', error);
    return NextResponse.json(
      { error: 'Kredi bilgisi alınamadı', details: error.message },
      { status: 500 }
    );
  }
}
