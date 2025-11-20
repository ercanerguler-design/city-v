import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

// GET - Personel listesi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID gerekli' }, { status: 400 });
    }

    console.log('📋 Personel listesi isteniyor, businessId:', businessId);

    const result = await sql`
      SELECT 
        id, full_name, email, phone, role, position, 
        hire_date, status, permissions, working_hours,
        created_at, updated_at
      FROM business_staff
      WHERE business_id = ${businessId}
      ORDER BY created_at DESC
    `;

    console.log('✅ Personel listesi bulundu:', result.rows.length, 'personel');

    return NextResponse.json({
      success: true,
      staff: result.rows
    });

  } catch (error: any) {
    console.error('❌ Personel listesi hatası:', error);
    return NextResponse.json({ 
      error: 'Personel listelenemedi',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Yeni personel ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📋 Personel ekleme isteği:', body);

    const {
      businessId,
      full_name,
      email,
      phone,
      role,
      position,
      salary,
      permissions,
      working_hours
    } = body;

    if (!businessId || !full_name || !email) {
      return NextResponse.json(
        { error: 'İşletme ID, ad ve email gerekli' },
        { status: 400 }
      );
    }

    console.log('💾 Veritabanına kayıt yapılıyor...');

    const result = await sql`
      INSERT INTO business_staff (
        business_id, full_name, email, phone, role, position, 
        salary, permissions, working_hours, status, created_at, updated_at
      ) VALUES (
        ${businessId}, ${full_name}, ${email}, ${phone || null}, 
        ${role || 'employee'}, ${position || null}, ${salary || null},
        ${JSON.stringify(permissions) || '{"cameras": false, "menu": false, "reports": false, "settings": false}'},
        ${JSON.stringify(working_hours) || null},
        'active', NOW(), NOW()
      )
      RETURNING *
    `;

    console.log('✅ Personel başarıyla eklendi:', result.rows[0]);

    // Email gönderme kısmını şimdilik devre dışı bırakıyoruz
    console.log('📧 Email gönderimi atlandı (debug mode)');

    return NextResponse.json({
      success: true,
      staff: result.rows[0],
      message: 'Personel başarıyla eklendi'
    });

  } catch (error: any) {
    console.error('❌ Personel ekleme hatası:', error);
    
    if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
      return NextResponse.json({ error: 'Bu email zaten kayıtlı' }, { status: 400 });
    }

    if (error.message.includes('business_staff')) {
      return NextResponse.json({ 
        error: 'Personel tablosu bulunamadı',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Personel eklenemedi',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Personel güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Personel güncelleme isteği:', body);

    const {
      id,
      full_name,
      email,
      phone,
      role,
      position,
      salary,
      status,
      permissions,
      working_hours
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Personel ID gerekli' }, { status: 400 });
    }

    const result = await sql`
      UPDATE business_staff
      SET 
        full_name = COALESCE(${full_name}, full_name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        role = COALESCE(${role}, role),
        position = COALESCE(${position}, position),
        salary = COALESCE(${salary}, salary),
        status = COALESCE(${status}, status),
        permissions = COALESCE(${JSON.stringify(permissions)}, permissions),
        working_hours = COALESCE(${JSON.stringify(working_hours)}, working_hours),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 });
    }

    console.log('✅ Personel güncellendi:', result.rows[0]);

    return NextResponse.json({
      success: true,
      staff: result.rows[0],
      message: 'Personel güncellendi'
    });

  } catch (error: any) {
    console.error('❌ Personel güncelleme hatası:', error);
    return NextResponse.json({ 
      error: 'Personel güncellenemedi',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Personel sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Personel ID gerekli' }, { status: 400 });
    }

    console.log('🗑️ Personel siliniyor, id:', id);

    const deleteResult = await sql`DELETE FROM business_staff WHERE id = ${id} RETURNING *`;

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 });
    }

    console.log('✅ Personel silindi:', deleteResult.rows[0]);

    return NextResponse.json({
      success: true,
      message: 'Personel silindi'
    });

  } catch (error: any) {
    console.error('❌ Personel silme hatası:', error);
    return NextResponse.json({ 
      error: 'Personel silinemedi',
      details: error.message 
    }, { status: 500 });
  }
}
