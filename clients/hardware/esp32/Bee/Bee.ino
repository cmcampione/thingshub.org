// Per la gestione dello overflow di millis () ho utilizzato la soluzione proposta da https://www.leonardomiliani.com/2012/come-gestire-loverflow-di-millis/
// Useful link https://lastminuteengineers.com/esp32-arduino-ide-tutorial/

#include <map>
#include <vector>
#include "WiFi.h"
#include "HTTPClient.h"
#include "WebSocketsClient.h"
#include "SocketIOclient.h"
#include "RCSwitch.h"
#include "ArduinoJson.h"
#include "BuildDefine.h"
#include "antitheft.h"

// Max capacity for actual msg
const int sensorsCount = 10;
const int sensorsFieldCount = 4;

// ESP32
const int msgCapacity = 1024; // To Check. Do not move from here, some compilation error or compiler bug
const int sensorsCapacity = JSON_OBJECT_SIZE(1) + JSON_ARRAY_SIZE(sensorsCount) + sensorsCount * JSON_OBJECT_SIZE(sensorsFieldCount) + 175; // To Change

//
class RCSensorsManager
{
private:
  static RCSwitch mySwitch;  
public:
  static void init(int pinN)
  {
    mySwitch.enableReceive(pinN);
  }
public:
  static bool available()
  {
    return mySwitch.available();
  }
  static long getReceivedValue()
  {
    long value = mySwitch.getReceivedValue();
#ifdef DEBUG_RCSENSORSMANAGER
    DPRINT("RCSENSORSMANAGER - Received ");
    DPRINT(value);
    DPRINT(" / ");
    DPRINT(mySwitch.getReceivedBitlength());
    DPRINT("bit ");
    DPRINT("Protocol: ");
    DPRINT(mySwitch.getReceivedProtocol());
    DPRINTLN();
#endif
    mySwitch.resetAvailable();
    return value;
  }
};
RCSwitch RCSensorsManager::mySwitch = RCSwitch(); // ToDo: Do a copy? As example

//
struct PWM
{
  int freq;
  int channel;
  int res;
};
struct Pin
{
  Pin() : pAntiTheft(NULL) {
  }
  ~Pin() {
    if (pAntiTheft != NULL)
      delete pAntiTheft;
  }
  
  String kind; // ToDo: Could be a enum
  String _id;

  int min;
  int max;
  
  PWM         pwm;        // Valid only for kind == "PWM"

  AntiTheft*  pAntiTheft; // Valid only for kind == "AT"

  int value;
};
typedef std::map<int, Pin> pin_collection;
typedef pin_collection::const_iterator pin_const_iterator;

struct SetPointPin
{
  SetPointPin() : n(0), force(false), toggle(false) 
  {}
  int     n;
  String  id;

  bool  force;
  int   forceValue;
  bool  toggle;
};
typedef std::vector<SetPointPin> setPointPin_collection;
typedef setPointPin_collection::const_iterator setPointPin_const_iterator;

struct SetPoint
{
  int min;
  int max;

  setPointPin_collection pins;
};
typedef std::vector<SetPoint> setPoint_collection;
typedef setPoint_collection::const_iterator setPoint_const_iterator;

struct Sensor
{
  Sensor() : millis(0), now(false), value(0), pin(0), prior(false) {}

  String name; // ToDo: To Remove

  int pin;  // Can be an real or virtual pin

  bool prior;

  setPoint_collection setPoints;

  bool          now;
  unsigned long millis;
  int           value;
};
typedef std::map<String, Sensor> sensor_collection;
typedef sensor_collection::iterator sensor_iterator;
typedef sensor_collection::const_iterator sensor_const_iterator;

//
class BeeStatus
{
public:
  static const char* thingCnfg;
  static const char* thingValue;
private:
  static pin_collection pins;
  static sensor_collection sensors;
private:
  static void setupPins()
  {
    /*
    { // Pin 2 - On board led
      pins[2].kind = "DO";
      pins[2].min = 0;
      pins[2].max = 1;
      pins[2].value = LOW; // Initial
    }

    { // Pin 4 - RC sensor
      pins[4].kind = "RC";
      pins[4].min = 0;   // No matter
      pins[4].max = 0;   // No matter
      pins[4].value = 0; // Initial
    }

    { // Pin 5 - PhotoResistor Led
      pins[5].kind = "DO";
      pins[5].min = 0;
      pins[5].max = 1;
      pins[5].value = LOW; // Initial
    }

    { // Pin 23 - Buzzer
      pins[23].kind = "PWM";
      pins[23].min = 0;
      pins[23].max = 128;
      pins[23].value = 0; // Initial
      pins[23].pwm.freq = 2000;
      pins[23].pwm.channel = 1;
      pins[23].pwm.res = 8;
    }

    { // Pin 34 - PhotoResistor
      pins[34].kind = "AI";
      pins[34].min = 0;
      pins[34].max = 4095;
      pins[34].value = 0; // Initial
    }

    { // Pin 15 - Thermistor
      pins[35].kind = "AI";
      pins[35].min = 0;
      pins[35].max = 4095;
      pins[35].value = 0; // Initial
    }
    */
    { // Pin 1000 - Main AntiTheaf
      pins[1000].kind = "AT";

      AntiTheftConfig mainAntiTheftCnfg {
        "MAT-ALSTATE", 21,
        "MAT-AUSTATE", 15,  2, HIGH,
        "MAT-AULSTATE", "MAT-AURSTATE",
        "MAT-IASTATE", 4, 16, HIGH,
        //"MAT-DASTATE", 17,  5, HIGH,   // don't run
        "MAT-DASTATE", 17, 23, HIGH, // run
        //"MAT-DASTATE", 17,  3, HIGH, // don't run
        "MAT-AASTATE", 18, 19, HIGH,
        10000,
        10000,
        5000
      };
      pins[1000].pAntiTheft = new AntiTheft(mainAntiTheftCnfg);
    }

    for (pin_const_iterator it = pins.begin(); it != pins.end(); it++)
    {
      int pinN        = it->first;
      const Pin &pin  = it->second;
      if (pin.kind == "DO")
      {
        pinMode(pinN, OUTPUT);
        continue;
      }
      if (pin.kind == "RC")
      {
        RCSensorsManager::init(pinN);
        continue;
      }
      if (pin.kind == "PWM")
      {
        ledcSetup(pin.pwm.channel, pin.pwm.freq, pin.pwm.res);
        ledcAttachPin(pinN, pin.pwm.channel);
        continue;
      }
      if (pin.kind == "AI")
      {
        // Doesn't need initial setup
        continue;
      }
      if (pin.kind == "AT")
      {
        pin.pAntiTheft->setup();
        continue;
      }
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Pin n: %d kind: %s - Kind not found\n", pinN, pin.kind);
#endif
    }
  }
  static void setupSensors()
  {
    /*
    { // Telecomando 1 Apri
      sensors["8171288"].name = "Telecomando 1 Apri";
      sensors["8171288"].pin = 4;

      SetPoint setPoint;
      setPoint.min = 1;
      setPoint.max = 1;

      SetPointPin setPointOnBoardLed;
      setPointOnBoardLed.n = 2;
      setPointOnBoardLed.force = false; // Set value equal to 1
      setPointOnBoardLed.forceValue = LOW;
      setPointOnBoardLed.toggle = false;
      setPoint.pins.push_back(setPointOnBoardLed);

      SetPointPin setPointBuzzer;
      setPointBuzzer.n = 23;
      setPointBuzzer.force = true;
      setPointBuzzer.forceValue = 5; //128
      setPointBuzzer.toggle = false;
      setPoint.pins.push_back(setPointBuzzer);

      sensors["8171288"].setPoints.push_back(setPoint);
    }

    { // Telecomando 1 Chiudi
      sensors["8171284"].name = "Telecomando 1 Chiudi";
      sensors["8171284"].pin = 4;

      SetPoint setPoint;
      setPoint.min = 1;
      setPoint.max = 1;

      SetPointPin setPointOnBoardLed;
      setPointOnBoardLed.n = 2;
      setPointOnBoardLed.force = true;
      setPointOnBoardLed.forceValue = LOW;
      setPointOnBoardLed.toggle = false;
      setPoint.pins.push_back(setPointOnBoardLed);

      SetPointPin setPointBuzzer;
      setPointBuzzer.n = 23;
      setPointBuzzer.force = true;
      setPointBuzzer.forceValue = 0;
      setPointBuzzer.toggle = false;
      setPoint.pins.push_back(setPointBuzzer);

      sensors["8171284"].setPoints.push_back(setPoint);
    }

    { // Pir Salone
      sensors["31669624"].name = "Pir Salone";
      sensors["31669624"].pin = 4;
      sensors["31669624"].prior = true;

      SetPoint setPointLedOn;
      setPointLedOn.min = 1;
      setPointLedOn.max = 1;

      SetPointPin setPointPin2LedOn;
      setPointPin2LedOn.n = 2;
      setPointPin2LedOn.force = false;
      setPointPin2LedOn.forceValue = HIGH;
      setPointPin2LedOn.toggle = false;

      setPointLedOn.pins.push_back(setPointPin2LedOn);

      sensors["31669624"].setPoints.push_back(setPointLedOn);

      SetPoint setPointLedOff;
      setPointLedOff.min = 0;
      setPointLedOff.max = 0;

      SetPointPin setPointPin2LedOff;
      setPointPin2LedOff.n = 2;
      setPointPin2LedOff.force = true;
      setPointPin2LedOff.forceValue = LOW;
      setPointPin2LedOff.toggle = false;

      setPointLedOff.pins.push_back(setPointPin2LedOff);

      sensors["31669624"].setPoints.push_back(setPointLedOff);
    }

    { // Contatto Filare
      sensors["7271203"].name = "Contatto Filare";
      sensors["7271203"].pin = 4;
      sensors["7271203"].prior = true;

      SetPoint setPointLedOn;
      setPointLedOn.min = 1;
      setPointLedOn.max = 1;

      SetPointPin setPointPin2LedOn;
      setPointPin2LedOn.n = 2;
      setPointPin2LedOn.force = false;
      setPointPin2LedOn.forceValue = HIGH;
      setPointPin2LedOn.toggle = false;

      setPointLedOn.pins.push_back(setPointPin2LedOn);

      sensors["7271203"].setPoints.push_back(setPointLedOn);

      SetPoint setPointLedOff;
      setPointLedOff.min = 0;
      setPointLedOff.max = 0;

      SetPointPin setPointPin2LedOff;
      setPointPin2LedOff.n = 2;
      setPointPin2LedOff.force = true;
      setPointPin2LedOff.forceValue = LOW;
      setPointPin2LedOff.toggle = false;

      setPointLedOff.pins.push_back(setPointPin2LedOff);

      sensors["7271203"].setPoints.push_back(setPointLedOff);
    }

    { // Sensore fumi
      sensors["7830832"].name = "Sensore Fumi";
      sensors["7830832"].pin = 4;
      sensors["7830832"].prior = true;

      SetPoint setPointLedOn;
      setPointLedOn.min = 1;
      setPointLedOn.max = 1;

      SetPointPin setPointPin2LedOn;
      setPointPin2LedOn.n = 2;
      setPointPin2LedOn.force = false;
      setPointPin2LedOn.forceValue = HIGH;
      setPointPin2LedOn.toggle = false;

      setPointLedOn.pins.push_back(setPointPin2LedOn);

      sensors["7830832"].setPoints.push_back(setPointLedOn);

      SetPoint setPointLedOff;
      setPointLedOff.min = 0;
      setPointLedOff.max = 0;

      SetPointPin setPointPin2LedOff;
      setPointPin2LedOff.n = 2;
      setPointPin2LedOff.force = true;
      setPointPin2LedOff.forceValue = LOW;
      setPointPin2LedOff.toggle = false;

      setPointLedOff.pins.push_back(setPointPin2LedOff);

      sensors["7830832"].setPoints.push_back(setPointLedOff);
    }

    { // Luminosità 01
      sensors["PhotoResistor-01"].name = "Luminosità 01";
      sensors["PhotoResistor-01"].pin = 34;

      SetPoint setPointLedOn;
      setPointLedOn.min = 0;
      setPointLedOn.max = 250;

      SetPointPin setPointPin5LedOn;
      setPointPin5LedOn.n = 5;
      setPointPin5LedOn.force = true;
      setPointPin5LedOn.forceValue = 1;
      setPointPin5LedOn.toggle = false;

      setPointLedOn.pins.push_back(setPointPin5LedOn);

      sensors["PhotoResistor-01"].setPoints.push_back(setPointLedOn);

      SetPoint setPointLedOff;
      setPointLedOff.min = 251;
      setPointLedOff.max = 4095;

      SetPointPin setPointPin5LedOff;
      setPointPin5LedOff.n = 5;
      setPointPin5LedOff.force = true;
      setPointPin5LedOff.forceValue = 0;
      setPointPin5LedOff.toggle = false;

      setPointLedOff.pins.push_back(setPointPin5LedOff);

      sensors["PhotoResistor-01"].setPoints.push_back(setPointLedOff);
    }

    { // Temperatura 01
      sensors["Temperatura-01"].name = "Temperatura 01";
      sensors["Temperatura-01"].pin = 35;
    }
    */

    { // AntiTheaf - ArmedUnarmed
      sensors["MAT-AUSTATE"].name = "Antifurto Principale - ArmatoDisarmato";
      sensors["MAT-AUSTATE"].pin = 1000;
      // sensors["MAT-AUSTATE"].prior = true;
    }
    { // AntiTheaf - ArmedUnarmedLocal
      sensors["MAT-AULSTATE"].name = "Antifurto Principale - ArmatoDisarmato Local";
      sensors["MAT-AULSTATE"].pin = 1000;
      // sensors["MAT-AUSTATE"].prior = true;
    }
    { // AntiTheaf - ArmedUnarmedRemote
      sensors["MAT-AURSTATE"].name = "Antifurto Principale - ArmatoDisarmato Remote";
      sensors["MAT-AURSTATE"].pin = 1000;
      // sensors["MAT-AUSTATE"].prior = true;

      SetPoint setPoint;
      setPoint.min = 0;
      setPoint.max = 1;

      SetPointPin setPointRemoteSwitch;
      setPointRemoteSwitch.n = 1000;
      setPointRemoteSwitch.id = "MAT-AURSTATE";
      setPointRemoteSwitch.force = false; // Set value equal to 1
      setPointRemoteSwitch.forceValue = LOW;
      setPointRemoteSwitch.toggle = true;
      setPoint.pins.push_back(setPointRemoteSwitch);

      sensors["MAT-AURSTATE"].setPoints.push_back(setPoint);
    }
    { // AntiTheaf - AlarmState
      sensors["MAT-ALSTATE"].name = "Antifurto Principale - Allarme on-off";
      sensors["MAT-ALSTATE"].pin = 1000;
      sensors["MAT-ALSTATE"].prior = true;
    }
    { // AntiTheaf - Porte balcone
      sensors["MAT-IASTATE"].name = "Antifurto Principale - Porte balcone aperte-chiuse";
      sensors["MAT-IASTATE"].pin = 1000;
      // sensors["MAT-IASTATE"].prior = true;
    }
    { // AntiTheaf - Porta ingresso
      sensors["MAT-DASTATE"].name = "Antifurto Principale - Porta ingresso aperta-chiusa";
      sensors["MAT-DASTATE"].pin = 1000;
      // sensors["MAT-DASTATE"].prior = true;
    }
    { // AntiTheaf - Anti Tamper
      sensors["MAT-AASTATE"].name = "Antifurto Principale - Anti Tamper aperto-chiuso";
      sensors["MAT-AASTATE"].pin = 1000;
      // sensors["MAT-AASTATE"].prior = true;
    }
  }
public:
  static void setup()
  {
    setupPins();
    setupSensors();
  }
private:
  static void setPinValue(int pinN, int value)
  {
    if (pins.find(pinN) == pins.end())
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Pin n: %d not found\n", pinN);
#endif
      return;
    }

    Pin& pin = pins[pinN];
    
    if (pin.kind == "RC" || pin.kind == "DI" || pin.kind == "AI")
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Pin n: %d kind: %s - Pin is not set for write\n", pinN, pin.kind.c_str());
#endif
      return;
    }
    if (value < pin.min || value > pin.max)
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Pin n: %d value: %d - Value is out of range\n", pinN, value);
#endif
      return;
    }
    if (pin.value == value)
    {
      return;
    }
    if (pin.kind == "DO")
    {
      digitalWrite(pinN, value);
      pin.value = value;
      return;
    }
    if (pin.kind == "PWM")
    {
      ledcWrite(pin.pwm.channel, value);
      pin.value = value;
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Pin n: %d kind: %s - PWM value: %d\n", pinN, pin.kind, value);
#endif      
      return;
    }
#ifdef DEBUG_BEESTATUS
    DPRINTF("BEESTATUS - Pin n: %d kind: %s not recognized\n", pinN, pin.kind.c_str());
#endif
  }
  static void togglePinValue(int pinN, const char* id)
  {
    if (pins.find(pinN) == pins.end())
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Pin n: %d not found\n", pinN);
#endif
      return;
    }

    Pin& pin = pins[pinN];
    if (pin.kind == "RC" || pin.kind == "DI" || pin.kind == "AI")
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Pin n: %d kind: %s - Pin is not set for write\n", pinN, pin.kind.c_str());
#endif
      return;
    }

    int value = pin.min;
    if (pin.value == pin.min)
      value = pin.max;
    if (pin.value == pin.max)
      value = pin.min;

    if (pin.kind == "DO")
    {
      digitalWrite(pinN, value);
      pin.value = value;
      return;
    }
    if (pin.kind == "PWM")
    {
      ledcWrite(pin.pwm.channel, value);
      pin.value = value;
      return;
    }
    if (pin.kind == "AT") {
      pin.pAntiTheft->toggleStateValue(id);
      return;
    }
#ifdef DEBUG_BEESTATUS
    DPRINTF("BEESTATUS - Pin n: %d kind: %s - Kind not recognized\n", pinN, pin.kind);
#endif
  }
private:
  static void checkSetPoints(const setPoint_collection& setPoints, int value)
  {
    for (setPoint_const_iterator it = setPoints.begin(); it != setPoints.end(); it++)
    {
      const SetPoint& setPoint = *it;
      if (value >= setPoint.min && value <= setPoint.max)
      {
        for (setPointPin_const_iterator n = setPoint.pins.begin(); n != setPoint.pins.end(); n++)
        {
          const SetPointPin& setPointPin = *n;
          if (setPointPin.force == true)
          {
#ifdef DEBUG_BEESTATUS_VERBOSE
            DPRINTF("BEESTATUS - SetPointPin n: %d value: %d forced\n", setPointPin.n, setPointPin.forceValue);
#endif
            setPinValue(setPointPin.n, setPointPin.forceValue);
            continue;
          }
          if (setPointPin.toggle == true)
          {
            togglePinValue(setPointPin.n, setPointPin.id.c_str());
            continue;
          }
          setPinValue(setPointPin.n, value);
        }
      }
    }
  }
private:
  static bool setSensorsValueFromPin(int pin, int value)
  {
    bool immediately = false;
    for (sensor_iterator it = sensors.begin(); it != sensors.end(); it++)
    {
      Sensor& sensor = it->second;
      if (sensor.pin != pin)
        continue;

      if (immediately == false)
        immediately = sensor.prior;

      sensor.now = true;
      sensor.millis = millis();
      sensor.value = value;

      checkSetPoints(sensor.setPoints, value);
    }
    return immediately;
  }
public:
  static bool setSensorValue(const char* sensorId, int value)
  {
    if (sensors.find(sensorId) == sensors.end()) 
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Sensor id: %s not found\n", sensorId);
#endif
      return false;
    }
    Sensor& sensor = sensors[sensorId];

    if (sensor.value == value)
      return false;
      
    sensor.now = true;
    sensor.millis = millis();
    sensor.value = value;

    checkSetPoints(sensor.setPoints, value);

    return sensor.prior;
  }
public:
  static bool loop()
  {
    bool immediately = false;
    for (pin_const_iterator it = pins.begin(); it != pins.end(); it++)
    {
      int pinN        = it->first;
      const Pin& pin  = it->second;
#ifdef DEBUG_BEESTATUS_VERBOSE
      // DPRINTF("BEESTATUS - Elaborating Pin n: %d kind: %s\n", pinN, pin.kind.c_str());
#endif
      if (pin.kind == "DO")
      {
        continue;
      }
      if (pin.kind == "PWM")
      {
        continue;
      }
      if (pin.kind == "AI")
      {
        int value = analogRead(pinN);
#ifdef DEBUG_BEESTATUS_VERBOSE
        DPRINTF("BEESTATUS - Read Pin n: %d kind: %s analogic value: %d\n", pinN, pin.kind.c_str(), value);
#endif
        int prior = setSensorsValueFromPin(pinN, value);
        if (immediately == false)
          immediately = prior;
        continue;
      }
      if (pin.kind == "RC")
      {
        if (RCSensorsManager::available() == false)
          continue;

        long sensorId = RCSensorsManager::getReceivedValue();
        String sensorIdStr(sensorId);
#ifdef DEBUG_BEESTATUS
        DPRINTF("BEESTATUS - Read Pin n: %d kind: %s sensor id: %s\n", pinN, pin.kind.c_str(), sensorIdStr.c_str());
#endif
        int prior = setSensorValue(sensorIdStr.c_str(), HIGH);
        if (immediately == false)
          immediately = prior;
        continue;
      }
      if (pin.kind == "AT") {
        pin.pAntiTheft->loop();
        for (AntiTheft::const_iterator it = pin.pAntiTheft->begin(); it != pin.pAntiTheft->end(); it++) {
          String      stateId     = it->first;
          const int*  stateValue  = it->second;
          int prior = setSensorValue(stateId.c_str(), *stateValue);
          if (immediately == false)
            immediately = prior;
        }
        continue;
      }
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Pin n: %d kind: %s not found\n", pinN, pin.kind.c_str());
#endif
    }
    return immediately;
  }
public:
  static void toJson(StaticJsonDocument<sensorsCapacity>& doc)
  {
    // Sensor model sample
    /*
        {
          "sensors": [
            {
              "id": "123456",
              "now": "true",
              "millis": 123456,
              "value": 123456
            },
            {
              "id": "123456",
              "now": "false",
              "millis": 123456,
              "value": 123456
            },
            ....
          ]
        }
      */
#ifdef DEBUG_BEESTATUS_VERBOSE
    // Declare a buffer to hold the result
    char output[1024]; // To check
    int count = 0;
#endif
    doc.clear();
    JsonArray sensorsNode = doc.createNestedArray("sensors");
    for (sensor_iterator it = sensors.begin(); it != sensors.end(); it++)
    {
      Sensor& sensorValue = it->second;

      JsonObject sensor = sensorsNode.createNestedObject();
      sensor["id"]      = it->first;
      sensor["now"]     = sensorValue.now;
      sensor["millis"]  = sensorValue.millis;
      sensor["value"]   = sensorValue.value;

      sensorValue.now = false;

#ifdef DEBUG_BEESTATUS_VERBOSE
      serializeJson(sensor, output);
      DPRINT("BEESTATUS - ");
      DPRINT(count++);
      DPRINT(": ");
      DPRINTLN(output);
#endif
    }
#ifdef DEBUG_BEESTATUS_VERBOSE
    // Produce a minified JSON document
    serializeJson(doc, output);
    DPRINTLN(output);
#endif
  }
};

const char* BeeStatus::thingCnfg = "";
const char* BeeStatus::thingValue = "f4c3c80b-d561-4a7b-80a5-f4805fdab9bb";

pin_collection BeeStatus::pins;
sensor_collection BeeStatus::sensors;

// WiFi
class WiFiManager
{
private:
  static const char *wifi_ssid;
  static const char *wifi_password;

  static const unsigned long check_wifi_interval;

  static boolean wifi_reconnection;
  static unsigned long check_wifi;

public:
  WiFiManager()
  {
  }
  static void connect()
  {
    do
    {
      WiFi.begin(WiFiManager::wifi_ssid, WiFiManager::wifi_password);
      delay(5000);
      DPRINTLN("Connecting to WiFi...");
    } while (WiFi.status() != WL_CONNECTED);
    DPRINTLN("Connected to the WiFi");
  }
  static void loop()
  {
    // if wifi is down, try reconnecting every 15 seconds
    if (WiFi.status() != WL_CONNECTED)
    {
      WiFiManager::wifi_reconnection = true;
      if (millis() - WiFiManager::check_wifi >= WiFiManager::check_wifi_interval)
      {
        WiFiManager::check_wifi = millis();
        WiFi.disconnect();
        WiFi.begin(WiFiManager::wifi_ssid, WiFiManager::wifi_password);
        DPRINTLN("Reconnecting to WiFi...");
      }
    }
    if ((WiFi.status() == WL_CONNECTED) && (WiFiManager::wifi_reconnection == true))
    {
      WiFiManager::wifi_reconnection = false;
      DPRINTLN("Reconnected to WiFi");
    }
  }
};

#ifdef WIFISETUPEXTERNAL

#include "WiFiSetup.h"

#else

const char *WiFiManager::wifi_ssid = "";
const char *WiFiManager::wifi_password = "";

#endif

const unsigned long WiFiManager::check_wifi_interval = 15000;
unsigned long WiFiManager::check_wifi = 0;
boolean WiFiManager::wifi_reconnection = false;

// SocketIO
class SocketIOManager
{
private:
  static SocketIOclient webSocket;
  static std::map<String, std::function<void(const StaticJsonDocument<msgCapacity>&)>> events;

private:
  static void trigger(const StaticJsonDocument<msgCapacity> &jMsg)
  {
    const char* event = jMsg[0];
    auto e = events.find(event);
    if (e != events.end())
    {
      e->second(jMsg);
    }
    else
    {
#ifdef DEBUG_SOCKETIOMANAGER
      DPRINTF("DEBUG_SOCKETIOMANAGER - event %s not found. %d events available\n", event, events.size());
#endif
    }
  }
  static void handleEvent(socketIOmessageType_t type, uint8_t *payload, size_t length)
  {
    StaticJsonDocument<msgCapacity> jMsg;
    switch (type)
    {
      case sIOtype_DISCONNECT:
            DPRINTF("[IOc] Disconnected!\n");
            break;
      case sIOtype_CONNECT:
          DPRINTF("[IOc] Connected to url: %s\n", payload);
          // join default namespace (no auto join in Socket.IO V3)
          webSocket.send(sIOtype_CONNECT, "/");
          break;
      case sIOtype_ACK:
          DPRINTF("[IOc] get ack: %u\n", length);
          break;
      case sIOtype_ERROR:
          DPRINTF("[IOc] get error: %u\n", length);
          break;
      case sIOtype_BINARY_EVENT:
          DPRINTF("[IOc] get binary: %u\n", length);
          break;
      case sIOtype_BINARY_ACK:
          DPRINTF("[IOc] get binary ack: %u\n", length);
          break;
      case sIOtype_EVENT:
        DeserializationError error = deserializeJson(jMsg, payload);
        if (error)
        {
  #ifdef DEBUG_SOCKETIOMANAGER
          DPRINTF("DEBUG_SOCKETIOMANAGER - deserializeJson() failed: socketIOmessageType_t = %c\n", type);
          DPRINTF("DEBUG_SOCKETIOMANAGER - payload = %s\n", length == 0 ? (uint8_t *)"" : payload);
          DPRINTF("DEBUG_SOCKETIOMANAGER - deserializeJson() error: ");
          DPRINTLN(error.c_str());
  #endif
          return;
        }
        trigger(jMsg);
        break;
    }
  }

public:
  static void on(const char *event, std::function<void(const StaticJsonDocument<msgCapacity> &)> func)
  {
    events[event] = func;
  }
  static void remove(const char *event)
  {
    auto e = events.find(event);
    if (e != events.end())
    {
      events.erase(e);
    }
    else
    {
#ifdef DEBUG_SOCKETIOMANAGER
      DPRINTF("DEBUG_SOCKETIOMANAGER - event %s not found, can not be removed\n", event);
#endif
    }
  }
  static void beginSocketSSLWithCA(const char *host, uint16_t port, const char *url = "/socket.io/?EIO=4", const char *CA_cert = NULL, const char *protocol = "arduino")
  {
    SocketIOManager::webSocket.configureEIOping(true);
    SocketIOManager::webSocket.onEvent(handleEvent);                     
    SocketIOManager::webSocket.beginSocketIOSSLWithCA(host, port, url, CA_cert, protocol); 
  }
  static void loop()
  {
    SocketIOManager::webSocket.loop();
  }
};
SocketIOclient SocketIOManager::webSocket;
std::map<String, std::function<void(const StaticJsonDocument<msgCapacity> &)>> SocketIOManager::events;

//
const char* root_ca =
    "-----BEGIN CERTIFICATE-----\n"
    "MIIDSjCCAjKgAwIBAgIQRK+wgNajJ7qJMDmGLvhAazANBgkqhkiG9w0BAQUFADA/\n"
    "MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT\n"
    "DkRTVCBSb290IENBIFgzMB4XDTAwMDkzMDIxMTIxOVoXDTIxMDkzMDE0MDExNVow\n"
    "PzEkMCIGA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMRcwFQYDVQQD\n"
    "Ew5EU1QgUm9vdCBDQSBYMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\n"
    "AN+v6ZdQCINXtMxiZfaQguzH0yxrMMpb7NnDfcdAwRgUi+DoM3ZJKuM/IUmTrE4O\n"
    "rz5Iy2Xu/NMhD2XSKtkyj4zl93ewEnu1lcCJo6m67XMuegwGMoOifooUMM0RoOEq\n"
    "OLl5CjH9UL2AZd+3UWODyOKIYepLYYHsUmu5ouJLGiifSKOeDNoJjj4XLh7dIN9b\n"
    "xiqKqy69cK3FCxolkHRyxXtqqzTWMIn/5WgTe1QLyNau7Fqckh49ZLOMxt+/yUFw\n"
    "7BZy1SbsOFU5Q9D8/RhcQPGX69Wam40dutolucbY38EVAjqr2m7xPi71XAicPNaD\n"
    "aeQQmxkqtilX4+U9m5/wAl0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNV\n"
    "HQ8BAf8EBAMCAQYwHQYDVR0OBBYEFMSnsaR7LHH62+FLkHX/xBVghYkQMA0GCSqG\n"
    "SIb3DQEBBQUAA4IBAQCjGiybFwBcqR7uKGY3Or+Dxz9LwwmglSBd49lZRNI+DT69\n"
    "ikugdB/OEIKcdBodfpga3csTS7MgROSR6cz8faXbauX+5v3gTt23ADq1cEmv8uXr\n"
    "AvHRAosZy5Q6XkjEGB5YGV8eAlrwDPGxrancWYaLbumR9YbK+rlmM6pZW87ipxZz\n"
    "R8srzJmwN0jP41ZL9c8PDHIyh8bwRLtTcm1D9SZImlJnt1ir/md2cXjbDaJWFBM5\n"
    "JDGFoqgCWjBH4d1QB7wCCZAA62RjYJsWvIjJEubSfZGL+T0yjWW06XyxV3bqxbYo\n"
    "Ob8VZRzI9neWagqNdwvYkQsEjgfbKbYK7p2CNTUQ\n"
    "-----END CERTIFICATE-----\n";

// HTTPClient
unsigned long restCallInterval = 0;

/////////////////////////////

void onUpdateThingValue(const StaticJsonDocument<msgCapacity>& jMsg)
{
#ifdef DEBUG_SOCKETIOMANAGER
  DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: begin");
#endif
  if (jMsg.isNull())
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: jMsg.isNull()");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: end");
#endif
    return;
  }
  if (!jMsg.is<JsonArray>())
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: !jMsg.is<JsonArray>()");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: end");
#endif
    return;
  }
  if (jMsg.size() != 4)
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: jMsg.size() != 4");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: end");
#endif
    return;
  }

  // Only Command for this bee
  bool asCmd = jMsg[3];
  if (!asCmd)
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: !asCmd");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: end");
#endif
    return;
  }

#ifdef DEBUG_SOCKETIOMANAGER
  DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Command begin");
#endif

  const char* thingId = jMsg[1];
  // Only one thing for this bee
  if (strcmp(thingId, BeeStatus::thingValue) != 0)
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: strcmp(thingId, BeeStatus::thing) != 0");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Command end");
#endif
    return;
  }

  auto beeObj = jMsg[2].as<JsonObject>();
  if (!beeObj.containsKey("sensors"))
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: !beeObj.containsKey('sensors')");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Command end");
#endif
    return;
  }

  auto sensors = beeObj["sensors"].as<JsonArray>();
  for (auto sensor : sensors)
  {
    if (!sensor.containsKey("id"))
      continue;

    String sensorId = sensor["id"];

    int value = 0;
    if (sensor.containsKey("value"))
    {
      value = sensor["value"];
    }
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTF("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Sensor ID: %s Value: %d\n", sensorId.c_str(), value);
#endif
    BeeStatus::setSensorValue(sensorId.c_str(), value);
  }

#ifdef DEBUG_SOCKETIOMANAGER
  DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Command end");
#endif
}

void setup()
{
  Serial.begin(115200);
  // BeeStatus setup
  BeeStatus::setup();
  // WiFi setup
  WiFiManager::connect();
  // SocketIO setup
  SocketIOManager::on("onUpdateThingValue", onUpdateThingValue);
  SocketIOManager::beginSocketSSLWithCA("api.thingshub.org", 3000, "/socket.io/?EIO=4&token=491e94d9-9041-4e5e-b6cb-9dad91bbf63d", root_ca, "arduino");
}

HTTPClient http;
String url = String("/api/things/") + String(BeeStatus::thingValue) + String("/value");
char jsonDoc[512];

void loop()
{
  //
  bool immediately = BeeStatus::loop();
  // Check if wifi is ok, eventually try reconnecting every "WiFiManager::check_wifi_interval" milliseconds
  WiFiManager::loop();
  if (WiFi.status() != WL_CONNECTED)
    return;
  //

  if ((immediately == true) || (millis() - restCallInterval >= 5000))
  {
    StaticJsonDocument<sensorsCapacity> doc;
    BeeStatus::toJson(doc);

/*
    HTTPClient http;
    String url = String("/api/things/") + String(BeeStatus::thingValue) + String("/value");
    http.begin("api.thingshub.org", 3000, url, root_ca); // Specify the URL and certificate
    http.addHeader("thapikey", "491e94d9-9041-4e5e-b6cb-9dad91bbf63d");
    http.addHeader("Content-Type", "application/json");
    char jsonDoc[512];
*/

    http.begin("api.thingshub.org", 3000, url, root_ca); // Specify the URL and certificate
    http.addHeader("thapikey", "491e94d9-9041-4e5e-b6cb-9dad91bbf63d");
    http.addHeader("Content-Type", "application/json");
    
    serializeJson(doc, jsonDoc);

    int httpCode = http.PUT(jsonDoc);
#ifdef DEBUG_RESTCALL
    DPRINTF("RestCall Http return code : %d\n", httpCode);
#endif
    if (httpCode > 0)
    {
      // Check for the returning code
      String payload = http.getString();
#ifdef DEBUG_RESTCALL
      DPRINT("RestCall return payload : ");
      DPRINTLN(payload);
#endif
    }

    http.end(); //Free resources

    restCallInterval = millis();

    DPRINT("getFreeHeap : ");
    DPRINTLN(ESP.getFreeHeap());
  }

  //
  SocketIOManager::loop();
}
