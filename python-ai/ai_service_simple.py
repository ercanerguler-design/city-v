from fastapi import FastAPI, File, UploadFile, Header, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import io
from PIL import Image
import time
from typing import Optional
import os
from datetime import datetime

app = FastAPI(title="CityV AI Service - Simple", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Klasörler
os.makedirs("static", exist_ok=True)

print("✅ CityV Simple AI Service - OpenCV Person Detection Ready!")

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "CityV Simple AI",
        "model": "OpenCV Haar Cascade",
        "features": ["person_detection", "crowd_density", "heat_maps"]
    }

@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    camera_id: Optional[str] = Header(None, alias="X-Camera-ID"),
    location_zone: Optional[str] = Header(None, alias="X-Location-Zone")
):
    """
    OpenCV ile basit insan tespiti (PyTorch gerektirmez)
    """
    start_time = time.time()
    
    try:
        # JPEG'i oku
        contents = await file.read()
        image_array = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Geçersiz görüntü")
        
        image_height, image_width = image.shape[:2]
        
        # Haar Cascade person detector
        person_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')
        upper_body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_upperbody.xml')
        
        # Gri tonlamaya çevir
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Full body detection
        full_body = person_cascade.detectMultiScale(gray, 1.1, 3, minSize=(30, 90))
        
        # Upper body detection (daha hassas)
        upper_body = upper_body_cascade.detectMultiScale(gray, 1.1, 3, minSize=(30, 60))
        
        # Tespit edilen kişileri birleştir
        detections = []
        all_boxes = []
        
        for (x, y, w, h) in full_body:
            detections.append({
                "type": "person",
                "confidence": 0.85,
                "bbox": [int(x), int(y), int(x+w), int(y+h)],
                "center": [int(x + w/2), int(y + h/2)],
                "area": int(w * h)
            })
            all_boxes.append([x, y, w, h])
        
        for (x, y, w, h) in upper_body:
            # Çakışma kontrolü
            overlap = False
            for box in all_boxes:
                if abs(x - box[0]) < 50 and abs(y - box[1]) < 50:
                    overlap = True
                    break
            
            if not overlap:
                detections.append({
                    "type": "person",
                    "confidence": 0.75,
                    "bbox": [int(x), int(y), int(x+w), int(y+h)],
                    "center": [int(x + w/2), int(y + h/2)],
                    "area": int(w * h)
                })
        
        person_count = len(detections)
        
        # Crowd density
        total_area = image_width * image_height
        occupied_area = sum([det["area"] for det in detections])
        crowd_density = (occupied_area / total_area) * 100.0
        
        # Density level
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
            heatmap_url = generate_heatmap(image, detections, camera_id, location_zone)
        
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
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "success": False}
        )

def generate_heatmap(image, detections, camera_id, location_zone):
    try:
        height, width = image.shape[:2]
        heatmap = np.zeros((height, width), dtype=np.float32)
        
        # Her kişi için Gaussian dağılım
        for det in detections:
            center_x, center_y = det["center"]
            bbox_width = det["bbox"][2] - det["bbox"][0]
            bbox_height = det["bbox"][3] - det["bbox"][1]
            
            radius = int(max(bbox_width, bbox_height) * 0.8)
            radius = max(50, min(radius, 200))
            
            cv2.circle(heatmap, (center_x, center_y), radius, 1.0, -1)
        
        # Gaussian blur
        heatmap = cv2.GaussianBlur(heatmap, (51, 51), 0)
        
        if heatmap.max() > 0:
            heatmap = heatmap / heatmap.max()
        
        # Renklendir
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        
        # Overlay
        overlay = cv2.addWeighted(image, 0.5, heatmap_colored, 0.5, 0)
        
        # Bounding box'ları çiz
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(overlay, f"Person {det['confidence']:.2f}", (x1, y1-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Kaydet
        timestamp = int(time.time())
        filename = f"heatmap_{camera_id}_{location_zone}_{timestamp}.jpg"
        filepath = os.path.join("static", filename)
        cv2.imwrite(filepath, overlay)
        
        return f"/static/{filename}"
        
    except Exception as e:
        print(f"❌ Heatmap hatası: {e}")
        return None

@app.get("/static/{filename}")
async def serve_heatmap(filename: str):
    filepath = os.path.join("static", filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="image/jpeg")
    else:
        raise HTTPException(status_code=404, detail="Heatmap bulunamadı")

if __name__ == "__main__":
    import uvicorn
    print("\n🚀 CityV Simple AI Service Starting...")
    print("📊 Features:")
    print("   - OpenCV Person Detection (Haar Cascade)")
    print("   - Real-time Crowd Density")
    print("   - Professional Heat Maps")
    print("   - No PyTorch Required!")
    print("\n✅ Service ready at http://localhost:8000")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
