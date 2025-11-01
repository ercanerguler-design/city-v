import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Tüm kullanıcılar getiriliyor...');
    
    // Normal users tablosundan kullanıcıları çek
    const normalUsers = await sql`
      SELECT 
        id,
        email,
        name as full_name,
        google_id,
        profile_picture,
        membership_tier,
        ai_credits,
        is_active,
        join_date,
        last_login as last_sign_in_at,
        created_at,
        updated_at,
        'normal' as user_type
      FROM users
      ORDER BY created_at DESC
      LIMIT 100
    `;

    // Normal kullanıcıları formatla
    const formattedUsers = normalUsers.rows.map((user: any) => ({
      id: `normal-${user.id}`, // Unique key için prefix ekle
      original_id: user.id,
      email: user.email,
      name: user.full_name || 'İsimsiz Kullanıcı',
      membership: user.membership_tier || 'free',
      created_at: user.created_at,
      last_activity: user.last_sign_in_at,
      user_type: 'normal',
      is_active: user.last_sign_in_at ? new Date(user.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : false
    }));
    
    console.log(`✅ ${formattedUsers.length} normal kullanıcı bulundu`);
    
    return NextResponse.json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
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
    
    // "normal-123" formatında gelirse ID'yi çıkar
    const cleanUserId = userId.startsWith('normal-') ? userId.replace('normal-', '') : userId;
    
    console.log(`🗑️ Kullanıcı siliniyor: ${cleanUserId}`);
    
    // Transaction başlat - güvenli silme için
    await sql`BEGIN`;
    
    try {
      // 1. Kullanıcının yorumlarını sil
      await sql`DELETE FROM location_reviews WHERE user_id = ${cleanUserId}`;
      console.log(`🗑️ User ${cleanUserId} reviews deleted`);
      
      // 2. Kullanıcının raporlarını sil (eğer cascade değilse)
      await sql`DELETE FROM crowd_reports WHERE reported_by = ${cleanUserId}`;
      console.log(`🗑️ User ${cleanUserId} reports deleted`);
      
      // 3. Kullanıcının favorilerini sil (ON DELETE CASCADE olsa bile explicit)
      await sql`DELETE FROM user_favorites WHERE user_id = ${cleanUserId}`;
      console.log(`🗑️ User ${cleanUserId} favorites deleted`);
      
      // 4. Kullanıcıyı sil
      const result = await sql`
        DELETE FROM users
        WHERE id = ${cleanUserId}
        RETURNING email
      `;
      
      if (result.rows.length === 0) {
        await sql`ROLLBACK`;
        return NextResponse.json(
          { error: 'Kullanıcı bulunamadı' },
          { status: 404 }
        );
      }
      
      await sql`COMMIT`;
      console.log('✅ Kullanıcı ve tüm ilişkili kayıtlar silindi:', result.rows[0].email);
      
      return NextResponse.json({
        success: true,
        message: 'Kullanıcı ve ilişkili tüm veriler silindi'
      });
      
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
    
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
