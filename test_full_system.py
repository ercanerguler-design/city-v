import requests
import urllib.request
import cv2
import numpy as np
import json

# Gerçek insan fotoğrafı indir
print('📥 Test fotoğrafı indiriliyor...')
test_image_url = "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=640"

try:
    req = urllib.request.Request(test_image_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        image_data = response.read()
    
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    print(f'✅ Fotoğraf: {img.shape[1]}x{img.shape[0]}')
    
    # JPEG encode
    _, jpeg = cv2.imencode('.jpg', img)
    
    print('📤 ESP32 endpoint\'e gönderiliyor (database ile)...')
    
    # Standalone server'a ESP32 gibi gönder
    url = 'http://localhost:8000/esp32/analyze'
    headers = {
        'X-Camera-ID': '1',
        'X-Location-Zone': 'Test-Salon'
    }
    
    # Binary data olarak gönder (ESP32 gibi)
    response = requests.post(url, data=jpeg.tobytes(), headers=headers, timeout=30)
    
    print(f'\n✅ Status: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print('\n🎉 TAM SİSTEM TEST BAŞARILI!')
        print('\n📋 Sonuç:')
        print(json.dumps(data, indent=2))
        
        analysis = data.get('analysis', {})
        database = data.get('database', {})
        
        print(f'\n📊 ÖZET:')
        print(f'👥 Kişi: {analysis.get("person_count", 0)}')
        print(f'🔥 Yoğunluk: {analysis.get("crowd_density", 0)}%')
        print(f'📈 Seviye: {analysis.get("density_level", "unknown")}')
        print(f'⚡ İşlem: {analysis.get("processing_time_ms", 0)}ms')
        
        if database.get('saved'):
            print(f'\n✅ VERİTABANINA KAYDEDİLDİ!')
            print(f'🆔 Database ID: {database.get("id")}')
        else:
            print(f'\n⚠️ Veritabanına kaydedilemedi')
        
    else:
        print(f'❌ Hata: {response.text}')
        
except Exception as e:
    print(f'❌ Hata: {e}')
    import traceback
    traceback.print_exc()
