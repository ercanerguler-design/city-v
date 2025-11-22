import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST - Business kullanıcısı şifre değiştirme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    // Validasyon
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Yeni şifre en az 8 karakter olmalıdır' },
        { status: 400 }
      );
    }

    console.log(`🔐 Business user ${userId} şifre değiştirme talebi`);

    // Mevcut kullanıcıyı ve şifresini al
    const userResult = await query(
      'SELECT id, email, password_hash FROM business_users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Mevcut şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      console.log('❌ Mevcut şifre yanlış');
      return NextResponse.json(
        { success: false, error: 'Mevcut şifre yanlış' },
        { status: 401 }
      );
    }

    // Yeni şifreyi hash'le
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    await query(
      'UPDATE business_users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    console.log(`✅ Business user ${userId} şifresi güncellendi`);

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('❌ Password change error:', error);
    return NextResponse.json(
      { success: false, error: 'Şifre değiştirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

