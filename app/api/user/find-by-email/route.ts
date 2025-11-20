import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Email ile normal user arama API
 * Business users'ın favorites'ını sync etmek için kullanılır
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parametresi gerekli' },
        { status: 400 }
      );
    }

    console.log('🔍 Email ile normal user aranıyor:', email);

    // Normal users tablosundan email ile kullanıcı ara
    const result = await query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Bu email ile kayıtlı normal user bulunamadı'
      });
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      }
    });

  } catch (error: any) {
    console.error('❌ Find user by email error:', error);
    return NextResponse.json(
      { error: 'Kullanıcı arama hatası' },
      { status: 500 }
    );
  }
}