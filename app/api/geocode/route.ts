import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Adres parametresi gerekli' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google API key yapılandırılmamış' },
        { status: 500 }
      );
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      return NextResponse.json({
        success: true,
        location: {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id
        }
      });
    } else {
      return NextResponse.json(
        { error: `Geocoding hatası: ${data.status}`, details: data.error_message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Geocode API hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
