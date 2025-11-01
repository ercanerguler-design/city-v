/*
 * ========================================
 * CITYV - PERSONEL TANIMA SİSTEMİ
 * ESP32-CAM ile QR Kod Okuma
 * ========================================
 * 
 * ÖZELLİKLER:
 * - QR Kod okuma (Personel tanıma)
 * - Otomatik vardiya kaydı (check-in/out)
 * - WiFi Manager (kolay kurulum)
 * - LED geri bildirimi
 * - HTTP API entegrasyonu
 * 
 * KURULUM:
 * 1. Arduino IDE'de ESP32 kartını seç
 * 2. Gerekli kütüphaneleri yükle:
 *    - WiFiManager by tzapu
 *    - ArduinoJson by Benoit Blanchon
 *    - ESP32QRCodeReader by Pablo Bacho
 * 3. Kodu yükle
 * 4. İlk açılışta "CityV-Staff-Camera" WiFi'sine bağlan
 * 5. WiFi bilgilerini gir
 * 6. API URL'yi ayarla
 */

#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32QRCodeReader.h>
#include "esp_camera.h"

// ====================================================================
// PIN TANIMLARI - AI-Thinker ESP32-CAM
// ====================================================================
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

// ====================================================================
// KONFIGÜRASYON
// ====================================================================
const char* AP_SSID = "CityV-Staff-Camera";
const char* AP_PASSWORD = "cityv2024";

// API ayarları (WiFi Manager üzerinden güncellenebilir)
String API_URL = "https://your-domain.vercel.app/api/iot/staff-detection";
int CAMERA_ID = 1;  // Her kameraya benzersiz ID
String LOCATION_ZONE = "Giris";  // Giriş, Salon, Mutfak vs.

// QR kod okuyucu
ESP32QRCodeReader qrReader(CAMERA_MODEL_AI_THINKER);

// LED ve bildirim
bool ledState = false;
unsigned long lastQRScan = 0;
const unsigned long QR_COOLDOWN = 3000; // 3 saniye bekleme süresi

// WiFi Manager
WiFiManager wifiManager;

// ====================================================================
// SETUP - İLK ÇALIŞTIRMA
// ====================================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n========================================");
  Serial.println("   CityV Personel Tanima Sistemi");
  Serial.println("========================================\n");
  
  // LED pini
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);
  
  // Başlangıç LED efekti
  blinkLED(3, 200);
  
  // WiFi Manager başlat
  Serial.println("📶 WiFi Manager baslatiliyor...");
  
  // Custom parametreler ekle (opsiyonel)
  WiFiManagerParameter custom_api_url("api_url", "API URL", API_URL.c_str(), 100);
  WiFiManagerParameter custom_camera_id("camera_id", "Camera ID", String(CAMERA_ID).c_str(), 10);
  WiFiManagerParameter custom_location("location", "Konum (Giris/Salon/Mutfak)", LOCATION_ZONE.c_str(), 30);
  
  wifiManager.addParameter(&custom_api_url);
  wifiManager.addParameter(&custom_camera_id);
  wifiManager.addParameter(&custom_location);
  
  // WiFi'ye bağlan (otomatik portal açılır)
  if (!wifiManager.autoConnect(AP_SSID, AP_PASSWORD)) {
    Serial.println("❌ WiFi baglanti basarisiz! Yeniden baslatiliyor...");
    delay(3000);
    ESP.restart();
  }
  
  Serial.println("✅ WiFi baglandi!");
  Serial.print("   IP: ");
  Serial.println(WiFi.localIP());
  
  // Parametreleri oku
  API_URL = String(custom_api_url.getValue());
  CAMERA_ID = String(custom_camera_id.getValue()).toInt();
  LOCATION_ZONE = String(custom_location.getValue());
  
  Serial.println("\n📋 Kamera Ayarlari:");
  Serial.println("   Camera ID: " + String(CAMERA_ID));
  Serial.println("   Konum: " + LOCATION_ZONE);
  Serial.println("   API: " + API_URL);
  
  // Kamera başlat
  Serial.println("\n📷 Kamera baslatiliyor...");
  if (!initCamera()) {
    Serial.println("❌ Kamera baslatilamadi!");
    blinkLED(10, 100); // Hata LED
    ESP.restart();
  }
  
  Serial.println("✅ Kamera hazir!");
  
  // QR okuyucu başlat
  Serial.println("\n📱 QR kod okuyucu baslatiliyor...");
  qrReader.setup();
  Serial.println("✅ QR okuyucu hazir!");
  
  Serial.println("\n🎉 Sistem tamamen hazir!");
  Serial.println("👉 QR kodu kameraya gosterin...\n");
  
  blinkLED(2, 500); // Başarı LED
}

// ====================================================================
// LOOP - ANA DÖNGÜ
// ====================================================================
void loop() {
  // QR kod okuma
  if (qrReader.receiveQrCode()) {
    // Cooldown kontrolü (aynı QR kod 3 saniyede bir okunur)
    if (millis() - lastQRScan < QR_COOLDOWN) {
      Serial.println("⏳ Lutfen bekleyin...");
      return;
    }
    
    // QR kod verisini al
    String qrData = qrReader.getQrCodeData();
    
    Serial.println("\n📱 QR Kod okundu!");
    Serial.println("   Data: " + qrData);
    
    // QR formatını kontrol et (STAFF-{id}-{hash})
    if (qrData.startsWith("STAFF-")) {
      // LED yanıp sön
      blinkLED(1, 100);
      
      // API'ye gönder
      sendStaffDetection(qrData);
      
      lastQRScan = millis();
    } else {
      Serial.println("❌ Gecersiz QR kod formati!");
      Serial.println("   Beklenen: STAFF-{id}-{hash}");
      blinkLED(5, 50); // Hata LED
    }
  }
  
  delay(100); // CPU'yu rahatlatmak için
}

// ====================================================================
// KAMERA BAŞLATMA
// ====================================================================
bool initCamera() {
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
  
  // QR kod okuma için orta çözünürlük yeterli
  config.frame_size = FRAMESIZE_QVGA; // 320x240
  config.jpeg_quality = 12;
  config.fb_count = 1;
  
  // Kamerayı başlat
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Kamera baslatma hatasi: 0x%x", err);
    return false;
  }
  
  // Kamera ayarları (QR için optimize)
  sensor_t * s = esp_camera_sensor_get();
  s->set_brightness(s, 0);     // -2 to 2
  s->set_contrast(s, 0);       // -2 to 2
  s->set_saturation(s, 0);     // -2 to 2
  s->set_special_effect(s, 0); // 0: None
  s->set_whitebal(s, 1);       // 0 = disable , 1 = enable
  s->set_awb_gain(s, 1);       // 0 = disable , 1 = enable
  s->set_wb_mode(s, 0);        // 0 to 4
  s->set_exposure_ctrl(s, 1);  // 0 = disable , 1 = enable
  s->set_aec2(s, 0);           // 0 = disable , 1 = enable
  s->set_ae_level(s, 0);       // -2 to 2
  s->set_aec_value(s, 300);    // 0 to 1200
  s->set_gain_ctrl(s, 1);      // 0 = disable , 1 = enable
  s->set_agc_gain(s, 0);       // 0 to 30
  s->set_gainceiling(s, (gainceiling_t)0);  // 0 to 6
  s->set_bpc(s, 0);            // 0 = disable , 1 = enable
  s->set_wpc(s, 1);            // 0 = disable , 1 = enable
  s->set_raw_gma(s, 1);        // 0 = disable , 1 = enable
  s->set_lenc(s, 1);           // 0 = disable , 1 = enable
  s->set_hmirror(s, 0);        // 0 = disable , 1 = enable
  s->set_vflip(s, 0);          // 0 = disable , 1 = enable
  s->set_dcw(s, 1);            // 0 = disable , 1 = enable
  s->set_colorbar(s, 0);       // 0 = disable , 1 = enable
  
  return true;
}

// ====================================================================
// API'YE PERSONEL TESPİTİ GÖNDER
// ====================================================================
void sendStaffDetection(String qrCode) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi bagli degil!");
    return;
  }
  
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 saniye timeout
  
  // JSON payload oluştur
  StaticJsonDocument<256> doc;
  doc["camera_id"] = CAMERA_ID;
  doc["staff_qr"] = qrCode;
  doc["detection_type"] = "qr_scan";
  doc["location_zone"] = LOCATION_ZONE;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("\n📤 API'ye gonderiliyor...");
  Serial.println("   JSON: " + jsonString);
  
  // POST isteği gönder
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    Serial.println("✅ HTTP Kodu: " + String(httpCode));
    
    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("📥 Response:");
      Serial.println(response);
      
      // JSON'u parse et
      StaticJsonDocument<512> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error) {
        bool success = responseDoc["success"];
        String staffName = responseDoc["staff"]["name"];
        String action = responseDoc["action"];
        String message = responseDoc["message"];
        
        if (success) {
          Serial.println("\n🎉 BASARILI!");
          Serial.println("   Personel: " + staffName);
          Serial.println("   Islem: " + action);
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
          Serial.println("❌ API hatasi!");
          blinkLED(10, 50); // Hızlı yanıp sönme (Hata)
        }
      } else {
        Serial.println("❌ JSON parse hatasi!");
      }
    } else {
      Serial.println("❌ HTTP hatasi: " + String(httpCode));
      blinkLED(7, 100);
    }
  } else {
    Serial.println("❌ Baglanti hatasi!");
    Serial.println("   Hata kodu: " + String(httpCode));
    blinkLED(10, 50);
  }
  
  http.end();
}

// ====================================================================
// LED YARDIMCI FONKSİYONLARI
// ====================================================================
void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(FLASH_LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(FLASH_LED_PIN, LOW);
    delay(delayMs);
  }
}

void setLED(bool state) {
  digitalWrite(FLASH_LED_PIN, state ? HIGH : LOW);
  ledState = state;
}
