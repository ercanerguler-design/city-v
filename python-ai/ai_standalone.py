"""
🚀 CityV AI - Standalone Server
ESP32 → Python AI → Database (direkt bağlantı)
"""

from fastapi import FastAPI, File, UploadFile, Header, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import cv2
import numpy as np
from datetime import datetime
import os
import json
import asyncpg
from dotenv import load_dotenv
import time

# .env dosyasını yükle
load_dotenv()

app = FastAPI(title="CityV AI Standalone")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL')
if not DATABASE_URL:
    print("⚠️ DATABASE_URL bulunamadı! .env dosyasını kontrol et")

# OpenCV Haar Cascade models
FULLBODY_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')
UPPERBODY_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_upperbody.xml')

def detect_persons(image):
    """OpenCV Haar Cascade ile insan tespiti"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Full body detection
    fullbodies = FULLBODY_CASCADE.detectMultiScale(gray, 1.1, 3, minSize=(30, 90))
    
    # Upper body detection
    upperbodies = UPPERBODY_CASCADE.detectMultiScale(gray, 1.1, 3, minSize=(30, 60))
    
    # Combine detections
    all_detections = list(fullbodies) + list(upperbodies)
    
    # Non-maximum suppression (basit)
    unique_detections = []
    for x, y, w, h in all_detections:
        is_duplicate = False
        for x2, y2, w2, h2 in unique_detections:
            # Overlap kontrolü
            if abs(x - x2) < 50 and abs(y - y2) < 50:
                is_duplicate = True
                break
        if not is_duplicate:
            unique_detections.append((x, y, w, h))
    
    return unique_detections

def generate_heatmap(image, detections):
    """Heat map oluştur"""
    height, width = image.shape[:2]
    heatmap = np.zeros((height, width), dtype=np.float32)
    
    # Her tespit için Gaussian blob ekle
    for (x, y, w, h) in detections:
        center_x, center_y = x + w//2, y + h//2
        radius = max(w, h) // 2
        
        y1, y2 = max(0, center_y - radius), min(height, center_y + radius)
        x1, x2 = max(0, center_x - radius), min(width, center_x + radius)
        
        if y2 > y1 and x2 > x1:
            heatmap[y1:y2, x1:x2] += 1.0
    
    # Gaussian blur
    if heatmap.max() > 0:
        heatmap = cv2.GaussianBlur(heatmap, (99, 99), 0)
        heatmap = heatmap / heatmap.max() if heatmap.max() > 0 else heatmap
    
    # Colormap
    heatmap_colored = cv2.applyColorMap((heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET)
    
    # Overlay
    result = cv2.addWeighted(image, 0.6, heatmap_colored, 0.4, 0)
    
    # Bounding boxes çiz
    for (x, y, w, h) in detections:
        cv2.rectangle(result, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(result, 'Person', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    return result

async def save_to_database(camera_id, location_zone, person_count, crowd_density, detection_objects, heatmap_url, image_size, processing_time_ms):
    """Veritabanına kaydet"""
    if not DATABASE_URL:
        print("⚠️ Database URL yok, kayıt atlanıyor")
        return None
    
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        result = await conn.fetchrow("""
            INSERT INTO iot_ai_analysis 
            (camera_id, location_zone, person_count, crowd_density, detection_objects, heatmap_url, image_size, processing_time_ms)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, created_at
        """, camera_id, location_zone, person_count, crowd_density, json.dumps(detection_objects), heatmap_url, image_size, processing_time_ms)
        
        await conn.close()
        
        print(f"✅ Database kaydedildi: ID {result['id']}")
        return dict(result)
        
    except Exception as e:
        print(f"❌ Database hatası: {e}")
        return None

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "CityV AI Standalone",
        "model": "OpenCV Haar Cascade",
        "features": ["person_detection", "crowd_density", "heat_maps", "database_integration"]
    }

@app.post("/esp32/analyze")
async def esp32_analyze(
    request: Request,
    x_camera_id: str = Header("1"),
    x_location_zone: str = Header("Unknown")
):
    """ESP32'den gelen fotoğrafı analiz et"""
    start_time = time.time()
    
    try:
        # Raw body data al (ESP32 JPEG binary gönderir)
        image_data = await request.body()
        
        # JPEG decode
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return JSONResponse({"success": False, "error": "Invalid image"}, status_code=400)
        
        height, width = image.shape[:2]
        image_size = len(image_data)
        
        print(f"📸 ESP32 analiz: Camera {x_camera_id}, Zone {x_location_zone}, {width}x{height}, {image_size} bytes")
        
        # İnsan tespiti
        detections = detect_persons(image)
        person_count = len(detections)
        
        # Yoğunluk hesapla
        area = width * height
        crowd_density = (person_count / area) * 10000 if area > 0 else 0.0
        
        # Density level
        if crowd_density < 0.5:
            density_level = "low"
            density_score = 1
        elif crowd_density < 1.5:
            density_level = "medium"
            density_score = 2
        else:
            density_level = "high"
            density_score = 3
        
        # Detection objects
        detection_objects = [
            {
                "label": "person",
                "confidence": 0.75,
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h)
            }
            for x, y, w, h in detections
        ]
        
        # Heat map oluştur
        heatmap_url = None
        if person_count > 0:
            heatmap_image = generate_heatmap(image, detections)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            heatmap_filename = f"heatmap_{x_camera_id}_{timestamp}.jpg"
            heatmap_path = os.path.join("static", heatmap_filename)
            cv2.imwrite(heatmap_path, heatmap_image)
            heatmap_url = f"/static/{heatmap_filename}"
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Database'e kaydet
        db_result = await save_to_database(
            int(x_camera_id),
            x_location_zone,
            person_count,
            crowd_density,
            detection_objects,
            heatmap_url,
            image_size,
            processing_time_ms
        )
        
        print(f"✅ Analiz tamamlandı: {person_count} kişi, {crowd_density:.2f}% yoğunluk, {processing_time_ms}ms")
        
        return {
            "success": True,
            "camera_id": int(x_camera_id),
            "location_zone": x_location_zone,
            "analysis": {
                "person_count": person_count,
                "crowd_density": round(crowd_density, 2),
                "density_level": density_level,
                "density_score": density_score,
                "detection_objects": detection_objects,
                "heatmap_url": heatmap_url,
                "processing_time_ms": processing_time_ms,
                "image_resolution": f"{width}x{height}",
                "timestamp": datetime.now().isoformat()
            },
            "database": {
                "saved": db_result is not None,
                "id": db_result['id'] if db_result else None
            }
        }
        
    except Exception as e:
        print(f"❌ Analiz hatası: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    print("🚀 CityV AI Standalone Server başlatılıyor...")
    print("📡 ESP32 endpoint: POST /esp32/analyze")
    print("🗄️ Database integration: ACTIVE" if DATABASE_URL else "⚠️ Database integration: DISABLED")
    uvicorn.run(app, host="0.0.0.0", port=8000)
