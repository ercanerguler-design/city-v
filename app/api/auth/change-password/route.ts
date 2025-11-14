import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Tüm alanlar gerekli' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const userResult = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Mevcut şifreyi kontrol et
    if (user.password_hash) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mevcut şifre yanlış' },
          { status: 401 }
        );
      }
    } else {
      // Google OAuth kullanıcısı - şifre yok
      return NextResponse.json(
        { error: 'Google hesabı için şifre değiştirilemez' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hashle
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('❌ Password change error:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirme işlemi başarısız' },
      { status: 500 }
    );
  }
}
