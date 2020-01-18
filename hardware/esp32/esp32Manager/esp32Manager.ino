// Per la gestione dello overflow ho utilizzato la soluzione proposta da https://www.leonardomiliani.com/2012/come-gestire-loverflow-di-millis/

#include "WiFi.h"
#include "HTTPClient.h"
#include "SocketIOclient.h"

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

const char* WiFiManager::wifi_ssid      = "";
const char* WiFiManager::wifi_password  = "";

const unsigned long WiFiManager::check_wifi_interval = 15000;
unsigned long       WiFiManager::check_wifi          = 0;
boolean             WiFiManager::wifi_reconnection   = false;

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

#define USE_SERIAL Serial

SocketIOclient  webSocket;

void event(socketIOmessageType_t type, uint8_t * payload, size_t length) {
  DPRINTLN("ciao");
}

//////////////////////////

int ledPin = 2;

void setup()
{
  Serial.begin(115200);

  // WiFi setup
  WiFiManager::connect();

  //
  webSocket.onEvent(event);
  webSocket.beginSocketIOSSLWithCA("api.thingshub.org", 3000, "/socket.io/?EIO=3&token=491e94d9-9041-4e5e-b6cb-9dad91bbf63d", root_ca, "");
  
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
    webSocket.loop();
  }
 
  delay(10000);
}
