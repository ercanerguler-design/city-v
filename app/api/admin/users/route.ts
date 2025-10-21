import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Tüm kullanıcılar getiriliyor...');
    
    // Tüm kullanıcıları getir (yeni eklenenden eskiye)
    const result = await sql`
      SELECT 
        id,
        email,
        name,
        google_id,
        profile_picture,
        membership_tier,
        ai_credits,
        is_active,
        join_date,
        last_login,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ ${result.rows.length} kullanıcı bulundu`);
    
    return NextResponse.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Kullanıcıları getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Kullanıcılar getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// Kullanıcı güncelleme (premium verme, krediler vb.)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID gerekli' },
        { status: 400 }
      );
    }
    
    console.log(`🔧 Kullanıcı güncelleniyor: ${userId}`, updates);
    
    // Dinamik update query oluştur
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (updates.membershipTier !== undefined) {
      updateFields.push(`membership_tier = $${paramIndex++}`);
      values.push(updates.membershipTier);
    }
    
    if (updates.aiCredits !== undefined) {
      updateFields.push(`ai_credits = $${paramIndex++}`);
      values.push(updates.aiCredits);
    }
    
    if (updates.isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }
    
    // updated_at her zaman güncelle
    updateFields.push(`updated_at = NOW()`);
    
    if (updateFields.length === 1) { // Sadece updated_at varsa
      return NextResponse.json(
        { error: 'Güncellenecek alan belirtilmedi' },
        { status: 400 }
      );
    }
    
    values.push(userId);
    
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await sql.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    console.log('✅ Kullanıcı güncellendi:', result.rows[0].email);
    
    return NextResponse.json({
      success: true,
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Kullanıcı güncelleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Kullanıcı güncellenemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// Kullanıcı silme
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID gerekli' },
        { status: 400 }
      );
    }
    
    console.log(`🗑️ Kullanıcı siliniyor: ${userId}`);
    
    const result = await sql`
      DELETE FROM users
      WHERE id = ${userId}
      RETURNING email
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    console.log('✅ Kullanıcı silindi:', result.rows[0].email);
    
    return NextResponse.json({
      success: true,
      message: 'Kullanıcı silindi'
    });
    
  } catch (error) {
    console.error('❌ Kullanıcı silme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Kullanıcı silinemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
