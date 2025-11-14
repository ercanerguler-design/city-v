import requests
import urllib.request
import cv2
import numpy as np
import json

# İnternetten gerçek bir insan fotoğrafı indir
print('📥 Test fotoğrafı indiriliyor...')
test_image_url = "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=640"

try:
    # Fotoğrafı indir
    req = urllib.request.Request(test_image_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        image_data = response.read()
    
    # NumPy array'e çevir
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    print(f'✅ Fotoğraf indirildi: {img.shape[1]}x{img.shape[0]}')
    
    # JPEG encode
    _, jpeg = cv2.imencode('.jpg', img)
    
    print('📤 Python AI API\'ye gönderiliyor...')
    
    # Python AI'ye gönder
    url = 'http://localhost:8000/analyze'
    files = {'file': ('test.jpg', jpeg.tobytes(), 'image/jpeg')}
    response = requests.post(url, files=files, timeout=30)
    
    print(f'\n✅ Status: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print('\n🎉 GERÇEK FOTOĞRAF İLE TEST!')
        print('\n📋 Sonuçlar:')
        print(json.dumps(data, indent=2))
        
        analysis = data.get('analysis', {})
        print(f'\n📊 ÖZET:')
        print(f'👥 Tespit Edilen Kişi: {analysis.get("person_count", 0)}')
        print(f'🔥 Yoğunluk: {analysis.get("crowd_density", 0)}%')
        print(f'📈 Seviye: {analysis.get("density_level", "unknown")}')
        print(f'⚡ İşlem Süresi: {analysis.get("processing_time_ms", 0)}ms')
        
        if analysis.get('heatmap_url'):
            print(f'🗺️ Heat Map: {analysis["heatmap_url"]}')
            print('\n💡 Heat map python-ai/static/ klasöründe oluşturuldu')
        
    else:
        print(f'❌ Hata: {response.text}')
        
except Exception as e:
    print(f'❌ Hata: {e}')
    import traceback
    traceback.print_exc()
