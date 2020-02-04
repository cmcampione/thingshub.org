// Per la gestione dello overflow di millis () ho utilizzato la soluzione proposta da https://www.leonardomiliani.com/2012/come-gestire-loverflow-di-millis/

#include <map>
#include <vector>
#include <ArduinoJson.h>
#include "WiFi.h"
#include "HTTPClient.h"
#include "SocketIOclient.h"
#include "RCSwitch.h"
#include "BuildDefine.h"

//
const int msgCapacity = 2*JSON_ARRAY_SIZE(3) + JSON_OBJECT_SIZE(1) + 3*JSON_OBJECT_SIZE(4) + 180;// To Check. Do not move from here, some compilation error or compiler bug

//
int ledPin = 2;
int ledStatus = LOW;

//
typedef std::function<void(const char* value)> SensorHandler;
struct Sensor {
  Sensor() : millis(0),now(false) {}
  bool          now;
  unsigned long millis;
  String        value;
  SensorHandler sensorHandler;
};

void onSensorDummy(const char* value) {  
}

void onSensorPin2On(const char* value) {  
  ledStatus = HIGH;
  digitalWrite(ledPin, ledStatus);
}

void onSensorPin2Off(const char* value) {  
  ledStatus = LOW;
  digitalWrite(ledPin, ledStatus);
}

const int sensorsCount      = 3;
const int sensorsFieldCount = 4;
const int sensorsCapacity   = JSON_OBJECT_SIZE(1) + JSON_ARRAY_SIZE(sensorsCount) + sensorsCount*JSON_OBJECT_SIZE(sensorsFieldCount) + 91;
class BeeStatus {
  public:
    static const char* thing;
  private:
    static std::map<long,Sensor> sensors;
  public:
    static void init() {
      sensors[8171288].sensorHandler = onSensorPin2On;
      sensors[8171284].sensorHandler = onSensorPin2Off;
      sensors[31669624].sensorHandler = onSensorDummy;
    }
    static void setSensorValue(long idSensor, const char* value) {
      if (BeeStatus::sensors.find(idSensor) != BeeStatus::sensors.end()) {
        Sensor& sensorValue = BeeStatus::sensors[idSensor];
        sensorValue.now = true;
        sensorValue.millis = millis();
        sensorValue.value  = value;
        if (sensorValue.sensorHandler)
          sensorValue.sensorHandler(value);
#ifdef DEBUG_BEESTATUS            
        DPRINTLN("Sensor id found");
#endif
      }
    }
    static bool checkChanges() {
      for (std::map<long,Sensor>::const_iterator it = BeeStatus::sensors.begin(); it != BeeStatus::sensors.end(); it++)
      {
        const Sensor& sensorValue = it->second;
        if (sensorValue.now)
          return true;
      }
      return false;
    }
    static void toJson(StaticJsonDocument<sensorsCapacity>& doc) {
    // Sensor model sample
    /*
      {
        "sensors": [
          {
            "id": "123456",
            "now": "true",
            "millis": 123456,
            "value": "dummyVal"
          },
          {
            "id": "123456",
            "now": "false",
            "millis": 123456,
            "value": "dummyVal"
          }
        ]
      }
    */
  #ifdef DEBUG_BEESTATUS
      // Declare a buffer to hold the result
      char output[512];// To check
      int count = 0;    
  #endif
      doc.clear();
      JsonArray sensors = doc.createNestedArray("sensors");
      for (std::map<long,Sensor>::iterator it = BeeStatus::sensors.begin(); it != BeeStatus::sensors.end(); it++)
      {
        Sensor& sensorValue = it->second;
        
        JsonObject sensor = sensors.createNestedObject();
        sensor["id"]     = it->first;
        sensor["now"]    = sensorValue.now;
        sensor["millis"] = sensorValue.millis;
        sensor["value"]  = sensorValue.value;
        
        sensorValue.now = false;
        
  #ifdef DEBUG_BEESTATUS      
        serializeJson(sensor, output);
        DPRINT(count++);
        DPRINT(": ");
        DPRINTLN(output);
  #endif
      }
  #ifdef DEBUG_BEESTATUS
      // Produce a minified JSON document
      serializeJson(doc, output);
      DPRINTLN(output);
  #endif    
    }
};
const char* BeeStatus::thing = "f4c3c80b-d561-4a7b-80a5-f4805fdab9bb";
std::map<long,Sensor> BeeStatus::sensors;

//
class RCSensorsManager {
  private:
    static RCSwitch mySwitch;
    static const int pin; // To Check: Interrupt or pin? In my dev board i use D4 gpio and it works
  public:
    static void init() {
      RCSensorsManager::mySwitch.enableReceive(RCSensorsManager::pin);  // Pin 4 or interrupt?
    }
  public:
    static void updateSensorsStatus() {
      if (mySwitch.available()) {
#ifdef DEBUG_RCSENSORSMANAGER
        DPRINT("Received ");
        DPRINT( mySwitch.getReceivedValue());
        DPRINT(" / ");
        DPRINT( mySwitch.getReceivedBitlength());
        DPRINT("bit ");
        DPRINT("Protocol: ");
        DPRINT( mySwitch.getReceivedProtocol());    
        DPRINTLN();
#endif
        long sensorId = mySwitch.getReceivedValue();
        BeeStatus::setSensorValue(sensorId,"true");

        mySwitch.resetAvailable();
      }
    }
};
 RCSwitch RCSensorsManager::mySwitch = RCSwitch();
 const int RCSensorsManager::pin = 4;

// WiFi
class WiFiManager {
  private:
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
    static void checkConnection() {
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

// SocketIO
class SocketIOManager {
  private:
    static SocketIOclient webSocket;
    static std::map<String, std::function<void (const StaticJsonDocument<msgCapacity>&)>> events;
  private:
    static void trigger(const StaticJsonDocument<msgCapacity>& jMsg) {
      const char* event = jMsg[0];
      auto e = events.find(event);
      if(e != events.end()) {
#ifdef DEBUG_SOCKETIOMANAGER
        DPRINTF("trigger event %s\n", event);
#endif
        e->second(jMsg);
      } else {
#ifdef DEBUG_SOCKETIOMANAGER        
        DPRINTF("event %s not found. %d events available\n", event, events.size());
#endif
      }
    }
    static void handleSIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
      StaticJsonDocument<msgCapacity> jMsg;
#ifdef DEBUG_SOCKETIOMANAGER
      DPRINTF("socketIOmessageType_t = %c\n", type);
      DPRINTF("payload = %s\n", length == 0 ? (uint8_t *)"" : payload);
#endif      
      switch(type) {
        case sIOtype_EVENT:
          DeserializationError error = deserializeJson(jMsg, payload);
          if (error) {
#ifdef DEBUG_SOCKETIOMANAGER            
            DPRINT(F("deserializeJson() failed: "));
            DPRINTLN(error.c_str());
#endif
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
#ifdef DEBUG_SOCKETIOMANAGER        
        DPRINTF("[SIoC] event %s not found, can not be removed\n", event);
#endif        
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

//
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

// HTTPClient 
unsigned long restCallInterval = 0;

/////////////////////////////

void onUpdateThingValue(const StaticJsonDocument<msgCapacity>& jMsg) {
  DPRINTLN("-------------------------");

  if (jMsg.isNull())
    return;
  if (!jMsg.is<JsonArray>())
    return;
  if (jMsg.size() != 3)
    return;

  const char* thingId = jMsg[1];
  DPRINTF("ThingId = %s\n",thingId);
  if (strcmp(thingId, BeeStatus::thing) != 0)
    return;

  auto beeObj = jMsg[2].as<JsonObject>();
  if (!beeObj.containsKey("sensors"))
    return;

  auto sensors = beeObj["sensors"].as<JsonArray>();
  for (auto sensor : sensors) {
    if (!sensor.containsKey("id"))
      continue;
    long sensorId = sensor["id"];

    if (!sensor.containsKey("value"))
      continue;
    const char* value = sensor["value"];
    //BeeStatus::setSensorValue(sensorId, value);

    DPRINTF("SensorId = %d\n",sensorId);
    DPRINTF("Value = %s\n",value);
  }
 }

void setup()
{
  //
  Serial.begin(115200);
  //
  pinMode(ledPin, OUTPUT);
  // BeeStatus setup
  BeeStatus::init();
  // RFSensor setup
  RCSensorsManager::init();
  // WiFi setup
  WiFiManager::connect();
  // SocketIO setup
  SocketIOManager::on("onUpdateThingValue", onUpdateThingValue);
  SocketIOManager::beginSocketIOSSLWithCA("api.thingshub.org", 3000, "/socket.io/?EIO=3&token=491e94d9-9041-4e5e-b6cb-9dad91bbf63d", root_ca, "");
}

void loop()
{
  // Check RC Sensor State change
  RCSensorsManager::updateSensorsStatus();  
  // Check if wifi is ok, eventually try reconnecting every "WiFiManager::check_wifi_interval" milliseconds
  WiFiManager::checkConnection();
  if (WiFi.status() != WL_CONNECTED)
    return;
  //
  SocketIOManager::loop();
  //
  bool immediately = BeeStatus::checkChanges();
  //
  /* if ((immediately == true) || (millis() - restCallInterval >= 5000)) {
    //
    StaticJsonDocument<sensorsCapacity> doc;
    BeeStatus::toJson(doc);

    restCallInterval = millis();
    
    HTTPClient http;
    String url = String("/api/things/") + String(BeeStatus::thing) + String("/value");
    http.begin("api.thingshub.org", 3000, url, root_ca); //Specify the URL and certificate
    http.addHeader("thapikey", "491e94d9-9041-4e5e-b6cb-9dad91bbf63d");
    http.addHeader("Content-Type", "application/json");

    char jsonDoc[512];
    serializeJson(doc, jsonDoc);

    int httpCode = http.PUT(jsonDoc);
    DPRINTLN(httpCode);
    if (httpCode > 0) { //Check for the returning code
      String payload = http.getString();
      DPRINTLN(payload);
   }
    
    http.end();  //Free resources    
  } */  
}
