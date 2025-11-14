import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, membershipTier } = await req.json();
    
    if (!userId || !membershipTier) {
      return NextResponse.json(
        { success: false, error: 'userId ve membershipTier gerekli' },
        { status: 400 }
      );
    }

    // Clean userId - remove prefix if exists
    const cleanUserId = typeof userId === 'string' 
      ? userId.replace(/^(normal-|business-)/, '')
      : userId;
    
    console.log('🔍 Update membership:', { rawUserId: userId, cleanUserId, membershipTier });

    // Validate membership tier
    const validTiers = ['free', 'premium', 'business', 'enterprise'];
    if (!validTiers.includes(membershipTier)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz üyelik seviyesi' },
        { status: 400 }
      );
    }

    // Update user membership in database
    const result = await query(
      'UPDATE users SET membership_tier = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [membershipTier, cleanUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];

    // Log admin action
    console.log(`🔄 Admin action: User ${cleanUserId} membership updated to ${membershipTier}`);

    // Log to admin activity (optional table)
    try {
      await query(
        'INSERT INTO admin_logs (action_type, target_user_id, action_data, created_at) VALUES ($1, $2, $3, NOW())',
        ['membership_update', cleanUserId, JSON.stringify({ oldTier: 'unknown', newTier: membershipTier })]
      );
    } catch (logError) {
      console.warn('Admin log failed:', logError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        membershipTier: updatedUser.membership_tier,
        updatedAt: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Membership update error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Sunucu hatası' },
      { status: 500 }
    );
  }
}