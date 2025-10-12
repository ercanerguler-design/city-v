import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Test için sabit koordinatlar (Kızılay, Ankara)
  const testLat = 39.9208;
  const testLng = 32.8541;
  
  console.log('🧪 TEST API çağrıldı');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}... (${apiKey.length} karakter)` : 'YOK!');
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'API key tanımlı değil',
      env: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    });
  }
  
  try {
    // Basit bir cafe araması
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${testLat},${testLng}&radius=1000&type=cafe&key=${apiKey}&language=tr`;
    
    console.log('🌐 Test isteği gönderiliyor...');
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📊 Sonuç:', {
      status: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message
    });
    
    return NextResponse.json({
      success: data.status === 'OK',
      status: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message,
      firstResult: data.results?.[0]?.name,
      apiKeyLength: apiKey.length
    });
  } catch (error: any) {
    console.error('💥 Test hatası:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
