// Per la gestione dello overflow ho utilizzato la soluzione proposta da https://www.leonardomiliani.com/2012/come-gestire-loverflow-di-millis/

#include "WiFi.h"
#include "HTTPClient.h"
#include "PubSubClient.h"
#include "BuilDefine.h"

#define DEBUG
#ifdef DEBUG    //Macros are usually in all capital letters.
  #define DPRINT(...)    Serial.print(__VA_ARGS__)     //DPRINT is a macro, debug print
  #define DPRINTLN(...)  Serial.println(__VA_ARGS__)   //DPRINTLN is a macro, debug print with new line
#else
  #define DPRINT(...)     //now defines a blank line
  #define DPRINTLN(...)   //now defines a blank line
#endif

// WiFi

class WiFiManager {
  public:
    static const char* wifi_ssid;
    static const char* wifi_password;

    static const unsigned long  check_wifi_interval;
    
    static boolean              wifi_reconnection;
    static unsigned long        check_wifi;
   
  public:
    WiFiManager() {
    }
    static void connect() {
       do {
        WiFi.begin(WiFiManager::wifi_ssid, WiFiManager::wifi_password);
        delay(500);
        DPRINTLN("Connecting to WiFi...");
      } while (WiFi.status() != WL_CONNECTED);
      DPRINTLN("Connected to the WiFi");      
    }
    static void checkAndTryReconnecting() {
      // if wifi is down, try reconnecting every 15 seconds
      if (WiFi.status() != WL_CONNECTED) {
        WiFiManager::wifi_reconnection = true;
        if (millis() - WiFiManager::check_wifi >= WiFiManager::check_wifi_interval) {
          WiFiManager::check_wifi = millis();
          WiFi.disconnect();
          WiFi.begin(WiFiManager::wifi_ssid, WiFiManager::wifi_password);            
          DPRINTLN("Reconnecting to WiFi...");
        }
      }
      if ((WiFi.status() == WL_CONNECTED) && (WiFiManager::wifi_reconnection == true)) {
        WiFiManager::wifi_reconnection = false;
        DPRINTLN("Reconnected to WiFi");
      }
    }
};

#ifdef WIFISETUPEXTERNAL

#include "WiFiSetup.h"

#else

const char* WiFiManager::wifi_ssid      = "";
const char* WiFiManager::wifi_password  = "";

#endif

const unsigned long WiFiManager::check_wifi_interval = 15000;
unsigned long       WiFiManager::check_wifi          = 0;
boolean             WiFiManager::wifi_reconnection   = false;

////////////////////////////////

const char* mqtt_server = "mqtt.thingshub.org";
#define mqtt_port 1883
#define MQTT_USER "muschitta"
#define MQTT_PASSWORD "aviremu"

#define MQTT_SERIAL_RECEIVER_CH "onUpdateThingValue"

WiFiClient wifiClient;
PubSubClient mqtt_client(wifiClient);

void mqtt_reconnect() {
  // Loop until we're reconnected
  while (!mqtt_client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "Ant-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (mqtt_client.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
      Serial.println("mqtt connected");
      mqtt_client.subscribe(MQTT_SERIAL_RECEIVER_CH);
    } else {
      Serial.print("mqtt failed, rc=");
      Serial.print(mqtt_client.state());
      Serial.println("mqtt try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void mqtt_callback(char* topic, byte *payload, unsigned int length) {
    Serial.println("-------new message from broker-----");
    Serial.print("channel:");
    Serial.println(topic);
    Serial.print("data:");  
    Serial.write(payload, length);
    Serial.println();
}

//////////////////////////

int ledPin = 2;

void setup()
{
  randomSeed(micros());
   
  Serial.begin(115200);

  // WiFi setup
  WiFiManager::connect();

  //
  mqtt_client.setServer(mqtt_server, mqtt_port);
  mqtt_client.setCallback(mqtt_callback);
  mqtt_reconnect();
  
  //
  pinMode(ledPin, OUTPUT);
}
void loop()
{
  // if wifi is down, try reconnecting every 30 seconds
  WiFiManager::checkAndTryReconnecting();

  ///////////////////////
  
  if ((WiFi.status() == WL_CONNECTED)) { //Check the current connection status

//    HTTPClient http;
// 
//    http.begin("api.thingshub.org", 3000, "/api", root_ca); //Specify the URL and certificate
//    
//    int httpCode = http.GET();                                                  //Make the request
//    if (httpCode > 0) { //Check for the returning code
// 
//        String payload = http.getString();
//        Serial.println(httpCode);
//        Serial.println(payload);
//      }
// 
//    else {
//      Serial.println(httpCode);
//    }
// 
//    http.end(); //Free the resources

    ///////////////

    mqtt_client.loop();
  }
 
//  delay(10000);
}
