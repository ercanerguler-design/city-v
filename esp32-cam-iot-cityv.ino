#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WebServer.h>
#include <WiFiManager.h>
#include <EEPROM.h>
#include "esp_camera.h"
#include "esp_timer.h"
#include "img_converters.h"
#include "fb_gfx.h"
#include "fd_forward.h"
#include "fr_forward.h"

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

// Flash LED pin
#define FLASH_LED_PIN      4

// WiFi ve API ayarları
const char* AP_SSID = "ESP32-CAM-Setup";
const char* AP_PASSWORD = "cityv2024";

// City-V API endpoints
String API_BASE_URL = "https://cityv.app/api";  // Buraya gerçek URL'inizi yazın
String DEVICE_ID = "";
String DEVICE_NAME = "";
String LOCATION_TYPE = "";
String STOP_NAME = "";
String LINE_CODE = "";
String CITY_NAME = "";

// Timing ayarları
unsigned long lastHeartbeat = 0;
unsigned long lastAnalysis = 0;
const unsigned long HEARTBEAT_INTERVAL = 30000; // 30 saniye
const unsigned long ANALYSIS_INTERVAL = 15000;  // 15 saniye

// WiFi Manager
WiFiManager wifiManager;
WebServer server(80);

// EEPROM adresleri
#define EEPROM_SIZE 512
#define DEVICE_ID_ADDR 0
#define DEVICE_NAME_ADDR 50
#define LOCATION_TYPE_ADDR 100
#define STOP_NAME_ADDR 150
#define LINE_CODE_ADDR 200
#define CITY_NAME_ADDR 250
#define API_URL_ADDR 300

void setup() {
  Serial.begin(115200);
  Serial.println("\n🚀 ESP32-CAM City-V IoT Sistemi Başlatılıyor...");
  
  // EEPROM başlat
  EEPROM.begin(EEPROM_SIZE);
  
  // Flash LED setup
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);
  
  // Kamera başlat
  initCamera();
  
  // Kayıtlı ayarları yükle
  loadSettings();
  
  // WiFi bağlantısı
  setupWiFi();
  
  // Web server başlat
  setupWebServer();
  
  // Cihazı API'ye kaydet
  registerDevice();
  
  Serial.println("✅ ESP32-CAM hazır!");
  Serial.println("📱 Konfigürasyon: http://" + WiFi.localIP().toString());
}

void loop() {
  server.handleClient();
  
  unsigned long currentTime = millis();
  
  // Heartbeat gönder
  if (currentTime - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = currentTime;
  }
  
  // Yoğunluk analizi yap
  if (currentTime - lastAnalysis >= ANALYSIS_INTERVAL) {
    performCrowdAnalysis();
    lastAnalysis = currentTime;
  }
  
  delay(1000);
}

void initCamera() {
  Serial.println("📷 Kamera başlatılıyor...");
  
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
  
  // Frame boyutu ayarı
  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }
  
  // Kamera başlat
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Kamera başlatılamadı: 0x%x\n", err);
    return;
  }
  
  // Kamera sensör ayarları
  sensor_t * s = esp_camera_sensor_get();
  s->set_brightness(s, 0);     // -2 to 2
  s->set_contrast(s, 0);       // -2 to 2
  s->set_saturation(s, 0);     // -2 to 2
  s->set_special_effect(s, 0); // 0 to 6 (0-No Effect, 1-Negative, 2-Grayscale, 3-Red Tint, 4-Green Tint, 5-Blue Tint, 6-Sepia)
  s->set_whitebal(s, 1);       // 0 = disable , 1 = enable
  s->set_awb_gain(s, 1);       // 0 = disable , 1 = enable
  s->set_wb_mode(s, 0);        // 0 to 4 - if awb_gain enabled (0 - Auto, 1 - Sunny, 2 - Cloudy, 3 - Office, 4 - Home)
  
  Serial.println("✅ Kamera başarıyla başlatıldı!");
}

void setupWiFi() {
  Serial.println("📶 WiFi bağlantısı kuruluyor...");
  
  // LED yanar söner
  for(int i = 0; i < 3; i++) {
    digitalWrite(FLASH_LED_PIN, HIGH);
    delay(200);
    digitalWrite(FLASH_LED_PIN, LOW);
    delay(200);
  }
  
  // WiFi Manager ile bağlan
  wifiManager.setAPCallback(configModeCallback);
  wifiManager.setSaveConfigCallback(saveConfigCallback);
  
  if (!wifiManager.autoConnect(AP_SSID, AP_PASSWORD)) {
    Serial.println("❌ WiFi bağlantısı başarısız!");
    ESP.restart();
  }
  
  Serial.println("✅ WiFi bağlandı!");
  Serial.print("📡 IP Adresi: ");
  Serial.println(WiFi.localIP());
  
  // LED 3 saniye yanar
  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(3000);
  digitalWrite(FLASH_LED_PIN, LOW);
}

void configModeCallback(WiFiManager *myWiFiManager) {
  Serial.println("🔧 Konfigürasyon modunda!");
  Serial.println("📱 WiFi: " + String(AP_SSID));
  Serial.println("🔑 Şifre: " + String(AP_PASSWORD));
  Serial.println("🌐 Adres: 192.168.4.1");
  
  // LED hızlı yanar söner
  for(int i = 0; i < 10; i++) {
    digitalWrite(FLASH_LED_PIN, HIGH);
    delay(100);
    digitalWrite(FLASH_LED_PIN, LOW);
    delay(100);
  }
}

void saveConfigCallback() {
  Serial.println("💾 WiFi ayarları kaydedildi!");
}

void setupWebServer() {
  // Ana sayfa
  server.on("/", handleRoot);
  
  // Konfigürasyon sayfası
  server.on("/config", handleConfig);
  server.on("/save-config", HTTP_POST, handleSaveConfig);
  
  // Kamera stream
  server.on("/stream", handleStream);
  server.on("/capture", handleCapture);
  
  // API endpoints
  server.on("/status", handleStatus);
  server.on("/reset", handleReset);
  
  server.begin();
  Serial.println("🌐 Web server başlatıldı!");
}

void handleRoot() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
    <title>ESP32-CAM City-V IoT</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; }
        h1 { text-align: center; margin-bottom: 30px; font-size: 2.5em; }
        .status { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px; margin: 20px 0; }
        .btn { background: #4CAF50; color: white; padding: 15px 25px; border: none; border-radius: 10px; cursor: pointer; margin: 10px; font-size: 16px; transition: all 0.3s; }
        .btn:hover { background: #45a049; transform: translateY(-2px); }
        .btn-blue { background: #2196F3; }
        .btn-blue:hover { background: #1976D2; }
        .btn-red { background: #f44336; }
        .btn-red:hover { background: #d32f2f; }
        .stream-container { text-align: center; margin: 20px 0; }
        .stream-img { max-width: 100%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .emoji { font-size: 1.5em; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1><span class="emoji">🚀</span>ESP32-CAM City-V IoT</h1>
        
        <div class="status">
            <h3><span class="emoji">📊</span>Cihaz Durumu</h3>
            <p><strong>Cihaz ID:</strong> )" + DEVICE_ID + R"(</p>
            <p><strong>Cihaz Adı:</strong> )" + DEVICE_NAME + R"(</p>
            <p><strong>Konum:</strong> )" + STOP_NAME + R"(</p>
            <p><strong>Hat:</strong> )" + LINE_CODE + R"(</p>
            <p><strong>IP Adresi:</strong> )" + WiFi.localIP().toString() + R"(</p>
            <p><strong>WiFi Sinyal:</strong> )" + String(WiFi.RSSI()) + R"( dBm</p>
            <p><strong>Çalışma Süresi:</strong> )" + String(millis() / 1000) + R"( saniye</p>
        </div>
        
        <div class="stream-container">
            <h3><span class="emoji">📷</span>Canlı Görüntü</h3>
            <img id="stream" class="stream-img" src="/capture" />
            <br>
            <button class="btn btn-blue" onclick="refreshImage()">🔄 Yenile</button>
            <button class="btn btn-blue" onclick="toggleStream()">📹 Canlı Stream</button>
        </div>
        
        <div style="text-align: center;">
            <button class="btn" onclick="location.href='/config'">⚙️ Konfigürasyon</button>
            <button class="btn btn-blue" onclick="location.href='/status'">📊 Durum</button>
            <button class="btn btn-red" onclick="location.href='/reset'">🔄 Yeniden Başlat</button>
        </div>
    </div>
    
    <script>
        function refreshImage() {
            document.getElementById('stream').src = '/capture?' + new Date().getTime();
        }
        
        function toggleStream() {
            const img = document.getElementById('stream');
            if (img.src.includes('/capture')) {
                img.src = '/stream';
            } else {
                img.src = '/capture?' + new Date().getTime();
            }
        }
        
        // Her 5 saniyede bir görüntüyü yenile
        setInterval(refreshImage, 5000);
    </script>
</body>
</html>
  )";
  
  server.send(200, "text/html", html);
}

void handleConfig() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
    <title>ESP32-CAM Konfigürasyon</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; }
        h1 { text-align: center; margin-bottom: 30px; }
        .form-group { margin: 20px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 15px; border: none; border-radius: 10px; font-size: 16px; box-sizing: border-box; }
        .btn { background: #4CAF50; color: white; padding: 15px 25px; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; width: 100%; margin-top: 20px; }
        .btn:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚙️ Cihaz Konfigürasyonu</h1>
        
        <form action="/save-config" method="POST">
            <div class="form-group">
                <label for="device_id">🔑 Cihaz ID:</label>
                <input type="text" id="device_id" name="device_id" value=")" + DEVICE_ID + R"(" required>
            </div>
            
            <div class="form-group">
                <label for="device_name">📱 Cihaz Adı:</label>
                <input type="text" id="device_name" name="device_name" value=")" + DEVICE_NAME + R"(" required>
            </div>
            
            <div class="form-group">
                <label for="location_type">📍 Konum Tipi:</label>
                <select id="location_type" name="location_type" required>
                    <option value="bus_stop" )" + (LOCATION_TYPE == "bus_stop" ? "selected" : "") + R"(>🚏 Otobüs Durağı</option>
                    <option value="vehicle" )" + (LOCATION_TYPE == "vehicle" ? "selected" : "") + R"(>🚌 Araç İçi</option>
                    <option value="station" )" + (LOCATION_TYPE == "station" ? "selected" : "") + R"(>🚉 İstasyon</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="stop_name">🚏 Durak/İstasyon Adı:</label>
                <input type="text" id="stop_name" name="stop_name" value=")" + STOP_NAME + R"(">
            </div>
            
            <div class="form-group">
                <label for="line_code">🚌 Hat Kodu:</label>
                <input type="text" id="line_code" name="line_code" value=")" + LINE_CODE + R"(">
            </div>
            
            <div class="form-group">
                <label for="city_name">🏙️ Şehir:</label>
                <input type="text" id="city_name" name="city_name" value=")" + CITY_NAME + R"(">
            </div>
            
            <div class="form-group">
                <label for="api_url">🌐 API URL:</label>
                <input type="url" id="api_url" name="api_url" value=")" + API_BASE_URL + R"(" required>
            </div>
            
            <button type="submit" class="btn">💾 Kaydet ve Yeniden Başlat</button>
        </form>
        
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn" style="background: #666; width: auto;" onclick="location.href='/'">🏠 Ana Sayfa</button>
        </div>
    </div>
</body>
</html>
  )";
  
  server.send(200, "text/html", html);
}

void handleSaveConfig() {
  // Form verilerini al
  DEVICE_ID = server.arg("device_id");
  DEVICE_NAME = server.arg("device_name");
  LOCATION_TYPE = server.arg("location_type");
  STOP_NAME = server.arg("stop_name");
  LINE_CODE = server.arg("line_code");
  CITY_NAME = server.arg("city_name");
  API_BASE_URL = server.arg("api_url");
  
  // EEPROM'a kaydet
  saveSettings();
  
  // Başarı sayfası
  String html = R"(
<!DOCTYPE html>
<html>
<head>
    <title>Kaydedildi</title>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="3;url=/">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .success { background: rgba(76, 175, 80, 0.2); padding: 30px; border-radius: 20px; display: inline-block; margin-top: 50px; }
    </style>
</head>
<body>
    <div class="success">
        <h1>✅ Ayarlar Kaydedildi!</h1>
        <p>Cihaz yeniden başlatılıyor...</p>
        <p>3 saniye sonra ana sayfaya yönlendirileceksiniz.</p>
    </div>
</body>
</html>
  )";
  
  server.send(200, "text/html", html);
  
  delay(2000);
  ESP.restart();
}

void handleStream() {
  WiFiClient client = server.client();
  
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: multipart/x-mixed-replace; boundary=frame");
  client.println("Connection: close");
  client.println();
  
  while (client.connected()) {
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Kamera frame alınamadı");
      break;
    }
    
    client.println("--frame");
    client.println("Content-Type: image/jpeg");
    client.print("Content-Length: ");
    client.println(fb->len);
    client.println();
    
    client.write(fb->buf, fb->len);
    client.println();
    
    esp_camera_fb_return(fb);
    
    if (!client.connected()) break;
    delay(100);
  }
}

void handleCapture() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Kamera frame alınamadı");
    server.send(500, "text/plain", "Kamera hatası");
    return;
  }
  
  server.sendHeader("Content-Type", "image/jpeg");
  server.sendHeader("Content-Length", String(fb->len));
  server.sendHeader("Cache-Control", "no-cache");
  server.send_P(200, "image/jpeg", (const char *)fb->buf, fb->len);
  
  esp_camera_fb_return(fb);
}

void handleStatus() {
  StaticJsonDocument<512> doc;
  
  doc["device_id"] = DEVICE_ID;
  doc["device_name"] = DEVICE_NAME;
  doc["location_type"] = LOCATION_TYPE;
  doc["stop_name"] = STOP_NAME;
  doc["line_code"] = LINE_CODE;
  doc["city_name"] = CITY_NAME;
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["ip_address"] = WiFi.localIP().toString();
  doc["uptime"] = millis() / 1000;
  doc["free_heap"] = ESP.getFreeHeap();
  doc["camera_ready"] = true;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}

void handleReset() {
  server.send(200, "text/html", 
    "<!DOCTYPE html><html><head><title>Yeniden Başlatılıyor</title><meta charset='UTF-8'></head>"
    "<body><h1>🔄 Cihaz yeniden başlatılıyor...</h1></body></html>");
  
  delay(1000);
  ESP.restart();
}

void loadSettings() {
  Serial.println("📖 Ayarlar yükleniyor...");
  
  DEVICE_ID = readStringFromEEPROM(DEVICE_ID_ADDR);
  DEVICE_NAME = readStringFromEEPROM(DEVICE_NAME_ADDR);
  LOCATION_TYPE = readStringFromEEPROM(LOCATION_TYPE_ADDR);
  STOP_NAME = readStringFromEEPROM(STOP_NAME_ADDR);
  LINE_CODE = readStringFromEEPROM(LINE_CODE_ADDR);
  CITY_NAME = readStringFromEEPROM(CITY_NAME_ADDR);
  API_BASE_URL = readStringFromEEPROM(API_URL_ADDR);
  
  // Varsayılan değerler
  if (DEVICE_ID.length() == 0) DEVICE_ID = "ESP32-" + String(ESP.getEfuseMac());
  if (DEVICE_NAME.length() == 0) DEVICE_NAME = "ESP32-CAM-001";
  if (LOCATION_TYPE.length() == 0) LOCATION_TYPE = "bus_stop";
  if (STOP_NAME.length() == 0) STOP_NAME = "Test Durağı";
  if (CITY_NAME.length() == 0) CITY_NAME = "Ankara";
  if (API_BASE_URL.length() == 0) API_BASE_URL = "https://cityv.app/api";
  
  Serial.println("✅ Ayarlar yüklendi!");
}

void saveSettings() {
  Serial.println("💾 Ayarlar kaydediliyor...");
  
  writeStringToEEPROM(DEVICE_ID_ADDR, DEVICE_ID);
  writeStringToEEPROM(DEVICE_NAME_ADDR, DEVICE_NAME);
  writeStringToEEPROM(LOCATION_TYPE_ADDR, LOCATION_TYPE);
  writeStringToEEPROM(STOP_NAME_ADDR, STOP_NAME);
  writeStringToEEPROM(LINE_CODE_ADDR, LINE_CODE);
  writeStringToEEPROM(CITY_NAME_ADDR, CITY_NAME);
  writeStringToEEPROM(API_URL_ADDR, API_BASE_URL);
  
  EEPROM.commit();
  Serial.println("✅ Ayarlar kaydedildi!");
}

String readStringFromEEPROM(int addr) {
  String str = "";
  char ch = EEPROM.read(addr);
  int i = 0;
  while (ch != '\0' && i < 50) {
    str += ch;
    i++;
    ch = EEPROM.read(addr + i);
  }
  return str;
}

void writeStringToEEPROM(int addr, String str) {
  for (int i = 0; i < str.length(); i++) {
    EEPROM.write(addr + i, str[i]);
  }
  EEPROM.write(addr + str.length(), '\0');
}

void registerDevice() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  Serial.println("📝 Cihaz kaydediliyor...");
  
  HTTPClient http;
  http.begin(API_BASE_URL + "/iot/devices");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<512> doc;
  doc["device_id"] = DEVICE_ID;
  doc["device_name"] = DEVICE_NAME;
  doc["location_type"] = LOCATION_TYPE;
  doc["stop_name"] = STOP_NAME;
  doc["line_code"] = LINE_CODE;
  doc["city_name"] = CITY_NAME;
  doc["battery_level"] = 100;
  doc["signal_strength"] = WiFi.RSSI();
  doc["latitude"] = 39.9334; // Ankara koordinatları (örnek)
  doc["longitude"] = 32.8597;
  
  String payload;
  serializeJson(doc, payload);
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Cihaz kaydedildi: " + response);
  } else {
    Serial.println("❌ Cihaz kaydedilemedi: " + String(httpResponseCode));
  }
  
  http.end();
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  Serial.println("💓 Heartbeat gönderiliyor...");
  
  HTTPClient http;
  http.begin(API_BASE_URL + "/iot/devices");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["battery_level"] = random(80, 100); // Simüle batarya
  doc["signal_strength"] = WiFi.RSSI();
  
  String payload;
  serializeJson(doc, payload);
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    Serial.println("✅ Heartbeat gönderildi");
  } else {
    Serial.println("❌ Heartbeat gönderilemedi: " + String(httpResponseCode));
  }
  
  http.end();
}

void performCrowdAnalysis() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  Serial.println("🔍 Yoğunluk analizi yapılıyor...");
  
  // Flash LED yanar (fotoğraf çekiliyor)
  digitalWrite(FLASH_LED_PIN, HIGH);
  delay(100);
  digitalWrite(FLASH_LED_PIN, LOW);
  
  // Simüle yoğunluk analizi (gerçek projede YOLO/AI kullanılır)
  int peopleCount = random(0, 25);
  float confidence = random(70, 95) / 100.0;
  String density = "empty";
  
  if (peopleCount > 0 && peopleCount <= 5) density = "low";
  else if (peopleCount > 5 && peopleCount <= 10) density = "medium";
  else if (peopleCount > 10 && peopleCount <= 15) density = "high";
  else if (peopleCount > 15) density = "overcrowded";
  
  // API'ye gönder
  HTTPClient http;
  http.begin(API_BASE_URL + "/iot/crowd-analysis");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<512> doc;
  doc["device_id"] = DEVICE_ID;
  doc["people_count"] = peopleCount;
  doc["crowd_density"] = density;
  doc["confidence_score"] = confidence;
  doc["weather_condition"] = "clear";
  doc["temperature"] = random(15, 30);
  doc["humidity"] = random(40, 70);
  doc["detection_objects"] = peopleCount; // YOLO detection sayısı
  doc["processing_time_ms"] = random(200, 800);
  
  String payload;
  serializeJson(doc, payload);
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    Serial.println("✅ Yoğunluk analizi gönderildi - Kişi: " + String(peopleCount) + ", Yoğunluk: " + density);
  } else {
    Serial.println("❌ Yoğunluk analizi gönderilemedi: " + String(httpResponseCode));
  }
  
  http.end();
  
  // Yüksek yoğunlukta LED uyarısı
  if (density == "high" || density == "overcrowded") {
    for (int i = 0; i < 5; i++) {
      digitalWrite(FLASH_LED_PIN, HIGH);
      delay(200);
      digitalWrite(FLASH_LED_PIN, LOW);
      delay(200);
    }
  }
}