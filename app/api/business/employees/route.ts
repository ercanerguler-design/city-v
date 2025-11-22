import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cityv-business-secret-key-2024';

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET - Personel listele
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employees = await sql`
      SELECT *
      FROM business_employees 
      WHERE business_user_id = ${user.userId} 
        AND is_active = true
      ORDER BY position, full_name
    `;

    return NextResponse.json({
      success: true,
      employees: employees.rows
    });

  } catch (error: any) {
    console.error('❌ Personel listesi hatası:', error);
    return NextResponse.json(
      { error: 'Personeller yüklenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Personel ekle
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      full_name, 
      email, 
      phone,
      photo_url,
      position, 
      department,
      employee_id,
      start_date,
      salary,
      shift,
      working_hours,
      access_level = 'employee',
      can_access_analytics = false,
      can_manage_cameras = false,
      notes,
      emergency_contact
    } = body;

    if (!full_name || !position) {
      return NextResponse.json(
        { error: 'İsim ve pozisyon gerekli' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO business_employees (
        business_user_id,
        full_name,
        email,
        phone,
        photo_url,
        position,
        department,
        employee_id,
        start_date,
        salary,
        shift,
        working_hours,
        access_level,
        can_access_analytics,
        can_manage_cameras,
        notes,
        emergency_contact
      ) VALUES (
        ${user.userId},
        ${full_name},
        ${email || null},
        ${phone || null},
        ${photo_url || null},
        ${position},
        ${department || null},
        ${employee_id || null},
        ${start_date || null},
        ${salary || null},
        ${shift || null},
        ${working_hours ? JSON.stringify(working_hours) : null},
        ${access_level},
        ${can_access_analytics},
        ${can_manage_cameras},
        ${notes || null},
        ${emergency_contact || null}
      )
      RETURNING *
    `;

    console.log(`✅ Personel eklendi: ${full_name} (${position})`);

    return NextResponse.json({
      success: true,
      employee: result.rows[0],
      message: 'Personel başarıyla eklendi'
    });

  } catch (error: any) {
    console.error('❌ Personel ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Personel eklenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Personel güncelle
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Personel ID gerekli' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE business_employees 
      SET 
        full_name = COALESCE(${fields.full_name}, full_name),
        email = COALESCE(${fields.email}, email),
        phone = COALESCE(${fields.phone}, phone),
        photo_url = COALESCE(${fields.photo_url}, photo_url),
        position = COALESCE(${fields.position}, position),
        department = COALESCE(${fields.department}, department),
        shift = COALESCE(${fields.shift}, shift),
        salary = COALESCE(${fields.salary}, salary),
        notes = COALESCE(${fields.notes}, notes),
        updated_at = NOW()
      WHERE id = ${id} 
        AND business_user_id = ${user.userId}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Personel bulunamadı veya yetkiniz yok' },
        { status: 404 }
      );
    }

    console.log(`✅ Personel güncellendi: ${result.rows[0].full_name}`);

    return NextResponse.json({
      success: true,
      employee: result.rows[0],
      message: 'Personel başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('❌ Personel güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Personel güncellenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Personel sil (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Personel ID gerekli' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE business_employees 
      SET is_active = false, updated_at = NOW()
      WHERE id = ${id} 
        AND business_user_id = ${user.userId}
      RETURNING full_name
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Personel bulunamadı veya yetkiniz yok' },
        { status: 404 }
      );
    }

    console.log(`✅ Personel silindi: ${result.rows[0].full_name}`);

    return NextResponse.json({
      success: true,
      message: 'Personel başarıyla silindi'
    });

  } catch (error: any) {
    console.error('❌ Personel silme hatası:', error);
    return NextResponse.json(
      { error: 'Personel silinemedi', details: error.message },
      { status: 500 }
    );
  }
}

