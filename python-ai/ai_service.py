from fastapi import FastAPI, File, UploadFile, Header, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from ultralytics import YOLO
import io
from PIL import Image
import time
from typing import Optional
import os
from datetime import datetime
import json

app = FastAPI(title="CityV AI Service - Production", version="1.0.0")

# CORS - Next.js'ten gelen istekleri kabul et
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production'da domain'e kısıtla
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# YOLOv8 model yükle (ilk çalıştırmada otomatik indirilir)
print("🤖 YOLOv8 model yükleniyor...")
model = YOLO('yolov8n.pt')  # Nano model - hızlı ve hafif (50-150ms)
print("✅ YOLOv8n model hazır!")

# Heatmap klasörü oluştur
os.makedirs("heatmaps", exist_ok=True)
os.makedirs("static", exist_ok=True)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "CityV Real AI",
        "model": "YOLOv8n",
        "features": ["person_detection", "crowd_density", "heat_maps", "entry_exit_tracking"]
    }

@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    camera_id: Optional[str] = Header(None, alias="X-Camera-ID"),
    location_zone: Optional[str] = Header(None, alias="X-Location-Zone")
):
    """
    Gerçek AI analizi - YOLOv8 person detection
    """
    start_time = time.time()
    
    try:
        # JPEG'i oku ve numpy array'e çevir
        contents = await file.read()
        image_array = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Geçersiz görüntü")
        
        image_height, image_width = image.shape[:2]
        
        # YOLOv8 ile person detection (class 0 = person)
        results = model(image, classes=[0], conf=0.4, verbose=False)
        
        # Tespit edilen kişiler
        detections = []
        bounding_boxes = []
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Bounding box koordinatları
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                
                bbox = [int(x1), int(y1), int(x2), int(y2)]
                
                detections.append({
                    "type": "person",
                    "confidence": round(confidence, 3),
                    "bbox": bbox,
                    "center": [int((x1 + x2) / 2), int((y1 + y2) / 2)],
                    "area": int((x2 - x1) * (y2 - y1))
                })
                
                bounding_boxes.append(bbox)
        
        person_count = len(detections)
        
        # Crowd density hesapla (alan bazlı)
        total_area = image_width * image_height
        occupied_area = sum([det["area"] for det in detections])
        crowd_density = (occupied_area / total_area) * 100.0
        
        # Yoğunluk seviyesi
        if crowd_density < 5:
            density_level = "low"
            density_score = 1
        elif crowd_density < 15:
            density_level = "medium-low"
            density_score = 3
        elif crowd_density < 30:
            density_level = "medium"
            density_score = 5
        elif crowd_density < 50:
            density_level = "high"
            density_score = 7
        else:
            density_level = "critical"
            density_score = 10
        
        # Heat map oluştur
        heatmap_url = None
        if person_count > 0:
            heatmap_url = generate_heatmap(
                image, 
                detections, 
                camera_id, 
                location_zone
            )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return {
            "success": True,
            "camera_id": int(camera_id) if camera_id else 0,
            "location_zone": location_zone or "Unknown",
            "analysis": {
                "person_count": person_count,
                "crowd_density": round(crowd_density, 2),
                "density_level": density_level,
                "density_score": density_score,
                "detection_objects": detections,
                "heatmap_url": heatmap_url,
                "processing_time_ms": processing_time,
                "image_resolution": f"{image_width}x{image_height}",
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        print(f"❌ AI Analiz Hatası: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "success": False}
        )

def generate_heatmap(image, detections, camera_id, location_zone):
    """
    Profesyonel ısı haritası oluştur
    """
    try:
        height, width = image.shape[:2]
        
        # Boş heatmap oluştur
        heatmap = np.zeros((height, width), dtype=np.float32)
        
        # Her kişi tespiti için Gaussian dağılım ekle
        for det in detections:
            center_x, center_y = det["center"]
            bbox_width = det["bbox"][2] - det["bbox"][0]
            bbox_height = det["bbox"][3] - det["bbox"][1]
            
            # Kişinin boyutuna göre radius ayarla
            radius = int(max(bbox_width, bbox_height) * 0.8)
            radius = max(50, min(radius, 200))  # 50-200 pixel arası
            
            # Gaussian blur ile yoğunluk haritası
            cv2.circle(heatmap, (center_x, center_y), radius, 1.0, -1)
        
        # Gaussian blur uygula (daha yumuşak geçişler)
        heatmap = cv2.GaussianBlur(heatmap, (51, 51), 0)
        
        # Normalize et
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()
        
        # Renklendir (JET colormap - mavi soğuk, kırmızı sıcak)
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap), 
            cv2.COLORMAP_JET
        )
        
        # Orijinal görüntü ile birleştir (overlay)
        overlay = cv2.addWeighted(image, 0.5, heatmap_colored, 0.5, 0)
        
        # Bounding box'ları çiz
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            confidence = det["confidence"]
            
            # Yeşil kutu
            cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Confidence label
            label = f"Person {confidence:.2f}"
            cv2.putText(
                overlay, 
                label, 
                (x1, y1 - 10), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                0.5, 
                (0, 255, 0), 
                2
            )
        
        # Kaydet
        timestamp = int(time.time())
        filename = f"heatmap_{camera_id}_{location_zone}_{timestamp}.jpg"
        filepath = os.path.join("static", filename)
        cv2.imwrite(filepath, overlay)
        
        return f"/static/{filename}"
        
    except Exception as e:
        print(f"❌ Heatmap oluşturma hatası: {e}")
        return None

@app.get("/static/{filename}")
async def serve_heatmap(filename: str):
    """
    Heatmap dosyalarını servis et
    """
    filepath = os.path.join("static", filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="image/jpeg")
    else:
        raise HTTPException(status_code=404, detail="Heatmap bulunamadı")

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 CityV Real AI Service Starting...")
    print("📊 Features:")
    print("   - YOLOv8n Person Detection")
    print("   - Real-time Crowd Density")
    print("   - Professional Heat Maps")
    print("   - Entry/Exit Tracking Ready")
    print("\n✅ Service ready at http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
