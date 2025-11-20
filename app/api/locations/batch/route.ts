import { NextRequest, NextResponse } from 'next/server';
import { ankaraLocations } from '@/lib/ankaraData';

/**
 * Batch Location Details API
 * Birden fazla location ID'yi aynı anda çeker
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationIds } = body;

    if (!locationIds || !Array.isArray(locationIds)) {
      return NextResponse.json(
        { error: 'locationIds array gerekli' },
        { status: 400 }
      );
    }

    console.log('📋 Batch location detayları isteniyor:', locationIds);

    // Ankara data'sından location'ları filtrele
    const foundLocations = ankaraLocations.filter(location => 
      locationIds.includes(location.id)
    );

    console.log('✅ Bulunan location sayısı:', foundLocations.length);

    return NextResponse.json({
      success: true,
      locations: foundLocations,
      requested: locationIds.length,
      found: foundLocations.length
    });

  } catch (error: any) {
    console.error('❌ Batch locations error:', error);
    return NextResponse.json(
      { error: 'Location detayları çekilemedi' },
      { status: 500 }
    );
  }
}