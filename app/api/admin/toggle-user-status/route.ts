import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, isActive } = await req.json();
    
    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'userId ve isActive gerekli' },
        { status: 400 }
      );
    }

    // Update user status
    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];

    // Log admin action
    console.log(`🔄 Admin action: User ${userId} status changed to ${isActive ? 'active' : 'inactive'}`);

    // Log to admin activity
    try {
      await query(
        'INSERT INTO admin_logs (action_type, target_user_id, action_data, created_at) VALUES ($1, $2, $3, NOW())',
        ['user_status_update', userId, JSON.stringify({ 
          newStatus: isActive ? 'active' : 'inactive',
          previousStatus: !isActive ? 'active' : 'inactive'
        })]
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
        isActive: updatedUser.is_active,
        updatedAt: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('User status update error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}