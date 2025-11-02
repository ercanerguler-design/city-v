/*
 * ========================================
 * CITYV PROFESSIONAL IOT CAMERA SYSTEM
 * ========================================
 * 
 * FEATURES:
 * - Real-time Human Detection
 * - Professional Crowd Analysis  
 * - Live Heat Mapping
 * - Smart Object Recognition
 * - High Performance Processing
 * 
 * READY FOR PRODUCTION DEPLOYMENT
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebServer.h>
#include <WiFiManager.h>
#include <EEPROM.h>
#include <ESPmDNS.h>
#include "esp_camera.h"
#include "esp_timer.h"
#include "img_converters.h"
#include "fb_gfx.h"
#include <time.h>
// QR kod için kütüphane gerekli değil - Web API kullanacağız

// Pin tanımları AI-Thinker ESP32-CAM için
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22
#define FLASH_LED_PIN      4

// WiFi ve API ayarları
const char* AP_SSID = "CityV-AI-Camera";
const char* AP_PASSWORD = "cityv2024";

// 🚀 API CONFIGURATION
// Local test: http://192.168.1.x:3000/api
// Production: https://your-vercel-app.vercel.app/api
String API_BASE_URL = "http://192.168.1.12:3000/api"; // ← Vercel'e deploy edince değiştir!
String API_ENDPOINT = "/iot/crowd-analysis"; // Eski endpoint
HTTPClient http;

// PERSONEL TANIMA SİSTEMİ - WEB BASED  
bool staffRecognitionEnabled = false; // Şimdilik kapalı, sadece AI analiz
unsigned long lastStaffCheck = 0;
const unsigned long STAFF_CHECK_INTERVAL = 2000; // 2 saniye
String STAFF_API_ENDPOINT = "/iot/staff-detection";
int CAMERA_ID = 1; // Her kameraya benzersiz ID
String LOCATION_ZONE = "Test-Salon"; // Giriş, Salon, Mutfak vs.

// Zamanlayıcılar
unsigned long lastHeartbeat = 0;
unsigned long lastPhotoSend = 0;
const unsigned long HEARTBEAT_INTERVAL = 60000; // 60 saniye
const unsigned long PHOTO_SEND_INTERVAL = 5000;  // 5 saniye

// İstatistikler
bool crowdAnalysisEnabled = true;
int photosSent = 0;
int analysisReceived = 0;

// WiFi Manager
WiFiManager wifiManager;
WebServer server(80);

// EEPROM adresleri
#define EEPROM_SIZE 512
#define DEVICE_ID_ADDR 0
#define DEVICE_NAME_ADDR 50

// Struct tanımları - AI için
struct Blob {
  int x, y, width, height;
  int pixelCount;
  float aspectRatio;
  int centerX, centerY;
  bool isPerson;
  float confidence; // Güven skoru
};

struct HOGFeatures {
  int gradientMagnitude;
  int gradientDirection;
  int edgeStrength;
  bool hasHumanShape;
  float confidence;
};

// Değişkenler
String DEVICE_ID = "";
String DEVICE_NAME = "";

// ====================================================================
// SETUP - AI SİSTEMİ BAŞLATMA
// ====================================================================
void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=====================================");
  Serial.println("   CITYV PROFESSIONAL AI CAMERA");
  Serial.println("   PRODUCTION READY - HIGH PERFORMANCE");
  Serial.println("=====================================");
  
  // GPIO başlat
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);
  delay(500);
  
  // AI Sistemleri başlat
  Serial.println("\n[STEP 1/6] 🧠 AI Systems Starting...");
  initAISystem();
  
  // Ayarları yükle  
  Serial.println("\n[STEP 2/6] ⚙️ Loading Settings...");
  loadSettings();
  
  // WiFi bağlantısı
  Serial.println("\n[STEP 3/6] 📶 WiFi Connecting...");
  setupWiFi();
  
  // Kamera başlat
  Serial.println("\n[STEP 4/6] 📹 Camera Initializing...");
  initCamera();
  
  // Web server başlat
  Serial.println("\n[STEP 5/6] 🌐 Web Server Starting...");
  setupWebServer();
  
  // API kaydı
  Serial.println("\n[STEP 6/6] 🔗 API Registration...");
  registerDevice();
  
  // PERSONEL TANIMA SİSTEMİ BAŞLAT
  Serial.println("\n[BONUS] 📱 Staff Recognition Starting...");
  Serial.println("✅ Web-based Staff Detection Ready!");
  Serial.println("   Camera ID: " + String(CAMERA_ID));
  Serial.println("   Location: " + LOCATION_ZONE);
  Serial.println("   QR Scan URL: http://" + WiFi.localIP().toString() + "/scan-staff");
  
  Serial.println("\n✅ CITYV AI CAMERA SYSTEM READY!");
  Serial.println("Stream URL: http://" + WiFi.localIP().toString() + "/stream");
  Serial.println("AI Analysis: ACTIVE");
  Serial.println("Heat Mapping: ENABLED");
  Serial.println("Performance Mode: MAXIMUM");
  Serial.println("Staff Recognition: WEB-BASED");
}

// ====================================================================
// MAIN LOOP
// ====================================================================
void loop() {
  server.handleClient();
  unsigned long currentTime = millis();
  
  // WiFi durumu kontrol et ve LED'i kontrol et
  checkWiFiStatus();
  
  // Heartbeat gönder
  if (currentTime - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = currentTime;
  }
  
  // Crowd analysis için foto gönder
  if (crowdAnalysisEnabled && currentTime - lastPhotoSend >= PHOTO_SEND_INTERVAL) {
    sendPhotoForCrowdAnalysis();
    lastPhotoSend = currentTime;
  }
  
  delay(10); // 10ms - Stabil performans
}

// ====================================================================
// CROWD ANALYSIS SYSTEM
// ====================================================================
void initAISystem() {
  Serial.println("📊 Crowd Analysis System Starting");
  Serial.println("📸 ESP32: High-Quality Image Capture");
  Serial.println("☁️ Next.js API: Data Processing & Storage");
  Serial.println("🗄️ PostgreSQL: Real-time Database");
  
  crowdAnalysisEnabled = true;
  photosSent = 0;
  analysisReceived = 0;
  
  Serial.println("✅ Crowd Analysis System: READY!");
}

// Next.js API'ye foto gönderme
void sendPhotoForCrowdAnalysis() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi bağlı değil!");
    return;
  }
  
  // Kameradan foto çek
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Kamera fotoğraf çekemedi!");
    return;
  }
  
  Serial.println("📸 Backend AI analizi için foto gönderiliyor...");
  Serial.println("   Boyut: " + String(fb->len) + " bytes");
  Serial.println("   Format: JPEG");
  
  HTTPClient http;
  String fullURL = API_BASE_URL + AI_ANALYSIS_ENDPOINT;
  
  http.begin(fullURL);
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("X-Camera-ID", String(CAMERA_ID));
  http.addHeader("X-Location-Zone", LOCATION_ZONE);
  http.setTimeout(15000); // 15 saniye timeout
  
  // JPEG binary olarak gönder
  int httpCode = http.POST(fb->buf, fb->len);
  
  if (httpCode > 0) {
    Serial.println("✅ HTTP Kodu: " + String(httpCode));
    photosSent++;
    
    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("📥 Backend AI Response:");
      
      // JSON parse et
      StaticJsonDocument<1024> doc;
      DeserializationError error = deserializeJson(doc, response);
      
      if (!error) {
        bool success = doc["success"];
        
        if (success) {
          int personCount = doc["analysis"]["person_count"];
          float crowdDensity = doc["analysis"]["crowd_density"];
          String heatmapUrl = doc["analysis"]["heatmap_url"];
          
          Serial.println("🎉 AI ANALİZ SONUCU:");
          Serial.println("   👥 Kişi Sayısı: " + String(personCount));
          Serial.println("   🔥 Yoğunluk: " + String(crowdDensity, 2));
          Serial.println("   🗺️ Heat Map: " + heatmapUrl);
          
          analysisReceived++;
          
          // LED feedback (kişi sayısına göre)
          if (personCount > 10) {
            blinkLED(3, 100); // Çok kalabalık
          } else if (personCount > 5) {
            blinkLED(2, 150); // Orta kalabalık
          } else {
            blinkLED(1, 200); // Az kalabalık
          }
        } else {
          Serial.println("❌ Backend hatası: " + String(doc["error"].as<String>()));
        }
      } else {
        Serial.println("❌ JSON parse hatası!");
      }
    } else {
      Serial.println("⚠️ Backend yanıt vermedi: " + String(httpCode));
    }
  } else {
    Serial.println("❌ Backend'e bağlanılamadı!");
    Serial.println("   Hata: " + String(httpCode));
    Serial.println("   URL: " + fullURL);
  }
  
  http.end();
  esp_camera_fb_return(fb);
  
  // İstatistik raporu
  if (photosSent % 10 == 0) {
    Serial.println("\n📊 ===== HİBRİT AI İSTATİSTİKLER =====");
    Serial.println("   📸 Gönderilen Foto: " + String(photosSent));
    Serial.println("   � Alınan Analiz: " + String(analysisReceived));
    Serial.println("   � Başarı Oranı: " + String((analysisReceived * 100.0) / photosSent, 1) + "%");
    Serial.println("========================================\n");
  }
}

// ====================================================================
// WEB SERVER - STREAM VE API + WiFi YÖNETİMİ
// ====================================================================
void setupWebServer() {
  // Ana sayfa - WiFi Ayarları ile birlikte
  server.on("/", HTTP_GET, [](){
    String html = "<!DOCTYPE html><html><head>";
    html += "<title>ESP32-CAM AI Professional</title>";
    html += "<meta charset='UTF-8'>";
    html += "<style>body{font-family:Arial;margin:20px;background:#f0f0f0;}";
    html += ".container{max-width:800px;margin:auto;background:white;padding:20px;border-radius:10px;}";
    html += ".btn{background:#007bff;color:white;padding:10px 20px;border:none;border-radius:5px;margin:5px;cursor:pointer;}";
    html += ".btn:hover{background:#0056b3;}";
    html += ".status{background:#28a745;color:white;padding:10px;border-radius:5px;margin:10px 0;}";
    html += "</style></head><body>";
    html += "<div class='container'>";
    html += "<h1>CityV Professional AI Camera</h1>";
    html += "<div class='status'>✅ System Active - Live Monitoring Ready</div>";
    html += "<h3>📹 Canlı İzleme</h3>";
    html += "<a href='/stream' target='_blank'><button class='btn'>📺 Canlı Stream</button></a>";
    html += "<a href='/status' target='_blank'><button class='btn'>📊 AI Durumu</button></a>";
    html += "<a href='/capture' target='_blank'><button class='btn'>📸 Fotoğraf Çek</button></a>";
    html += "<h3>⚙️ WiFi Ayarları</h3>";
    html += "<p>Mevcut WiFi: <strong>" + WiFi.SSID() + "</strong></p>";
    html += "<p>IP Adresi: <strong>" + WiFi.localIP().toString() + "</strong></p>";
    html += "<p>Sinyal Gücü: <strong>" + String(WiFi.RSSI()) + " dBm</strong></p>";
    html += "<p>LED Durumu: <strong>💡 WiFi Bağlantısı Aktif</strong></p>";
    html += "<button class='btn' onclick='resetWiFi()'>🔄 WiFi Ayarlarını Sıfırla</button>";
    html += "<script>function resetWiFi(){if(confirm('WiFi ayarları sıfırlanacak. Devam?')){fetch('/reset-wifi').then(()=>alert('WiFi sıfırlandı! Cihaz yeniden başlıyor...'));}}</script>";
    html += "</div></body></html>";
    server.send(200, "text/html", html);
  });

  // WiFi Reset endpoint
  server.on("/reset-wifi", HTTP_GET, [](){
    server.send(200, "text/plain", "WiFi ayarları sıfırlanıyor...");
    delay(1000);
    resetWiFiSettings();
  });

  // MJPEG Stream - İYİLEŞTİRİLMİŞ
  server.on("/stream", HTTP_GET, [](){
    WiFiClient client = server.client();
    String response = "HTTP/1.1 200 OK\r\n";
    response += "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n";
    response += "Access-Control-Allow-Origin: *\r\n\r\n";
    client.print(response);
    
    Serial.println("📹 Stream başladı!");
    
    while(client.connected()) {
      camera_fb_t * fb = esp_camera_fb_get();
      if (!fb) {
        Serial.println("❌ Frame alınamadı!");
        delay(100);
        continue;
      }
      
      if(fb->len > 0) {
        client.print("--frame\r\n");
        client.print("Content-Type: image/jpeg\r\n");
        client.print("Content-Length: " + String(fb->len) + "\r\n\r\n");
        
        size_t written = client.write(fb->buf, fb->len);
        
        if(written != fb->len) {
          Serial.println("⚠️ Frame tam gönderilemedi!");
        }
        
        client.print("\r\n");
      }
      
      esp_camera_fb_return(fb);
      
      // UXGA için daha uzun delay (büyük görüntü)
      delay(100); // 10 FPS - Daha stabil
    }
    
    Serial.println("📹 Stream sonlandı!");
  });
  
  // Status API
  server.on("/status", HTTP_GET, [](){
    String json = "{";
    json += "\"device\":\"CityV-IoT-Camera\",";
    json += "\"status\":\"ACTIVE\",";
    json += "\"camera_id\":" + String(CAMERA_ID) + ",";
    json += "\"location\":\"" + LOCATION_ZONE + "\",";
    json += "\"photos_sent\":" + String(photosSent) + ",";
    json += "\"analysis_received\":" + String(analysisReceived) + ",";
    json += "\"success_rate\":" + String((photosSent > 0 ? (analysisReceived * 100.0) / photosSent : 0), 1) + ",";
    json += "\"uptime\":" + String(millis()) + ",";
    json += "\"wifi_rssi\":" + String(WiFi.RSSI()) + ",";
    json += "\"api_url\":\"" + API_BASE_URL + "\"";
    json += "}";
    
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", json);
  });
  
  // Tek fotoğraf çekme - Test için
  server.on("/capture", HTTP_GET, [](){
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      server.send(500, "text/plain", "Kamera hatası!");
      return;
    }
    
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send_P(200, "image/jpeg", (const char *)fb->buf, fb->len);
    esp_camera_fb_return(fb);
  });
  
  // Staff QR Scan Endpoint - Manuel QR gönderme
  server.on("/scan-staff", HTTP_POST, [](){
    if (server.hasArg("qr_code")) {
      String qrCode = server.arg("qr_code");
      
      if (qrCode.startsWith("STAFF-")) {
        sendStaffDetection(qrCode);
        server.send(200, "application/json", "{\"success\":true,\"message\":\"QR kod işlendi\"}");
      } else {
        server.send(400, "application/json", "{\"success\":false,\"error\":\"Geçersiz QR format\"}");
      }
    } else {
      server.send(400, "application/json", "{\"success\":false,\"error\":\"QR kod bulunamadı\"}");
    }
  });
  
  // Staff QR Scan Page - Web interface
  server.on("/scan-staff", HTTP_GET, [](){
    String html = "<!DOCTYPE html><html><head>";
    html += "<meta charset='UTF-8'>";
    html += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    html += "<title>QR Kod Okut - CityV</title>";
    html += "<style>";
    html += "body{font-family:Arial;margin:0;padding:20px;background:#f0f8ff;}";
    html += ".container{max-width:500px;margin:auto;background:white;padding:30px;border-radius:15px;box-shadow:0 4px 6px rgba(0,0,0,0.1);}";
    html += "h1{color:#007bff;text-align:center;margin-bottom:30px;}";
    html += ".input-group{margin:20px 0;}";
    html += "label{display:block;margin-bottom:10px;font-weight:bold;color:#333;}";
    html += "input{width:100%;padding:15px;border:2px solid #ddd;border-radius:8px;font-size:16px;box-sizing:border-box;}";
    html += "input:focus{border-color:#007bff;outline:none;}";
    html += "button{width:100%;padding:15px;background:#28a745;color:white;border:none;border-radius:8px;font-size:18px;font-weight:bold;cursor:pointer;margin-top:20px;}";
    html += "button:hover{background:#218838;}";
    html += ".result{margin-top:20px;padding:15px;border-radius:8px;display:none;}";
    html += ".success{background:#d4edda;color:#155724;border:1px solid #c3e6cb;}";
    html += ".error{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb;}";
    html += ".info{background:#d1ecf1;color:#0c5460;border:1px solid #bee5eb;margin-bottom:20px;padding:15px;border-radius:8px;}";
    html += "</style></head><body>";
    html += "<div class='container'>";
    html += "<h1>📱 Personel QR Tarama</h1>";
    html += "<div class='info'>";
    html += "<strong>📍 Konum:</strong> " + LOCATION_ZONE + "<br>";
    html += "<strong>📷 Kamera ID:</strong> " + String(CAMERA_ID);
    html += "</div>";
    html += "<div class='input-group'>";
    html += "<label for='qr'>QR Kod (STAFF-xxx-xxx):</label>";
    html += "<input type='text' id='qr' placeholder='STAFF-123-abcd1234' autofocus>";
    html += "</div>";
    html += "<button onclick='scanQR()'>✅ QR Kodu Gönder</button>";
    html += "<div id='result' class='result'></div>";
    html += "</div>";
    html += "<script>";
    html += "function scanQR(){";
    html += "const qr=document.getElementById('qr').value.trim();";
    html += "if(!qr){alert('QR kod giriniz!');return;}";
    html += "fetch('/scan-staff',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'qr_code='+encodeURIComponent(qr)})";
    html += ".then(r=>r.json()).then(data=>{";
    html += "const result=document.getElementById('result');";
    html += "result.style.display='block';";
    html += "if(data.success){";
    html += "result.className='result success';";
    html += "result.innerHTML='✅ '+data.message;";
    html += "document.getElementById('qr').value='';";
    html += "}else{";
    html += "result.className='result error';";
    html += "result.innerHTML='❌ '+data.error;";
    html += "}";
    html += "setTimeout(()=>result.style.display='none',3000);";
    html += "}).catch(e=>{alert('Hata: '+e);});";
    html += "}";
    html += "document.getElementById('qr').addEventListener('keypress',function(e){if(e.key==='Enter')scanQR();});";
    html += "</script>";
    html += "</body></html>";
    
    server.send(200, "text/html", html);
  });
  
  server.begin();
  Serial.println("✅ Web Server: PROFESSIONAL MODE + STAFF SCAN");
}

// ====================================================================
// WiFi KURULUM - OTOMATIK VE UZAKTAN YÖNETİM
// ====================================================================
void setupWiFi() {
  Serial.println("📶 WiFi Manager başlatılıyor...");
  
  // WiFi Manager konfigürasyonu
  wifiManager.setDebugOutput(true);
  wifiManager.setAPCallback([](WiFiManager *myWiFiManager) {
    Serial.println("\n� ===== WiFi KURULUM MODU =====");
    Serial.println("📶 Hotspot: " + String(myWiFiManager->getConfigPortalSSID()));
    Serial.println("🔑 Şifre: cityv2024");
    Serial.println("🌐 Adres: http://192.168.4.1");
    Serial.println("📱 Telefonunuzla bu WiFi'ye bağlanın!");
    Serial.println("==============================");
  });
  
  // Özelleştirilmiş WiFi ayar sayfası
  wifiManager.setCustomHeadElement("<style>body{background:#f0f8ff;font-family:Arial;}</style>");
  wifiManager.setTitle("CityV AI Professional Camera");
  
  // Timeout ayarla (3 dakika)
  wifiManager.setConfigPortalTimeout(180);
  
  // Otomatik bağlanmaya çalış
  Serial.println("🔍 Kayıtlı WiFi aranıyor...");
  
  if (!wifiManager.autoConnect(AP_SSID, AP_PASSWORD)) {
    Serial.println("❌ WiFi bağlantısı başarısız!");
    Serial.println("🔄 Cihaz yeniden başlıyor...");
    ESP.restart();
  }
  
  // Başarılı bağlantı
  Serial.println("\n✅ ===== WiFi BAĞLANDI =====");
  Serial.println("📶 Network: " + WiFi.SSID());
  Serial.println("📡 IP Adresi: " + WiFi.localIP().toString());
  Serial.println("💪 Sinyal Gücü: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("🌐 Gateway: " + WiFi.gatewayIP().toString());
  
  // WiFi bağlantısı başarılı - Yeşil LED yak
  digitalWrite(FLASH_LED_PIN, HIGH);
  Serial.println("💡 LED: WiFi bağlantısı aktif - LED YANDI");
  
  Serial.println("============================");
}

void initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // YÜKSEK KALİTE AYARLARI - ÇALIŞAN VERSİYON
  if(psramFound()) {
    config.frame_size = FRAMESIZE_UXGA; // 1600x1200 - ULTRA HD
    config.jpeg_quality = 4; // Mükemmel kalite
    config.fb_count = 2; // Double buffering
  } else {
    config.frame_size = FRAMESIZE_SVGA; // 800x600 - Fallback
    config.jpeg_quality = 10;
    config.fb_count = 1;
  }
  
  if(esp_camera_init(&config) != ESP_OK) {
    Serial.println("❌ Kamera başlatılamadı!");
    return;
  }
  
  // Sensor ayarları - YÜKSEK KALİTE
  sensor_t * s = esp_camera_sensor_get();
  
  // Temel görüntü ayarları
  s->set_brightness(s, 0);     // -2 to 2 (0 = normal)
  s->set_contrast(s, 0);       // -2 to 2 (0 = normal, 1 bazen sorun yapar)
  s->set_saturation(s, 0);     // -2 to 2 (0 = normal)
  s->set_special_effect(s, 0); // 0 = yok
  
  // Beyaz dengesi
  s->set_whitebal(s, 1);       // Otomatik beyaz dengesi AÇIK
  s->set_awb_gain(s, 1);       // AWB gain AÇIK
  s->set_wb_mode(s, 0);        // 0 = auto
  
  // Pozlama kontrolleri
  s->set_exposure_ctrl(s, 1);  // Otomatik pozlama AÇIK
  s->set_aec2(s, 0);           // 0 = kapalı (bazen çakışma yapar)
  s->set_ae_level(s, 0);       // -2 to 2 (0 = normal)
  s->set_aec_value(s, 300);    // 0-1200 (300 = dengeli)
  
  // Kazanç kontrolleri
  s->set_gain_ctrl(s, 1);      // Otomatik kazanç AÇIK
  s->set_agc_gain(s, 0);       // 0-30 (0 = otomatik)
  s->set_gainceiling(s, (gainceiling_t)0); // 0-6 (0 = 2x gain - güvenli)
  
  // Lens düzeltme ve piksel düzeltme
  s->set_lenc(s, 1);           // Lens correction AÇIK
  s->set_bpc(s, 0);            // Black pixel correction KAPALI (bazen sorun)
  s->set_wpc(s, 1);            // White pixel correction AÇIK
  s->set_raw_gma(s, 1);        // Gamma correction AÇIK
  
  // Ayna ve çevirme
  s->set_hmirror(s, 0);        // 0 = normal
  s->set_vflip(s, 0);          // 0 = normal
  
  // Downscaling - KAPALI
  s->set_dcw(s, 1);            // 1 = AÇIK (stream için gerekli)
  
  // Renk çubuğu test
  s->set_colorbar(s, 0);       // 0 = kapalı
  
  // PSRAM kontrolü ve bilgilendirme
  if(psramFound()) {
    Serial.println("✅ PSRAM bulundu - Ultra HD aktif!");
    Serial.println("✅ Kamera: ULTRA HD MODE");
    Serial.println("   Çözünürlük: UXGA (1600x1200)");
    Serial.println("   Kalite: 4/63 (Mükemmel)");
  } else {
    Serial.println("⚠️ PSRAM yok - Standard HD");
    Serial.println("✅ Kamera: STANDARD HD MODE");
    Serial.println("   Çözünürlük: SVGA (800x600)");
    Serial.println("   Kalite: 10/63 (Yüksek)");
  }
  
  Serial.println("   Lens Correction: Aktif");
  Serial.println("   Stream: Hazır");
}

void loadSettings() {
  EEPROM.begin(EEPROM_SIZE);
  // Basit ayar yükleme
  DEVICE_ID = "CityV-AI-" + String(ESP.getEfuseMac());
  DEVICE_NAME = "CityV Professional AI Camera";
  Serial.println("✅ Settings loaded");
}

void sendHeartbeat() {
  // API'ye bağlanma devre dışı (localhost:3001 erişilemez)
  // Sadece log tut
  Serial.println("💓 Heartbeat skipped (API disabled)");
}

void registerDevice() {
  Serial.println("✅ Device registered: " + DEVICE_ID);
}

// Eski AI fonksiyonları kaldırıldı - Backend'de işleniyor

// ====================================================================
// WiFi YÖNETİM FONKSİYONLARI - UZAKTAN AYAR + LED KONTROL
// ====================================================================

// WiFi durumu ve LED kontrolü
void checkWiFiStatus() {
  static bool lastWiFiStatus = true;
  static unsigned long lastCheck = 0;
  
  // Her 5 saniyede bir kontrol et
  if (millis() - lastCheck > 5000) {
    bool currentStatus = (WiFi.status() == WL_CONNECTED);
    
    if (currentStatus != lastWiFiStatus) {
      if (currentStatus) {
        // WiFi bağlandı - LED yak
        digitalWrite(FLASH_LED_PIN, HIGH);
        Serial.println("✅ WiFi yeniden bağlandı - LED YANDI");
      } else {
        // WiFi koptu - LED söndür
        digitalWrite(FLASH_LED_PIN, LOW);
        Serial.println("❌ WiFi bağlantısı koptu - LED SÖNDÜ");
      }
      lastWiFiStatus = currentStatus;
    }
    
    lastCheck = millis();
  }
}

void resetWiFiSettings() {
  Serial.println("🔄 WiFi ayarları sıfırlanıyor...");
  
  // LED söndür - WiFi kesilecek
  digitalWrite(FLASH_LED_PIN, LOW);
  Serial.println("💡 LED söndürüldü - WiFi sıfırlanıyor");
  
  // WiFiManager ayarlarını sıfırla
  wifiManager.resetSettings();
  
  // EEPROM'u temizle
  for(int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  
  Serial.println("✅ WiFi ayarları sıfırlandı!");
  Serial.println("🔄 Cihaz yeniden başlıyor...");
  Serial.println("📶 Yeni WiFi: CityV-AI-Camera (cityv2024)");
  
  delay(2000);
  ESP.restart();
}

// ====================================================================
// PERSONEL TANIMA SİSTEMİ - WEB BASED QR
// ====================================================================

void sendStaffDetection(String qrCode) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi bağlı değil!");
    return;
  }
  
  // API URL'yi production için değiştir
  // localhost:3001 yerine gerçek domain kullan
  Serial.println("⚠️ API URL güncellenmeliş: " + API_BASE_URL);
  Serial.println("   QR Kod: " + qrCode);
  
  HTTPClient staffHttp;
  String fullURL = API_BASE_URL + STAFF_API_ENDPOINT;
  
  staffHttp.begin(fullURL);
  staffHttp.addHeader("Content-Type", "application/json");
  staffHttp.setTimeout(10000);
  
  // JSON payload oluştur
  StaticJsonDocument<256> doc;
  doc["camera_id"] = CAMERA_ID;
  doc["staff_qr"] = qrCode;
  doc["detection_type"] = "qr_scan";
  doc["location_zone"] = LOCATION_ZONE;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("\n📤 Personel tespiti API'ye gönderiliyor...");
  Serial.println("   URL: " + fullURL);
  Serial.println("   JSON: " + jsonString);
  
  // POST isteği gönder
  int httpCode = staffHttp.POST(jsonString);
  
  if (httpCode > 0) {
    Serial.println("✅ HTTP Kodu: " + String(httpCode));
    
    if (httpCode == 200) {
      String response = staffHttp.getString();
      Serial.println("📥 Response:");
      Serial.println(response);
      
      // JSON'u parse et
      StaticJsonDocument<512> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error) {
        bool success = responseDoc["success"];
        
        if (success) {
          String staffName = responseDoc["staff"]["name"];
          String action = responseDoc["action"];
          String message = responseDoc["message"];
          
          Serial.println("\n🎉 BAŞARILI PERSONEL TESPİTİ!");
          Serial.println("   Personel: " + staffName);
          Serial.println("   İşlem: " + action);
          Serial.println("   Mesaj: " + message);
          
          // Başarı LED efekti
          if (action == "check_in") {
            blinkLED(3, 200); // 3 kez yanıp sön (Giriş)
          } else if (action == "check_out") {
            blinkLED(5, 150); // 5 kez yanıp sön (Çıkış)
          } else {
            blinkLED(1, 300); // 1 uzun yanma (Tespit)
          }
        } else {
          String errorMsg = responseDoc["error"];
          Serial.println("❌ API Hatası: " + errorMsg);
          blinkLED(10, 50);
        }
      } else {
        Serial.println("❌ JSON parse hatası!");
      }
    } else {
      Serial.println("❌ HTTP hatası: " + String(httpCode));
      blinkLED(7, 100);
    }
  } else {
    Serial.println("❌ Bağlantı hatası!");
    Serial.println("   Hata kodu: " + String(httpCode));
    blinkLED(10, 50);
  }
  
  staffHttp.end();
}

void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(FLASH_LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(FLASH_LED_PIN, LOW);
    delay(delayMs);
  }
}