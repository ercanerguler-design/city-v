import { NextRequest, NextResponse } from 'next/server';

/**
 * ESP32-CAM IP Adresi Doğrulama ve Tanıma
 * Herhangi bir ESP32 IP adresi girildiğinde cihazı otomatik tanır
 */
export async function POST(request: NextRequest) {
  try {
    const { ipAddress, port } = await request.json();

    if (!ipAddress) {
      return NextResponse.json(
        { success: false, error: 'IP adresi gerekli' },
        { status: 400 }
      );
    }

    const targetPort = port || 80;
    const baseUrl = `http://${ipAddress}:${targetPort}`;

    console.log('🔍 ESP32-CAM doğrulanıyor:', { ipAddress, port: targetPort, baseUrl });

    // 1. Stream endpoint kontrolü
    const streamEndpoints = [
      '/stream',
      '/cam',
      '/video',
      '/',
    ];

    let streamUrl = null;
    let isESP32 = false;
    let deviceInfo: any = {};

    // Stream endpoint'ini bul
    for (const endpoint of streamEndpoints) {
      try {
        const testUrl = `${baseUrl}${endpoint}`;
        console.log(`  Testing: ${testUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 saniye timeout

        const response = await fetch(testUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'CityV-Business/1.0',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok || response.status === 200) {
          const contentType = response.headers.get('content-type') || '';
          
          // Video stream veya HTML sayfası kontrolü
          if (contentType.includes('multipart/x-mixed-replace') || 
              contentType.includes('image/jpeg') ||
              contentType.includes('video') ||
              endpoint === '/stream') {
            streamUrl = testUrl;
            isESP32 = true;
            console.log(`  ✅ Stream bulundu: ${testUrl}`);
            break;
          }
          
          // HTML sayfası varsa ESP32 web interface olabilir
          if (contentType.includes('text/html')) {
            streamUrl = testUrl;
            isESP32 = true;
            console.log(`  ✅ Web interface bulundu: ${testUrl}`);
            break;
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log(`  ⏱️ Timeout: ${endpoint}`);
        } else {
          console.log(`  ❌ Başarısız: ${endpoint}`);
        }
      }
    }

    // 2. ESP32-CAM özgü endpoint'leri kontrol et
    if (!isESP32) {
      const esp32Endpoints = [
        '/status',
        '/control',
        '/capture',
      ];

      for (const endpoint of esp32Endpoints) {
        try {
          const testUrl = `${baseUrl}${endpoint}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const response = await fetch(testUrl, {
            method: 'GET',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            isESP32 = true;
            streamUrl = `${baseUrl}/stream`; // Varsayılan stream URL
            console.log(`  ✅ ESP32 endpoint bulundu: ${endpoint}`);
            break;
          }
        } catch (error) {
          // Sessizce devam et
        }
      }
    }

    // 3. Basit HTTP yanıt kontrolü (son çare)
    if (!isESP32) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(baseUrl, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          isESP32 = true;
          streamUrl = `${baseUrl}/stream`;
          console.log('  ✅ HTTP yanıt alındı, varsayılan stream URL kullanılıyor');
        }
      } catch (error) {
        console.log('  ❌ HTTP yanıt alınamadı');
      }
    }

    if (!isESP32 || !streamUrl) {
      return NextResponse.json({
        success: false,
        error: 'ESP32-CAM cihazı bulunamadı',
        message: `${ipAddress}:${targetPort} adresinde erişilebilir bir ESP32-CAM bulunamadı. Cihazın açık ve ağa bağlı olduğundan emin olun.`,
      }, { status: 404 });
    }

    // Cihaz bilgileri
    deviceInfo = {
      ipAddress,
      port: targetPort,
      streamUrl,
      detectedAt: new Date().toISOString(),
      type: 'ESP32-CAM',
      status: 'online',
    };

    console.log('✅ ESP32-CAM başarıyla tanındı:', deviceInfo);

    return NextResponse.json({
      success: true,
      message: 'ESP32-CAM cihazı başarıyla tanındı!',
      device: deviceInfo,
      streamUrl,
    });

  } catch (error: any) {
    console.error('❌ ESP32-CAM doğrulama hatası:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Doğrulama başarısız',
      message: error.message || 'Cihaz doğrulaması sırasında bir hata oluştu',
    }, { status: 500 });
  }
}
