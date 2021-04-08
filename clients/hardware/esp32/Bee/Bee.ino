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
  static void init(int pin)
  {
    mySwitch.enableReceive(pin);
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
struct Device
{
  Device() : pAntiTheft(NULL), kind(Device::Kind::Undefined) {
  }
  ~Device() {
    if (pAntiTheft != NULL)
      delete pAntiTheft;
  }
  public:
    enum class Kind {
        Undefined,        
        AnalogicInput,
        DigitalOutput,
        PWM,
        RC,        
        AntiTheft
      };
  
  Kind kind;              

  int pin;               // Valid only for kind == AnalogicInput, DigitalOutput, PWM, RC
  PWM pwm;               // Valid only for kind == "PWM"
  AntiTheft* pAntiTheft; // Valid only for kind == "AntiTheft"

  int min, max;          // Useful to check range value and to toggle the state

  int value;  
};
typedef std::map<int, Device> device_collection;
typedef device_collection::const_iterator device_const_iterator;

struct SetPointItem
{
  SetPointItem() : deviceId(0), force(false), toggle(false) 
  {}
  int     deviceId;

  String  itemId;

  bool  force;        // "force" has more priority than "toggle"
  int   forceValue;

  bool  toggle;
};
typedef std::vector<SetPointItem> setPointItem_collection;
typedef setPointItem_collection::const_iterator setPointItem_const_iterator;

struct SetPoint
{
  int min;
  int max;

  setPointItem_collection setPointItems;
};
typedef std::vector<SetPoint> setPoint_collection;
typedef setPoint_collection::const_iterator setPoint_const_iterator;

struct Sensor
{
  Sensor() : millis(0), now(false), value(0), deviceId(0), prior(false) {}

  String name; // ToDo: To Remove

  int deviceId;

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
  static device_collection devices;
  static sensor_collection sensors;
private:
  static void setupDevices()
  {
    // It is just a case if the device ID is equal to the pin number
/*
    { // Device 2 - On board led
      devices[2].kind = Device::Kind::DigitalOutput;
      devices[2].pin = 2;
      devices[2].min = 0;
      devices[2].max = 1;
      devices[2].value = LOW; // Initial
    }

    { // Device 4 - RC sensor
      devices[4].kind = Device::Kind::RC;
      devices[4].pin = 4;
    }

    { // Device 5 - PhotoResistor Led
      devices[5].kind = Device::Kind::DigitalOutput;
      devices[5].pin = 5;
      devices[5].min = 0;
      devices[5].max = 1;
      devices[5].value = LOW; // Initial
    }

    { // Device 23 - Buzzer
      devices[23].kind = Device::Kind::PWM;
      devices[23].pin = 23;
      devices[23].min = 0;
      devices[23].max = 128;
      devices[23].value = 0; // Initial
      devices[23].pwm.freq = 2000;
      devices[23].pwm.channel = 1;
      devices[23].pwm.res = 8;
    }

    { // Device 34 - PhotoResistor
      devices[34].kind = Device::Kind::AnalogicInput;
      devices[34].pin = 34;
      devices[34].min = 0;
      devices[34].max = 4095;
      devices[34].value = 0; // Initial
    }

    { // Device 35 - Thermistor
      devices[35].kind = Device::Kind::AnalogicInput;
      devices[35].pin = 35;
      devices[35].min = 0;
      devices[35].max = 4095;
      devices[35].value = 0; // Initial
    }
*/
    { // Device 1000 - Main AntiTheaf
      devices[1000].kind = Device::Kind::AntiTheft;
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
      devices[1000].pAntiTheft = new AntiTheft(mainAntiTheftCnfg);
    }

    for (device_const_iterator it = devices.begin(); it != devices.end(); it++)
    {
      const Device& device = it->second;
      if (device.kind == Device::Kind::DigitalOutput)
      {
        pinMode(device.pin, OUTPUT);
        continue;
      }
      if (device.kind == Device::Kind::RC)
      {
        RCSensorsManager::init(device.pin);
        continue;
      }
      if (device.kind == Device::Kind::PWM)
      {
        ledcSetup(device.pwm.channel, device.pwm.freq, device.pwm.res);
        ledcAttachPin(device.pin, device.pwm.channel);
        continue;
      }
      if (device.kind == Device::Kind::AnalogicInput)
      {
        // Doesn't need initial setup
        continue;
      }
      if (device.kind == Device::Kind::AntiTheft)
      {
        device.pAntiTheft->setup();
        continue;
      }
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Device id: %d Kind: %d - Kind not found\n", it->first, device.kind);
#endif
    }
  }
  static void setupSensors()
  {
/*    
    { // Telecomando 1 Apri
      sensors["8171288"].name = "Telecomando 1 Apri";
      sensors["8171288"].deviceId = 4;

      SetPoint setPoint;
      setPoint.min = 1;
      setPoint.max = 1;

      SetPointItem setPointOnBoardLed;
      setPointOnBoardLed.deviceId = 2;
      setPointOnBoardLed.itemId = 2; // ToDo: Could be not necessary
      setPointOnBoardLed.force = false; // Set value equal to 1
      setPointOnBoardLed.forceValue = LOW;
      setPointOnBoardLed.toggle = false;
      setPoint.setPointItems.push_back(setPointOnBoardLed);

      SetPointItem setPointBuzzer;
      setPointBuzzer.deviceId = 23;
      setPointBuzzer.itemId = 23; // ToDo: Could be not necessary
      setPointBuzzer.force = true;
      setPointBuzzer.forceValue = 5; //128
      setPointBuzzer.toggle = false;
      setPoint.setPointItems.push_back(setPointBuzzer);

      sensors["8171288"].setPoints.push_back(setPoint);
    }

    { // Telecomando 1 Chiudi
      sensors["8171284"].name = "Telecomando 1 Chiudi";
      sensors["8171284"].deviceId = 4;

      SetPoint setPoint;
      setPoint.min = 1;
      setPoint.max = 1;

      SetPointItem setPointOnBoardLed;
      setPointOnBoardLed.deviceId = 2;
      setPointOnBoardLed.itemId = 2; // ToDo: Could be not necessary
      setPointOnBoardLed.force = true;
      setPointOnBoardLed.forceValue = LOW;
      setPointOnBoardLed.toggle = false;
      setPoint.setPointItems.push_back(setPointOnBoardLed);

      SetPointItem setPointBuzzer;
      setPointBuzzer.deviceId = 23;
      setPointBuzzer.itemId = 23; // ToDo: Could be not necessary
      setPointBuzzer.force = true;
      setPointBuzzer.forceValue = 0;
      setPointBuzzer.toggle = false;
      setPoint.setPointItems.push_back(setPointBuzzer);

      sensors["8171284"].setPoints.push_back(setPoint);
    }

    { // Pir Salone
      sensors["31669624"].name = "Pir Salone";
      sensors["31669624"].deviceId = 4;
      sensors["31669624"].prior = true;

      SetPoint setPointLedOn;
      setPointLedOn.min = 1;
      setPointLedOn.max = 1;

      SetPointItem setPointItem2LedOn;
      setPointItem2LedOn.deviceId = 2;
      setPointItem2LedOn.itemId = 2; // ToDo: Could be not necessary
      setPointItem2LedOn.force = false;
      setPointItem2LedOn.forceValue = HIGH;
      setPointItem2LedOn.toggle = false;

      setPointLedOn.setPointItems.push_back(setPointItem2LedOn);

      sensors["31669624"].setPoints.push_back(setPointLedOn);

      SetPoint setPointLedOff;
      setPointLedOff.min = 0;
      setPointLedOff.max = 0;

      SetPointItem setPointItem2LedOff;
      setPointItem2LedOff.deviceId = 2;
      setPointItem2LedOff.itemId = 2; // ToDo: Could be not necessary
      setPointItem2LedOff.force = true;
      setPointItem2LedOff.forceValue = LOW;
      setPointItem2LedOff.toggle = false;

      setPointLedOff.setPointItems.push_back(setPointItem2LedOff);

      sensors["31669624"].setPoints.push_back(setPointLedOff);
    }

    { // Contatto Filare
      sensors["7271203"].name = "Contatto Filare";
      sensors["7271203"].deviceId = 4;
      sensors["7271203"].prior = true;

      SetPoint setPointLedOn;
      setPointLedOn.min = 1;
      setPointLedOn.max = 1;

      SetPointItem setPointItem2LedOn;
      setPointItem2LedOn.deviceId = 2;
      setPointItem2LedOn.itemId = 2; // ToDo: Could be not necessary
      setPointItem2LedOn.force = false;
      setPointItem2LedOn.forceValue = HIGH;
      setPointItem2LedOn.toggle = false;

      setPointLedOn.setPointItems.push_back(setPointItem2LedOn);

      sensors["7271203"].setPoints.push_back(setPointLedOn);

      SetPoint setPointLedOff;
      setPointLedOff.min = 0;
      setPointLedOff.max = 0;

      SetPointItem setPointItem2LedOff;
      setPointItem2LedOff.deviceId = 2;
      setPointItem2LedOff.itemId = 2; // ToDo: Could be not necessary
      setPointItem2LedOff.force = true;
      setPointItem2LedOff.forceValue = LOW;
      setPointItem2LedOff.toggle = false;

      setPointLedOff.setPointItems.push_back(setPointItem2LedOff);

      sensors["7271203"].setPoints.push_back(setPointLedOff);
    }

    { // Sensore fumi
      sensors["7830832"].name = "Sensore Fumi";
      sensors["7830832"].deviceId = 4;
      sensors["7830832"].prior = true;

      SetPoint setPointLedOn;
      setPointLedOn.min = 1;
      setPointLedOn.max = 1;

      SetPointItem setPointItem2LedOn;
      setPointItem2LedOn.deviceId = 2;
      setPointItem2LedOn.itemId = 2; // ToDo: Could be not necessary
      setPointItem2LedOn.force = false;
      setPointItem2LedOn.forceValue = HIGH;
      setPointItem2LedOn.toggle = false;

      setPointLedOn.setPointItems.push_back(setPointItem2LedOn);

      sensors["7830832"].setPoints.push_back(setPointLedOn);

      SetPoint setPointLedOff;
      setPointLedOff.min = 0;
      setPointLedOff.max = 0;

      SetPointItem setPointItem2LedOff;
      setPointItem2LedOff.deviceId =2;
      setPointItem2LedOff.itemId = 2; // ToDo: Could be not necessary
      setPointItem2LedOff.force = true;
      setPointItem2LedOff.forceValue = LOW;
      setPointItem2LedOff.toggle = false;

      setPointLedOff.setPointItems.push_back(setPointItem2LedOff);

      sensors["7830832"].setPoints.push_back(setPointLedOff);
    }

    { // Luminosità 01
      sensors["PhotoResistor-01"].name = "Luminosità 01";
      sensors["PhotoResistor-01"].deviceId = 34;

      SetPoint setPointLedOn;
      setPointLedOn.min = 0;
      setPointLedOn.max = 250;

      SetPointItem setPointItem5LedOn;
      setPointItem5LedOn.deviceId = 5;
      setPointItem5LedOn.itemId = 5; // ToDo: Could be not necessary
      setPointItem5LedOn.force = true;
      setPointItem5LedOn.forceValue = HIGH;
      setPointItem5LedOn.toggle = false;

      setPointLedOn.setPointItems.push_back(setPointItem5LedOn);

      sensors["PhotoResistor-01"].setPoints.push_back(setPointLedOn);

      SetPoint setPointLedOff;
      setPointLedOff.min = 251;
      setPointLedOff.max = 4095;

      SetPointItem setPointItem5LedOff;
      setPointItem5LedOff.deviceId = 5;
      setPointItem5LedOff.itemId = 5; // ToDo: Could be not necessary
      setPointItem5LedOff.force = true;
      setPointItem5LedOff.forceValue = LOW;
      setPointItem5LedOff.toggle = false;

      setPointLedOff.setPointItems.push_back(setPointItem5LedOff);

      sensors["PhotoResistor-01"].setPoints.push_back(setPointLedOff);
    }

    { // Temperatura 01
      sensors["Temperatura-01"].name = "Temperatura 01";
      sensors["Temperatura-01"].deviceId = 35;
    }
*/
    { // AntiTheaf - ArmedUnarmed
      sensors["MAT-AUSTATE"].name = "Antifurto Principale - ArmatoDisarmato";
      sensors["MAT-AUSTATE"].deviceId = 1000;
      // sensors["MAT-AUSTATE"].prior = true;
    }
    { // AntiTheaf - ArmedUnarmedLocal
      sensors["MAT-AULSTATE"].name = "Antifurto Principale - ArmatoDisarmato Local";
      sensors["MAT-AULSTATE"].deviceId = 1000;
      // sensors["MAT-AUSTATE"].prior = true;
    }
    { // AntiTheaf - ArmedUnarmedRemote
      sensors["MAT-AURSTATE"].name = "Antifurto Principale - ArmatoDisarmato Remote";
      sensors["MAT-AURSTATE"].deviceId = 1000;
      // sensors["MAT-AUSTATE"].prior = true;

      SetPoint setPoint;
      setPoint.min = LOW;
      setPoint.max = HIGH;

      SetPointItem setPointRemoteArmUnarmItem;
      setPointRemoteArmUnarmItem.deviceId = 1000;
      setPointRemoteArmUnarmItem.itemId = "MAT-AURSTATE";
      setPointRemoteArmUnarmItem.force = false;
      setPointRemoteArmUnarmItem.forceValue = LOW;
      setPointRemoteArmUnarmItem.toggle = false;
      setPoint.setPointItems.push_back(setPointRemoteArmUnarmItem);

      sensors["MAT-AURSTATE"].setPoints.push_back(setPoint);
    }
    { // AntiTheaf - AlarmState
      sensors["MAT-ALSTATE"].name = "Antifurto Principale - Allarme on-off";
      sensors["MAT-ALSTATE"].deviceId = 1000;
      sensors["MAT-ALSTATE"].prior = true;
    }
    { // AntiTheaf - Porte balcone
      sensors["MAT-IASTATE"].name = "Antifurto Principale - Porte balcone aperte-chiuse";
      sensors["MAT-IASTATE"].deviceId = 1000;
      // sensors["MAT-IASTATE"].prior = true;
    }
    { // AntiTheaf - Porta ingresso
      sensors["MAT-DASTATE"].name = "Antifurto Principale - Porta ingresso aperta-chiusa";
      sensors["MAT-DASTATE"].deviceId = 1000;
      // sensors["MAT-DASTATE"].prior = true;
    }
    { // AntiTheaf - Anti Tamper
      sensors["MAT-AASTATE"].name = "Antifurto Principale - Anti Tamper aperto-chiuso";
      sensors["MAT-AASTATE"].deviceId = 1000;
      // sensors["MAT-AASTATE"].prior = true;
    }
  }
public:
  static void setup()
  {
    setupDevices();
    setupSensors();
  }
private:
  static void setItemValue(int deviceId, const char* itemId, int value)
  {
    if (devices.find(deviceId) == devices.end())
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Device Id: %d not found\n", deviceId);
#endif
      return;
    }

    Device& device = devices[deviceId];
    
    if (device.kind == Device::Kind::RC || device.kind == Device::Kind::AnalogicInput)
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Device Id: %d Kind: %d - Device is not set for write\n", deviceId, device.kind);
#endif
      return;
    }    
    if (device.kind == Device::Kind::AntiTheft) {// No need to check prev value and range because it is like an "external" device
      device.pAntiTheft->setState(itemId, value);
      // No need to store value in value field
      return;
    }
    if (device.value == value)
    {
      return;
    }
    if (value < device.min || value > device.max)
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Device Id: %d Value: %d - Value is out of range\n", deviceId, value);
#endif
      return;
    }   
    if (device.kind == Device::Kind::DigitalOutput)
    {
      digitalWrite(device.pin, value);
      device.value = value;
      return;
    }
    if (device.kind == Device::Kind::PWM)
    {
      ledcWrite(device.pwm.channel, value);
      device.value = value;
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Device Id: %d Kind: %d PWM value: %d\n", deviceId, device.kind, value);
#endif      
      return;
    }   
#ifdef DEBUG_BEESTATUS
    DPRINTF("BEESTATUS - Device Id: %d Kind: %d not recognized\n", deviceId, device.kind);
#endif
  }
  static void toggleItemValue(int deviceId, const char* itemId)
  {
    if (devices.find(deviceId) == devices.end())
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Device Id: %d not found\n", deviceId);
#endif
      return;
    }

    Device& device = devices[deviceId];
    if (device.kind == Device::Kind::RC || device.kind == Device::Kind::AnalogicInput)
    {
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Device Id: %d Kind: %d - Device is not set for write\n", deviceId, device.kind);
#endif
      return;
    }

    int value = device.min;
    if (device.value == device.min)
      value = device.max;
    if (device.value == device.max)
      value = device.min;

    if (device.kind == Device::Kind::DigitalOutput)
    {
      digitalWrite(device.pin, value);
      device.value = value;
      return;
    }
    if (device.kind == Device::Kind::PWM)
    {
      ledcWrite(device.pwm.channel, value);
      device.value = value;
      return;
    }
#ifdef DEBUG_BEESTATUS
    DPRINTF("BEESTATUS - Device Id: %d Kind: %d - Kind not recognized\n", deviceId, device.kind);
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
        for (setPointItem_const_iterator item = setPoint.setPointItems.begin(); item != setPoint.setPointItems.end(); item++)
        {
          const SetPointItem& setPointItem = *item;
          if (setPointItem.force == true)
          {
#ifdef DEBUG_BEESTATUS_VERBOSE
            DPRINTF("BEESTATUS - SetPointItemDevice Id: %d Value: %d forced\n", setPointItem.deviceId, setPointItem.forceValue);
#endif
            setItemValue(setPointItem.deviceId, setPointItem.itemId.c_str(), setPointItem.forceValue);
            continue;
          }
          if (setPointItem.toggle == true)
          {
            toggleItemValue(setPointItem.deviceId, setPointItem.itemId.c_str());
            continue;
          }
          setItemValue(setPointItem.deviceId, setPointItem.itemId.c_str(), value);
        }
      }
    }
  }
private:
  static bool setSensorsValueFromDeviceId(int deviceId, int value)
  {
    bool immediately = false;
    for (sensor_iterator it = sensors.begin(); it != sensors.end(); it++)
    {
      Sensor& sensor = it->second;
      if (sensor.deviceId != deviceId)
        continue;

      if (immediately == false)
        immediately = sensor.prior;

      sensor.now    = true;
      sensor.millis = millis();
      sensor.value  = value;

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
      
    sensor.now    = true;
    sensor.millis = millis();
    sensor.value  = value;

    checkSetPoints(sensor.setPoints, value);

    return sensor.prior;
  }
public:
  static bool loop()
  {
    bool immediately = false;
    for (device_const_iterator it = devices.begin(); it != devices.end(); it++)
    {
      int deviceId          = it->first;
      const Device& device  = it->second;
#ifdef DEBUG_BEESTATUS_VERBOSE
      // DPRINTF("BEESTATUS - Elaborating Device Id: %d Kind: %s\n", pinN, pin.kind.c_str());
#endif
      if (device.kind == Device::Kind::DigitalOutput)
      {
        continue;
      }
      if (device.kind == Device::Kind::PWM)
      {
        continue;
      }
      if (device.kind == Device::Kind::AnalogicInput)
      {
        int value = analogRead(device.pin);
#ifdef DEBUG_BEESTATUS_VERBOSE
        DPRINTF("BEESTATUS - Read Device id: %d Kind: %d analogic value: %d\n", deviceId, device.kind, value);
#endif
        int prior = setSensorsValueFromDeviceId(deviceId, value);
        if (immediately == false)
          immediately = prior;
        continue;
      }
      if (device.kind == Device::Kind::RC)
      {
        if (RCSensorsManager::available() == false)
          continue;

        long sensorId = RCSensorsManager::getReceivedValue();
        String sensorIdStr(sensorId);
#ifdef DEBUG_BEESTATUS
        DPRINTF("BEESTATUS - Read Device Id: %d Kind: %d Item Id: %s\n", deviceId, device.kind, sensorIdStr.c_str());
#endif
        int prior = setSensorValue(sensorIdStr.c_str(), HIGH);
        if (immediately == false)
          immediately = prior;
        continue;
      }
      if (device.kind == Device::Kind::AntiTheft) {
        device.pAntiTheft->loop();
        for (AntiTheft::const_iterator it = device.pAntiTheft->begin(); it != device.pAntiTheft->end(); it++) {
          String      sensorId     = it->first;
          const int*  sensorValue  = it->second;
          int prior = setSensorValue(sensorId.c_str(), *sensorValue);
          if (immediately == false)
            immediately = prior;
        }
        continue;
      }
#ifdef DEBUG_BEESTATUS
      DPRINTF("BEESTATUS - Device Id: %d Kind: %d not found\n", deviceId, device.kind);
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

device_collection BeeStatus::devices;
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
#ifdef DEBUG_SOCKETIOMANAGER
            DPRINTF("[IOc] Disconnected!\n");
#endif            
            break;
      case sIOtype_CONNECT:
#ifdef DEBUG_SOCKETIOMANAGER
          DPRINTF("[IOc] Connected to url: %s\n", payload);
#endif
          // join default namespace (no auto join in Socket.IO V3)
          webSocket.send(sIOtype_CONNECT, "/");
          break;
      case sIOtype_ACK:
#ifdef DEBUG_SOCKETIOMANAGER      
          DPRINTF("[IOc] get ack: %u\n", length);
#endif          
          break;
      case sIOtype_ERROR:
#ifdef DEBUG_SOCKETIOMANAGER      
          DPRINTF("[IOc] get error: %u\n", length);
#endif
          break;
      case sIOtype_BINARY_EVENT:
#ifdef DEBUG_SOCKETIOMANAGER      
          DPRINTF("[IOc] get binary: %u\n", length);
#endif          
          break;
      case sIOtype_BINARY_ACK:
#ifdef DEBUG_SOCKETIOMANAGER      
          DPRINTF("[IOc] get binary ack: %u\n", length);
#endif          
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
public:
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
    DPRINTF("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Sensor Id: %s Value: %d\n", sensorId.c_str(), value);
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
char jsonDoc[512]; // ToDo: To check correct size

void loop()
{
#ifdef DEBUG_TIMING
  unsigned long before = 0;
  unsigned long after = 0;
  unsigned long mainBefore = millis();
  // DPRINTF("Main::loop() before: %lu\n", mainBefore);
#endif
  //
#ifdef DEBUG_TIMING
  before = millis();
  // DPRINTF("BeeStatus::loop() before: %lu\n", before);
#endif
  bool immediately = BeeStatus::loop();
#ifdef DEBUG_TIMING
  after = millis();
  // DPRINTF("BeeStatus::loop() after: %lu - diff: %lu\n", after, after - before);
#endif
  // Check if wifi is ok, eventually try reconnecting every "WiFiManager::check_wifi_interval" milliseconds
#ifdef DEBUG_TIMING
  before = millis();
  // DPRINTF("WiFiManager::loop() before: %lu\n", before);
#endif
  WiFiManager::loop();
#ifdef DEBUG_TIMING
  after = millis();
  // DPRINTF("WiFiManager::loop() after: %lu - diff: %lu\n", after, after - before);
#endif
  if (WiFi.status() != WL_CONNECTED)
    return;
  //
  if ((immediately == true) || (millis() - restCallInterval >= 5000))
  {
#ifdef DEBUG_TIMING
    before = millis();
    DPRINTF("HTTPCall::loop() before: %lu - immediately: %d - ", before, immediately);
#endif
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
#ifdef DEBUG_TIMING
  after = millis();
  DPRINTF("HTTPCall::loop() after: %lu - diff: %lu\n", after, after - before);
#endif    
/*
    DPRINT("getFreeHeap : ");
    DPRINTLN(ESP.getFreeHeap());
*/    
  }
  //
#ifdef DEBUG_TIMING
  before = millis();
  // DPRINTF("SocketIOManager::loop() before: %lu\n", before);
#endif
  SocketIOManager::loop();
#ifdef DEBUG_TIMING
  after = millis();
  // DPRINTF("SocketIOManager::loop() after: %lu - diff: %lu\n", after, after - before);
#endif
#ifdef DEBUG_TIMING
  after = millis();
  // DPRINTF("Main::loop() after: %lu - diff: %lu\n", after, after - mainBefore);
#endif
}
