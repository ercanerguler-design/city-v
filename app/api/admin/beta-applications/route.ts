import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET: Tüm beta başvurularını getir
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Beta başvuruları getiriliyor...');
    
    // Query parameters'den filtreleme al
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    let query;
    
    if (status && status !== 'all') {
      // Status'a göre filtrele
      query = await sql`
        SELECT * FROM beta_applications 
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    } else {
      // Tüm başvuruları getir
      query = await sql`
        SELECT * FROM beta_applications 
        ORDER BY created_at DESC
      `;
    }
    
    console.log(`✅ ${query.rows.length} başvuru bulundu`);
    
    return NextResponse.json({
      success: true,
      applications: query.rows,
      count: query.rows.length
    });
    
  } catch (error) {
    console.error('❌ Beta başvuruları getirme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Başvurular alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// PATCH: Beta başvuru durumunu güncelle
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, status, adminNotes } = body;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'application_id gerekli' },
        { status: 400 }
      );
    }
    
    console.log(`📝 Başvuru güncelleniyor: ${applicationId} -> ${status}`);
    
    // Status güncelle
    const updateFields: string[] = ['status = $1', 'updated_at = NOW()'];
    const values: any[] = [status || 'pending'];
    let paramCount = 1;
    
    // Admin notes varsa ekle
    if (adminNotes !== undefined) {
      paramCount++;
      updateFields.push(`admin_notes = $${paramCount}`);
      values.push(adminNotes);
    }
    
    // Contacted/Approved timestamp'lerini güncelle
    if (status === 'contacted') {
      paramCount++;
      updateFields.push(`contacted_at = NOW()`);
    } else if (status === 'approved') {
      paramCount++;
      updateFields.push(`approved_at = NOW()`);
    }
    
    paramCount++;
    values.push(applicationId);
    
    const query = `
      UPDATE beta_applications 
      SET ${updateFields.join(', ')}
      WHERE application_id = $${paramCount}
      RETURNING *
    `;
    
    const result = await sql.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Başvuru bulunamadı' },
        { status: 404 }
      );
    }
    
    console.log('✅ Başvuru güncellendi:', applicationId);
    
    return NextResponse.json({
      success: true,
      application: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Başvuru güncelleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Güncelleme başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// DELETE: Beta başvurusunu sil
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get('applicationId');
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'application_id gerekli' },
        { status: 400 }
      );
    }
    
    console.log(`🗑️ Başvuru siliniyor: ${applicationId}`);
    
    const result = await sql`
      DELETE FROM beta_applications 
      WHERE application_id = ${applicationId}
      RETURNING application_id
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Başvuru bulunamadı' },
        { status: 404 }
      );
    }
    
    console.log('✅ Başvuru silindi:', applicationId);
    
    return NextResponse.json({
      success: true,
      message: 'Başvuru silindi'
    });
    
  } catch (error) {
    console.error('❌ Başvuru silme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Silme başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
