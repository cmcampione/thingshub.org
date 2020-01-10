#include "WiFi.h"

// WiFi
const char* wifi_ssid      = "";
const char* wifi_password  = "";

const unsigned long check_wifi_interval = 30000;
unsigned long       check_wifi          = 0;
boolean             wifi_reconnection   = false;

int ledPin = 2;
void setup()
{
  Serial.begin(115200);

  // WiFi setup  
  while (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(wifi_ssid, wifi_password);
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to the WiFi");

  //
  pinMode(ledPin, OUTPUT);
}
void loop()
{
 // if wifi is down, try reconnecting every 30 seconds
  if (WiFi.status() != WL_CONNECTED) {
    wifi_reconnection = true;
    if (millis() - check_wifi >= check_wifi_interval) {
      check_wifi = millis();
      WiFi.disconnect();
      WiFi.begin(wifi_ssid, wifi_password);            
      Serial.println("Reconnecting to WiFi...");
    }
  }
  if ((WiFi.status() == WL_CONNECTED) && (wifi_reconnection == true)) {
    wifi_reconnection = false;
    Serial.println("Reconnected to WiFi");
  }
}
