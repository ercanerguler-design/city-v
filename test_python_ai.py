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
print('📤 Python AI API\'ye direkt gönderiliyor...')

# Python AI'ye direk gönder
url = 'http://localhost:8000/analyze'

try:
    files = {'file': ('test.jpg', jpeg.tobytes(), 'image/jpeg')}
    response = requests.post(url, files=files, timeout=30)
    
    print(f'\n✅ Status: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print('\n🎉 PYTHON AI ÇALIŞIYOR!')
        print('\n� Full Response:')
        print(json.dumps(data, indent=2))
        
    else:
        print(f'❌ Hata: {response.text}')
        
except Exception as e:
    print(f'❌ Bağlantı hatası: {e}')
    import traceback
    traceback.print_exc()
