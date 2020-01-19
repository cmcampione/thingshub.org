// Per la gestione dello overflow ho utilizzato la soluzione proposta da https://www.leonardomiliani.com/2012/come-gestire-loverflow-di-millis/

#include <map>
#include <vector>
#include <ArduinoJson.h>
#include "WiFi.h"
#include "HTTPClient.h"
#include "SocketIOclient.h"
#include "BuildDefine.h"

#define DEBUG
#ifdef DEBUG    //Macros are usually in all capital letters.
  #define DPRINT(...)    Serial.print(__VA_ARGS__)     //DPRINT is a macro, debug print
  #define DPRINTF(...)    Serial.printf(__VA_ARGS__)     //DPRINT is a macro, debug print
  #define DPRINTLN(...)  Serial.println(__VA_ARGS__)   //DPRINTLN is a macro, debug print with new line
#else
  #define DPRINT(...)     //now defines a blank line
  #define DPRINTF(...)    //now defines a blank line
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
        delay(5000);
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

//////////////////////////////////

const int msgCapacity = 300;
class SocketIOManager {
  private:
    static SocketIOclient webSocket;
    static std::map<String, std::function<void (const StaticJsonDocument<msgCapacity>&)>> events;
    static StaticJsonDocument<msgCapacity> jMsg;
  private:
    static void trigger(const StaticJsonDocument<msgCapacity>& jMsg) {
      const char* event = jMsg[0];
      auto e = events.find(event);
      if(e != events.end()) {
        DPRINTF("trigger event %s\n", event);
        e->second(jMsg);
      } else {
        DPRINTF("event %s not found. %d events available\n", event, events.size());
      }
    }
    static void handleSIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
      DPRINTF("socketIOmessageType_t = %c\n", type);
      DPRINTF("payload = %s\n", length == 0 ? (uint8_t *)"" : payload);
      switch(type) {
        case sIOtype_EVENT:
          DeserializationError error = deserializeJson(jMsg, payload);
          if (error) {
            DPRINT(F("deserializeJson() failed: "));
            DPRINTLN(error.c_str());
            return;
          }
          trigger(jMsg);          
        break;
      }
    }
  public:
    static void on(const char* event, std::function<void (const StaticJsonDocument<msgCapacity>&)> func) {
	    events[event] = func;
    }
    static void remove(const char* event) {
      auto e = events.find(event);
      if(e != events.end()) {
        events.erase(e);
      } else {
        DPRINTF("[SIoC] event %s not found, can not be removed\n", event);
      }
    }
    static void beginSocketIOSSLWithCA(const char * host, uint16_t port, const char * url = "/socket.io/?EIO=3", const char * CA_cert = NULL, const char * protocol = "arduino") {
      SocketIOManager::webSocket.onEvent(handleSIOEvent);
      SocketIOManager::webSocket.beginSocketIOSSLWithCA(host, port, url, CA_cert, protocol);
    }
    static void loop() {
      SocketIOManager::webSocket.loop();
    }
};

SocketIOclient SocketIOManager::webSocket;
std::map<String, std::function<void (const StaticJsonDocument<msgCapacity>&)>> SocketIOManager::events;
StaticJsonDocument<msgCapacity> SocketIOManager::jMsg;

// HTTPClient 

//unsigned long restCallInterval = 0;

////////////////////////////////

const char* root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDSjCCAjKgAwIBAgIQRK+wgNajJ7qJMDmGLvhAazANBgkqhkiG9w0BAQUFADA/\n" \
"MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT\n" \
"DkRTVCBSb290IENBIFgzMB4XDTAwMDkzMDIxMTIxOVoXDTIxMDkzMDE0MDExNVow\n" \
"PzEkMCIGA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMRcwFQYDVQQD\n" \
"Ew5EU1QgUm9vdCBDQSBYMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\n" \
"AN+v6ZdQCINXtMxiZfaQguzH0yxrMMpb7NnDfcdAwRgUi+DoM3ZJKuM/IUmTrE4O\n" \
"rz5Iy2Xu/NMhD2XSKtkyj4zl93ewEnu1lcCJo6m67XMuegwGMoOifooUMM0RoOEq\n" \
"OLl5CjH9UL2AZd+3UWODyOKIYepLYYHsUmu5ouJLGiifSKOeDNoJjj4XLh7dIN9b\n" \
"xiqKqy69cK3FCxolkHRyxXtqqzTWMIn/5WgTe1QLyNau7Fqckh49ZLOMxt+/yUFw\n" \
"7BZy1SbsOFU5Q9D8/RhcQPGX69Wam40dutolucbY38EVAjqr2m7xPi71XAicPNaD\n" \
"aeQQmxkqtilX4+U9m5/wAl0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNV\n" \
"HQ8BAf8EBAMCAQYwHQYDVR0OBBYEFMSnsaR7LHH62+FLkHX/xBVghYkQMA0GCSqG\n" \
"SIb3DQEBBQUAA4IBAQCjGiybFwBcqR7uKGY3Or+Dxz9LwwmglSBd49lZRNI+DT69\n" \
"ikugdB/OEIKcdBodfpga3csTS7MgROSR6cz8faXbauX+5v3gTt23ADq1cEmv8uXr\n" \
"AvHRAosZy5Q6XkjEGB5YGV8eAlrwDPGxrancWYaLbumR9YbK+rlmM6pZW87ipxZz\n" \
"R8srzJmwN0jP41ZL9c8PDHIyh8bwRLtTcm1D9SZImlJnt1ir/md2cXjbDaJWFBM5\n" \
"JDGFoqgCWjBH4d1QB7wCCZAA62RjYJsWvIjJEubSfZGL+T0yjWW06XyxV3bqxbYo\n" \
"Ob8VZRzI9neWagqNdwvYkQsEjgfbKbYK7p2CNTUQ\n" \
"-----END CERTIFICATE-----\n";

/////////////////////////////

void onUpdateThingValue(const StaticJsonDocument<msgCapacity>& jMsg) {
  DPRINTLN("-------------------------");
  const char* thingId = jMsg[1];
  DPRINTF("ThingId = %s\n",thingId);    
 }

//////////////////////////

int ledPin = 2;

void setup()
{
  Serial.begin(115200);

  // WiFi setup
  WiFiManager::connect();

  //
  SocketIOManager::on("onUpdateThingValue", onUpdateThingValue);
  SocketIOManager::beginSocketIOSSLWithCA("api.thingshub.org", 3000, "/socket.io/?EIO=3&token=491e94d9-9041-4e5e-b6cb-9dad91bbf63d", root_ca, "");

  //
  pinMode(ledPin, OUTPUT);
}

void loop()
{
  // if wifi is down, try reconnecting every 30 seconds
  WiFiManager::checkAndTryReconnecting();

  ///////////////////////

  if ((WiFi.status() == WL_CONNECTED)) { //Check the current connection status

    // HTTPClient
//    if (millis() - restCallInterval >= 5000) {
//      HTTPClient http;
//   
//      http.begin("api.thingshub.org", 3000, "/api", root_ca); //Specify the URL and certificate
//      
//      int httpCode = http.GET();                                                  //Make the request
//      if (httpCode > 0) { //Check for the returning code
//   
//          String payload = http.getString();
//          DPRINTLN(httpCode);
//          DPRINTLN(payload);
//        }
//   
//      else {
//        Serial.println(httpCode);
//      }
//   
//      http.end(); //Free the resources

//      restCallInterval = millis();
//    }

    //
    SocketIOManager::loop();
  }
}
