import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get('origin'); // "lat,lng"
    const destination = searchParams.get('destination'); // "lat,lng"
    const mode = searchParams.get('mode') || 'walking'; // walking, driving, transit, bicycling

    console.log('🗺️ Directions API çağrıldı:', {
      origin,
      destination,
      mode,
    });

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin ve destination parametreleri gerekli' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('❌ Google Maps API key bulunamadı');
      return NextResponse.json(
        { error: 'API key yapılandırılmamış' },
        { status: 500 }
      );
    }

    console.log('✅ API key var:', apiKey.substring(0, 20) + '...');

    // Google Directions API URL
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${apiKey}&language=tr&units=metric`;

    console.log('🌐 Google Directions API çağrılıyor:', mode);

    const response = await fetch(url);
    const data = await response.json();

    console.log('📊 Google Directions yanıtı:', {
      status: data.status,
      routesCount: data.routes?.length || 0,
      errorMessage: data.error_message,
    });

    if (data.status !== 'OK') {
      console.error('❌ Google Directions API hatası:', {
        status: data.status,
        error_message: data.error_message,
        available_travel_modes: data.available_travel_modes,
        full_response: JSON.stringify(data, null, 2)
      });
      return NextResponse.json(
        { 
          error: data.error_message || 'Rota bulunamadı', 
          status: data.status,
          details: data
        },
        { status: 400 }
      );
    }

    // İlk rotayı al
    const route = data.routes[0];
    const leg = route.legs[0];

    const result = {
      status: 'OK',
      distance: {
        text: leg.distance.text,
        value: leg.distance.value, // metre
      },
      duration: {
        text: leg.duration.text,
        value: leg.duration.value, // saniye
      },
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map((step: any) => ({
        distance: step.distance.text,
        duration: step.duration.text,
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // HTML taglerini kaldır
        maneuver: step.maneuver,
      })),
      polyline: route.overview_polyline.points, // Haritada çizmek için
    };

    console.log('✅ Rota hazırlandı:', {
      distance: result.distance.text,
      duration: result.duration.text,
      stepsCount: result.steps.length,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Directions API hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
