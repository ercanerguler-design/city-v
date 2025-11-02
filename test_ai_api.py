import requests
import cv2
import numpy as np
import json

# Test görüntüsü oluştur
img = np.full((480, 640, 3), 180, dtype=np.uint8)

# İnsan benzeri şekiller
cv2.circle(img, (200, 200), 80, (120, 100, 90), -1)
cv2.circle(img, (440, 280), 70, (120, 100, 90), -1)
cv2.ellipse(img, (320, 300), (60, 120), 0, 0, 360, (110, 90, 80), -1)

# JPEG encode
_, jpeg = cv2.imencode('.jpg', img)

print('📸 Test JPEG oluşturuldu (640x480, 3 şekil)')
print('📤 Next.js API\'ye gönderiliyor...')

# Next.js API'ye gönder
url = 'http://localhost:3000/api/iot/ai-analysis'
headers = {
    'X-Camera-ID': '1',
    'X-Location-Zone': 'Test-Salon',
    'Content-Type': 'image/jpeg'
}

try:
    response = requests.post(url, data=jpeg.tobytes(), headers=headers, timeout=30)
    print(f'\n✅ Status: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print('\n🎉 API BAŞARILI!')
        print(f"👥 Kişi Sayısı: {data['analysis']['person_count']}")
        print(f"🔥 Yoğunluk: {data['analysis']['crowd_density']}%")
        print(f"📊 Seviye: {data['analysis']['density_level']}")
        print(f"⚡ İşlem Süresi: {data['analysis']['processing_time_ms']}ms")
        if data['analysis'].get('heatmap_url'):
            print(f"🗺️ Heat Map: {data['analysis']['heatmap_url']}")
        
        print('\n📋 Full Response:')
        print(json.dumps(data, indent=2))
    else:
        print(f'❌ Hata: {response.text}')
        
except Exception as e:
    print(f'❌ Bağlantı hatası: {e}')
    import traceback
    traceback.print_exc()
