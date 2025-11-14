import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId gerekli' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const userData = existingUser.rows[0];

    // Soft delete (set as inactive) instead of hard delete for data integrity
    const result = await query(
      'UPDATE users SET is_active = false, deleted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *',
      [userId]
    );

    // Log admin action
    console.log(`🗑️ Admin action: User ${userId} (${userData.email}) deactivated`);

    // Log to admin activity
    try {
      await query(
        'INSERT INTO admin_logs (action_type, target_user_id, action_data, created_at) VALUES ($1, $2, $3, NOW())',
        ['user_deactivated', userId, JSON.stringify({ 
          userName: userData.name, 
          userEmail: userData.email,
          reason: 'admin_action'
        })]
      );
    } catch (logError) {
      console.warn('Admin log failed:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla devre dışı bırakıldı',
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        isActive: result.rows[0].is_active
      }
    });

  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}