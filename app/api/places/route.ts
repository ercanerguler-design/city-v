import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5000';
  const type = searchParams.get('type');

  console.log('🔧 API Route çağrıldı:', { lat, lng, radius, type });

  if (!lat || !lng || !type) {
    console.error('❌ Eksik parametreler:', { lat, lng, type });
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ API key bulunamadı!');
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  console.log('✅ API key var:', apiKey.substring(0, 20) + '...');

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}&language=tr`;
    
    console.log('🌐 Google API çağrılıyor:', type);
    const response = await fetch(url);
    const data = await response.json();

    console.log('📊 Google yanıtı:', {
      status: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message
    });

    if (data.error_message) {
      console.error('❌ Google API Hatası:', data.error_message);
    }

    // Her yer için detay bilgileri al (çalışma saatleri dahil)
    if (data.results && data.results.length > 0) {
      console.log('🕒 Çalışma saatlerini alıyorum...');
      
      const placesWithDetails = await Promise.all(
        data.results.map(async (place: any) => {
          try {
            // Place Details API çağrısı - opening_hours alanını da dahil et
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=place_id,opening_hours,current_opening_hours,utc_offset_minutes&key=${apiKey}&language=tr`;
            
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();
            
            if (detailsData.result && detailsData.result.opening_hours) {
              // Çalışma saatlerini birleştir
              place.opening_hours = detailsData.result.opening_hours;
              place.current_opening_hours = detailsData.result.current_opening_hours;
              place.utc_offset_minutes = detailsData.result.utc_offset_minutes;
              
              console.log(`✅ ${place.name} çalışma saatleri alındı:`, {
                open_now: place.opening_hours?.open_now,
                periods: place.opening_hours?.periods?.length || 0
              });
            } else {
              console.log(`⚠️ ${place.name} için çalışma saati bilgisi yok`);
            }
            
            return place;
          } catch (detailError) {
            console.error(`❌ ${place.name} detay hatası:`, detailError);
            return place; // Hata durumunda orijinal veriyi döndür
          }
        })
      );
      
      data.results = placesWithDetails;
      console.log('🎯 Tüm çalışma saatleri güncellendi');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('💥 Fetch hatası:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}
