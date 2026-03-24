#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_BME680.h>
#include <BH1750.h>
#include <driver/i2s.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <math.h>

/* ================= PIN ================= */
#define I2S_WS   27
#define I2S_SCK  14
#define I2S_SD   12
#define FAN_PIN  25

/* ================= I2S ================= */
#define I2S_SAMPLE_RATE 16000
#define I2S_BUFFER_SIZE 512

/* ================= I2C ================= */
TwoWire I2C_2 = TwoWire(1);   // secondo bus

/* ================= DISPLAY ================= */
// SH1107
Adafruit_SH1107 display1(128, 128, &Wire);

// SSD1306
Adafruit_SSD1306 display2(128, 64, &I2C_2, -1);

/* ================= SENSORI ================= */
Adafruit_BME680 bme;
BH1750 lightMeter;

/* ================= AUDIO ================= */
int32_t audioBuffer[I2S_BUFFER_SIZE];

/* ================= WIFI ================= */
const char* ssid = ""; // YOUR_WIFI_SSID
const char* password = ""; // YOUR_WIFI_PASSWORD

/* ================= API ================= */
const char* API_BASE_URL = ""; // "https://{YOUR_API_URL}/api"
const char* DEVICE_NAME  = ""; // "{YOUR_DEVICE_NAME}"

/* ================= TIME ================= */
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;
const int daylightOffset_sec = 3600;
struct tm timeinfo;

/* ================= STATE ================= */
bool fanDesiredState = false;
bool fanCurrentState = false;
unsigned long lastTelemetrySend = 0;
const unsigned long TELEMETRY_INTERVAL = 10000; // 10 seconds

/* ================= AUDIO dB (FIXED) =================
   INMP441 normalmente è 24-bit LEFT-ALIGNED dentro 32-bit.
   Quindi >> 8 riporta i campioni a un int24 “reale”.
   Se i valori risultassero troppo bassi, prova AUDIO_SHIFT_BITS = 0.
*/
static const int   AUDIO_SHIFT_BITS = 8;
static const float DB_SPL_OFFSET    = 110.0f;   // calibrazione (regola questo per “centrare” i dB)
static const float DB_MIN           = 20.0f;
static const float DB_MAX           = 120.0f;
static const float EMA_ALPHA        = 0.20f;    // smoothing 0.1–0.3

static float noiseDbSmoothed = 0.0f;

/* ================= HELPERS ================= */
static String format2(float v) {
  char buf[16];
  snprintf(buf, sizeof(buf), "%.2f", v);
  return String(buf);
}

/* Calcolo dB “coerenti”: RMS -> dBFS -> offset -> clamp -> smoothing */
static float computeNoiseDbFromI2S(const int32_t* buf, int samples, int32_t &outMavShifted) {
  if (samples <= 0) {
    outMavShifted = 0;
    return noiseDbSmoothed;
  }

  int64_t sumAbs = 0;
  double  sumSq  = 0.0;

  for (int i = 0; i < samples; i++) {
    int32_t s = buf[i] >> AUDIO_SHIFT_BITS; // mantiene il segno (shift aritmetico)

    int32_t a = (s < 0) ? -s : s;
    sumAbs += a;

    double sd = (double)s;
    sumSq += sd * sd;
  }

  outMavShifted = (int32_t)(sumAbs / samples);

  double meanSq = sumSq / (double)samples;
  float rms = (float)sqrt(meanSq);

  // 24-bit full scale: 2^23 - 1
  const float FULL_SCALE = 8388607.0f;

  float dbfs = 20.0f * log10f((rms / FULL_SCALE) + 1e-12f); // <= 0 dBFS
  float db   = dbfs + DB_SPL_OFFSET;                        // “sposto” su scala dB più umana

  db = constrain(db, DB_MIN, DB_MAX);

  if (noiseDbSmoothed == 0.0f) noiseDbSmoothed = db; // init
  noiseDbSmoothed = (EMA_ALPHA * db) + ((1.0f - EMA_ALPHA) * noiseDbSmoothed);

  return noiseDbSmoothed;
}

/* ================= FUNCTIONS ================= */
/**
 * sendTelemetry - POST sensor data to backend and receive fan control state
 * Sends: all sensor readings
 * Receives: fan_desired_state to control the fan
 */
void sendTelemetry(float temp,
                   float hum,
                   float pres,
                   float gas,
                   float lux,
                   int32_t audioMavShifted,
                   float noiseDb,
                   bool currentFanState) {

  if (!WiFi.isConnected()) {
    Serial.println("WiFi not connected");
    return;
  }

  HTTPClient http;
  http.setTimeout(5000);

  String url = String(API_BASE_URL) + "/device/data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // JSON payload (un po' più grande per stare larghi)
  StaticJsonDocument<512> doc;

  doc["device_name"]   = DEVICE_NAME;
  doc["temperature"]   = roundf(temp * 100.0f) / 100.0f;
  doc["humidity"]      = roundf(hum  * 100.0f) / 100.0f;
  doc["air_pressure"]  = roundf(pres * 100.0f) / 100.0f;
  doc["gas_kohm"]      = roundf(gas  * 100.0f) / 100.0f;
  doc["light_lux"]     = roundf(lux  * 100.0f) / 100.0f;

  // dB: numero + stringa a 2 decimali (per UI coerente)
  float noiseDbRounded = roundf(noiseDb * 100.0f) / 100.0f;
  doc["noise_db"]      = noiseDbRounded;
  doc["noise_db_str"]  = format2(noiseDbRounded);

  // debug-friendly
  doc["noise_mav"]     = audioMavShifted;

  doc["fan_state"]     = currentFanState;

  String payload;
  serializeJson(doc, payload);

  Serial.println("Sending: " + payload);

  int httpCode = http.POST(payload);

  if (httpCode == 201 || httpCode == 200) {
    String response = http.getString();
    Serial.println("Response: " + response);

    StaticJsonDocument<256> respDoc;
    DeserializationError error = deserializeJson(respDoc, response);

    if (!error && respDoc.containsKey("fan_desired_state")) {
      fanDesiredState = respDoc["fan_desired_state"].as<bool>();
      Serial.println("Fan desired state: " + String(fanDesiredState ? "ON" : "OFF"));
    } else {
      Serial.println("Failed to parse fan state from response");
    }
  } else {
    Serial.println("HTTP Error: " + String(httpCode));
  }

  http.end();
}

/* ================= SETUP ================= */
void setup() {
  Serial.begin(115200);

  // I2C
  Wire.begin(21, 22);
  I2C_2.begin(32, 33);

  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);
  fanCurrentState = false;

  /* ---- DISPLAY SH1107 ---- */
  if (!display1.begin(0x3C, true)) {
    Serial.println("SH1107 non trovato");
    while (1) delay(10);
  }
  display1.setTextColor(SH110X_WHITE);

  /* ---- DISPLAY SSD1306 ---- */
  if (!display2.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 non trovato");
    while (1) delay(10);
  }
  display2.setTextColor(SSD1306_WHITE);

  /* ---- BME680 ---- */
  if (!bme.begin(0x77)) {
    Serial.println("BME680 non trovato");
    while (1) delay(10);
  }

  /* ---- BH1750 ---- */
  lightMeter.begin();

  /* ---- I2S ---- */
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = I2S_SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = I2S_BUFFER_SIZE,
    .use_apll = false
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1,
    .data_in_num = I2S_SD
  };

  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pin_config);

  /* ---- WIFI ---- */
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  /* ---- TIME ---- */
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

/* ================= LOOP ================= */
void loop() {

  /* ===== BME680 ===== */
  if (!bme.performReading()) {
    Serial.println("BME680 reading failed");
  }
  float temp = bme.temperature;
  float hum  = bme.humidity;
  float pres = bme.pressure / 100.0f;
  float gas  = bme.gas_resistance / 1000.0f;

  /* ===== BH1750 ===== */
  float lux = lightMeter.readLightLevel();

  /* ===== AUDIO INMP441 (FIXED dB) ===== */
  size_t bytesRead = 0;
  i2s_read(I2S_NUM_0, audioBuffer, sizeof(audioBuffer), &bytesRead, portMAX_DELAY);

  int samples = bytesRead / sizeof(int32_t);
  if (samples < 1) samples = 1;

  int32_t audioMavShifted = 0;
  float noiseDb = computeNoiseDbFromI2S(audioBuffer, samples, audioMavShifted);
  String noiseDbStr = format2(noiseDb);

  /* ===== FAN APPLY ===== */
  digitalWrite(FAN_PIN, fanDesiredState ? HIGH : LOW);
  fanCurrentState = fanDesiredState;

  /* ===== TELEMETRY ===== */
  unsigned long now = millis();
  if (now - lastTelemetrySend >= TELEMETRY_INTERVAL) {
    sendTelemetry(temp, hum, pres, gas, lux, audioMavShifted, noiseDb, fanCurrentState);
    lastTelemetrySend = now;
  }

  /* ===== DISPLAY 1 – SH1107 (SENSORI) ===== */
  display1.clearDisplay();
  display1.setCursor(0, 0);
  display1.setTextSize(1);

  display1.printf("Temp : %.1f C\n", temp);
  display1.printf("Hum  : %.1f %%\n", hum);
  display1.printf("Pres : %.0f hPa\n", pres);
  display1.printf("Gas  : %.1f kOhm\n", gas);
  display1.printf("Lux  : %.0f lx\n", lux);
  display1.printf("Noise: %s dB\n", noiseDbStr.c_str());
  display1.printf("Fan  : %s\n", fanCurrentState ? "ON" : "OFF");

  display1.display();

  /* ===== DISPLAY 2 – SSD1306 (OROLOGIO) ===== */
  if (getLocalTime(&timeinfo)) {
    display2.clearDisplay();
    display2.setCursor(0, 0);

    display2.setTextSize(2);
    display2.printf("%02d/%02d/%04d\n",
                    timeinfo.tm_mday,
                    timeinfo.tm_mon + 1,
                    timeinfo.tm_year + 1900);

    display2.setTextSize(3);
    display2.printf("%02d:%02d",
                    timeinfo.tm_hour,
                    timeinfo.tm_min);

    display2.display();
  }

  delay(500);
}