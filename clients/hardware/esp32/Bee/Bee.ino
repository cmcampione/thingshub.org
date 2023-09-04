// Per la gestione dello overflow di millis () ho utilizzato la soluzione proposta da https://www.leonardomiliani.com/2012/come-gestire-loverflow-di-millis/
// Useful link https://lastminuteengineers.com/esp32-arduino-ide-tutorial/

#include <map>
#include <vector>
#include <time.h>
#include <HTTPClient.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <ArduinoJson.h>
#include "BuildDefine.h"
#include "WiFiMngr.h"
#include "RCSensorsMngr.h"
#include "AntiTheft.h"
#include "SocketIOMngr.h"

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0;
const int   daylightOffset_sec = 0;

// https://arduino-esp8266.readthedocs.io/en/latest/faq/a02-my-esp-crashes.html
// Don’t use const char * with literals. Instead, use const char[] PROGMEM. This is particularly true if you intend to, e.g.: embed html strings.
// https://thingpulse.com/embed-binary-data-on-esp32/
static const char root_ca[] PROGMEM = R"=====(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
)=====";

//
const int sensorsJsonDocCapacity = 512;
const int sensorsBufferCapacity = 512;
const int urlBufferCapacity = 512;
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
      Undefined = 0,
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

    bool prior;

    setPointItem_collection setPointItems;

  public:
    SetPoint() : min(0), max(0), prior(false) {
    }
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
class BeeStatus // Represent a Thing
{
// ToDo: Implement a DevicesManager
#pragma region DevicesManager
  public:
    static device_collection devices;
  private:
#ifdef VARIUS_SENSORS
    static void setupDevicesVarius()
    {
      // It is just a case if the device ID is equal to the pin number
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
    }
#endif
#if defined(ANTITHEFT) || defined(ANTITHEFT_TEST)
    static void setupDevicesAntiTheaf()
    {
      { // Device 1000 - Main AntiTheaf
        devices[1000].kind = Device::Kind::AntiTheft;
        AntiTheftConfig mainAntiTheftCnfg {
          "MAT-ALSTATE", 21,
          "MAT-AUSTATE", 15,  2, HIGH,
          "MAT-AULSTATE", "MAT-AURSTATE",
          "MAT-IASTATE", 4, 16, HIGH,
          //"MAT-DASTATE", 17,  5, HIGH,   // does not work
          "MAT-DASTATE", 17, 23, HIGH, // run
          //"MAT-DASTATE", 17,  3, HIGH, // does not work
          "MAT-AASTATE", 18, 19, HIGH,
          10000,
          10000,
          5000
        };
        devices[1000].pAntiTheft = new AntiTheft(mainAntiTheftCnfg);
      }
    }
#endif
  public:
    static void setupDevices()
    {
#ifdef VARIUS_SENSORS
      setupDevicesVarius();
#endif
#if defined(ANTITHEFT) || defined(ANTITHEFT_TEST)
      setupDevicesAntiTheaf();
#endif
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
        DPRINTF("BeeStatus::setupDevices - Device id: %d Kind: %d - Kind not found\n", it->first, device.kind);
#endif
      }
    }
  private:
    static void setItemValue(int deviceId, const char* itemId, int value)
    {
      if (devices.find(deviceId) == devices.end())
      {
#ifdef DEBUG_BEESTATUS
        DPRINTF("BeeStatus::setItemValue - Device Id: %d not found\n", deviceId);
#endif
        return;
      }

      Device& device = devices[deviceId];

      if (device.kind == Device::Kind::RC || device.kind == Device::Kind::AnalogicInput)
      {
#ifdef DEBUG_BEESTATUS
        DPRINTF("BeeStatus::setItemValue - Device Id: %d Kind: %d - Device is not set for write\n", deviceId, device.kind);
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
        DPRINTF("BeeStatus::setItemValue - Device Id: %d Value: %d - Value is out of range\n", deviceId, value);
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
        DPRINTF("BeeStatus::setItemValue - Device Id: %d Kind: %d PWM value: %d\n", deviceId, device.kind, value);
#endif
        return;
      }
#ifdef DEBUG_BEESTATUS
      DPRINTF("BeeStatus::setItemValue - Device Id: %d Kind: %d not recognized\n", deviceId, device.kind);
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
        DPRINTF("BeeStatus::toggleItemValue - Device Id: %d Kind: %d - Device is not set for write\n", deviceId, device.kind);
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
      DPRINTF("BeeStatus::toggleItemValue - Device Id: %d Kind: %d - Kind not recognized\n", deviceId, device.kind);
#endif
    }
  private:
    static bool checkSetPoints(const setPoint_collection& setPoints, int value)
    {
      bool prior = false;
      for (setPoint_const_iterator it = setPoints.begin(); it != setPoints.end(); it++)
      {
        const SetPoint& setPoint = *it;
        if (value >= setPoint.min && value <= setPoint.max)
        {
          if (prior == false)
            prior = setPoint.prior;

          for (setPointItem_const_iterator item = setPoint.setPointItems.begin(); item != setPoint.setPointItems.end(); item++)
          {
            const SetPointItem& setPointItem = *item;
            if (setPointItem.force == true)
            {
#ifdef DEBUG_BEESTATUS_VERBOSE
              DPRINTF("BeeStatus::checkSetPoints - SetPointItemDevice Id: %d Value: %d forced\n", setPointItem.deviceId, setPointItem.forceValue);
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
      return prior;
    }
#pragma endregion DevicesManager

  private:
    sensor_collection sensors;
  private:
    String thingCnfgId; // ToDo: To manage
  public:
    void setup(const sensor_collection& sensors) {
      this->sensors = sensors;
#ifdef DEBUG_BEESTATUS
      for (sensor_const_iterator it = sensors.begin(); it != sensors.end(); it++)
      {
        DPRINTF("BeeStatus::setup::sensors - Sensor id: %s\n", it->first);
      }
      for (sensor_const_iterator it = this->sensors.begin(); it != this->sensors.end(); it++)
      {
        DPRINTF("BeeStatus::setup::this->sensors - Sensor id: %s\n", it->first);        
      }
#endif
    }
  public:
    bool setSensorsValueFromDeviceId(int deviceId, int value)
    {
      bool prior = false;
      for (sensor_iterator it = sensors.begin(); it != sensors.end(); it++)
      {
        Sensor& sensor = it->second;
        if (sensor.deviceId != deviceId)
          continue;

        if (prior == false)
          prior = sensor.prior;

        sensor.now    = true;
        sensor.millis = millis();
        sensor.value  = value;

        bool lPrior = checkSetPoints(sensor.setPoints, value);
        if (prior == false)
          prior = lPrior;
      }
      return prior;
    }
  public:
    bool setSensorValue(const char* sensorId, int value)
    {
#ifdef DEBUG_BEESTATUS      
      for (sensor_iterator it = sensors.begin(); it != sensors.end(); it++)
      {
        DPRINTF("BeeStatus::setSensorValue - Sensor id: %s\n", it->first);   
      }
#endif
      sensor_iterator it = sensors.find(sensorId);
      if (it == sensors.end())
      {
#ifdef DEBUG_BEESTATUS
        DPRINTF("BeeStatus::setSensorValue - Sensor id: %s not found\n", sensorId);
#endif
        return false;
      }
      Sensor& sensor = it->second;
      /*  ToDo: To check for RC Sensors */
      if (sensor.value == value)
        return false;
  
      sensor.now    = true;
      sensor.millis = millis();
      sensor.value  = value;

      bool prior = checkSetPoints(sensor.setPoints, value);

      return (sensor.prior || prior);
    }
  public:
    void toJson(DynamicJsonDocument& sensorsJsonDoc)
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
      char output[sensorsBufferCapacity];
      int count = 0;
#endif
      sensorsJsonDoc.clear();
      JsonArray sensorsNode = sensorsJsonDoc.createNestedArray("sensors");
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
        DPRINT("BeeStatus::toJson - ");
        DPRINT(count++);
        DPRINT(": ");
        DPRINTLN(output);
#endif
      }
#ifdef DEBUG_BEESTATUS_VERBOSE
      // Produce a minified JSON document
      serializeJson(sensorsJsonDoc, output);
      DPRINTF("BeeStatus::toJson - %s\n", output);
#endif
    }
};
device_collection BeeStatus::devices;

//
typedef std::map<String, BeeStatus>           beeStatus_collection;
typedef beeStatus_collection::iterator        beeStatus_iterator;
typedef beeStatus_collection::const_iterator  beeStatus_const_iterator;

//
class BeesManager // Represent a Board (For example ESP32 board)
{
  private:
    static beeStatus_collection beesStatus;
  private:
#ifdef VARIUS_SENSORS
    static void setupVariusSensors() {
      { // Telecomando
        sensor_collection sensors;
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
        BeeStatus bee;
        bee.setup(sensors);
        beesStatus["73e545e2-6be9-4281-bd48-ab82c9b792f3"] = bee;
      }
      { // Luminosità, Temperatura
        sensor_collection sensors;
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
        BeeStatus bee;
        bee.setup(sensors);
        beesStatus["12d209ee-dea6-417a-a4e2-e5130be7fdbc"] = bee;
      }
      { // Pir Salone, Contatto filare, Sensore fumi
        sensor_collection sensors;
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
          setPointItem2LedOff.deviceId = 2;
          setPointItem2LedOff.itemId = 2; // ToDo: Could be not necessary
          setPointItem2LedOff.force = true;
          setPointItem2LedOff.forceValue = LOW;
          setPointItem2LedOff.toggle = false;

          setPointLedOff.setPointItems.push_back(setPointItem2LedOff);

          sensors["7830832"].setPoints.push_back(setPointLedOff);
        }
        BeeStatus bee;
        bee.setup(sensors);
        beesStatus["80c44c01-65cc-46de-9ee1-95493abb16a6"] = bee;
      }
    }
#endif
#if defined(ANTITHEFT) || defined(ANTITHEFT_TEST)
    static void setupAntitheft() {
      { // Commands
        sensor_collection sensors;
        { // AntiTheaf - ArmedUnarmed
          sensors["MAT-AUSTATE"].name = "Antifurto Principale - ArmatoDisarmato";
          sensors["MAT-AUSTATE"].deviceId = 1000;
          sensors["MAT-AUSTATE"].prior = true;
        }
        { // AntiTheaf - ArmedUnarmedLocal
          sensors["MAT-AULSTATE"].name = "Antifurto Principale - ArmatoDisarmato Local";
          sensors["MAT-AULSTATE"].deviceId = 1000;
          sensors["MAT-AUSTATE"].prior = true;
        }
        { // AntiTheaf - ArmedUnarmedRemote
          sensors["MAT-AURSTATE"].name = "Antifurto Principale - ArmatoDisarmato Remote";
          sensors["MAT-AURSTATE"].deviceId = 1000;
          sensors["MAT-AUSTATE"].prior = true;

          SetPoint setPoint;
          setPoint.min = LOW;
          setPoint.max = HIGH;
          // setPoint.prior = true // It's not necessary because sensor.prior is already used

          SetPointItem setPointRemoteArmUnarmItem;
          setPointRemoteArmUnarmItem.deviceId = 1000;
          setPointRemoteArmUnarmItem.itemId = "MAT-AURSTATE";
          setPointRemoteArmUnarmItem.force = false;
          setPointRemoteArmUnarmItem.forceValue = LOW;
          setPointRemoteArmUnarmItem.toggle = false;
          setPoint.setPointItems.push_back(setPointRemoteArmUnarmItem);

          sensors["MAT-AURSTATE"].setPoints.push_back(setPoint);
        }
        BeeStatus bee;
        bee.setup(sensors);
#ifdef ANTITHEFT        
        beesStatus["f4c3c80b-d561-4a7b-80a5-f4805fdab9bb"] = bee;
#endif
#ifdef ANTITHEFT_TEST
        beesStatus["f6be37c4-ef19-4322-8115-2ec485819c59"] = bee;
#endif
      }     

      { // States
        sensor_collection sensors;
        { // AntiTheaf - Anti Tamper
          sensors["MAT-AASTATE"].name = "Antifurto Principale - Anti Tamper aperto-chiuso";
          sensors["MAT-AASTATE"].deviceId = 1000;
          sensors["MAT-AASTATE"].prior = true;
        }
        { // AntiTheaf - AlarmState
          sensors["MAT-ALSTATE"].name = "Antifurto Principale - Allarme on-off";
          sensors["MAT-ALSTATE"].deviceId = 1000;
          sensors["MAT-ALSTATE"].prior = true;
        }
        { // AntiTheaf - Porte balcone
          sensors["MAT-IASTATE"].name = "Antifurto Principale - Porte balcone aperte-chiuse";
          sensors["MAT-IASTATE"].deviceId = 1000;
          sensors["MAT-IASTATE"].prior = true;
        }       
        { // AntiTheaf - Porta ingresso
          sensors["MAT-DASTATE"].name = "Antifurto Principale - Porta ingresso aperta-chiusa";
          sensors["MAT-DASTATE"].deviceId = 1000;
          sensors["MAT-DASTATE"].prior = true;
        }
                  
        BeeStatus bee;
        bee.setup(sensors);
#ifdef ANTITHEFT
        beesStatus["041d065d-8354-4bac-b34b-221fc6619c14"] = bee;
#endif
#ifdef ANTITHEFT_TEST
        beesStatus["983f743a-ae31-45ba-a781-a7fe0e0985fe"] = bee;
#endif
      }
      
    }
#endif
  public:
    static void setup() {
      BeeStatus::setupDevices();
#ifdef VARIUS_SENSORS
      setupVariusSensors();
#endif
#ifdef ANTITHEFT
      setupAntitheft();
#endif
    }
  public:
    static bool setSensorValue(const char* thingId, const char* sensorId, int value) {
      beeStatus_iterator it = beesStatus.find(thingId);
      if (it == beesStatus.end())
      {
#ifdef DEBUG_BEESTATUS
        DPRINTF("BeesManager::loop - BeeStatus id: %s not found\n", thingId);
#endif
        return false;
      }
      BeeStatus& beeStatus = it->second;
      return beeStatus.setSensorValue(sensorId, value);
    }
  private:
    static bool setSensorsValueFromDeviceId(int deviceId, int value) {
      bool prior = false;
      for (beeStatus_iterator it = beesStatus.begin(); it != beesStatus.end(); it++) {
        BeeStatus& beeStatus = it->second;
        bool priorL = beeStatus.setSensorsValueFromDeviceId(deviceId, value);
        if (prior == false)
          prior = priorL;
      }
      return prior;
    }
    static bool setSensorsValue(const char* sensorId, int value) {
      bool prior = false;
      for (beeStatus_iterator it = beesStatus.begin(); it != beesStatus.end(); it++) {
        BeeStatus& beeStatus = it->second;
        bool priorL = beeStatus.setSensorValue(sensorId, value);
        if (prior == false)
          prior = priorL;
      }
      return prior;
    }
  public:
    static bool loop() {
      bool prior = false;
      for (device_const_iterator it = BeeStatus::devices.begin(); it != BeeStatus::devices.end(); it++)
      {
        int deviceId          = it->first;
        const Device& device  = it->second;
#ifdef DEBUG_BEESTATUS_VERBOSE
        DPRINTF("BeesManager::loop - Elaborating Device Id: %d Kind: %d\n", deviceId, device.kind);
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
          bool lPrior = setSensorsValueFromDeviceId(deviceId, value);
          if (prior == false)
            prior = lPrior;
          continue;
        }
        if (device.kind == Device::Kind::RC)
        {
          if (RCSensorsManager::available() == false)
            continue;

          long sensorId = RCSensorsManager::getReceivedValue();
          String sensorIdStr(sensorId);
#ifdef DEBUG_BEESTATUS_VERBOSE
          DPRINTF("BeesManager::loop - Read Device Id: %d Kind: %d Item Id: %s\n", deviceId, device.kind, sensorIdStr.c_str());
#endif
          bool lPrior = setSensorsValue(sensorIdStr.c_str(), HIGH);
          if (prior == false)
            prior = lPrior;
          continue;
        }
        if (device.kind == Device::Kind::AntiTheft) {
          device.pAntiTheft->loop();
          for (AntiTheft::const_iterator it = device.pAntiTheft->begin(); it != device.pAntiTheft->end(); it++) {
            const String& sensorId     = it->first;
            const int*    sensorValue  = it->second;

            bool lPrior = setSensorsValue(sensorId.c_str(), *sensorValue);
            if (prior == false)
              prior = lPrior;
          }
          continue;
        }
#ifdef DEBUG_BEESTATUS
        DPRINTF("BeesManager::loop - Device Id: %d Kind: %d Device kind not elaborate\n", deviceId, device.kind);
#endif
      }
      return prior;
    }
  private:
    static char urlBuffer[urlBufferCapacity] PROGMEM;
    static DynamicJsonDocument sensorsJsonDoc;
    static char sensorsBuffer[sensorsBufferCapacity] PROGMEM;
  public:
    static void updateServer() {
#ifdef DEBUG_RESTCALL
        DPRINTLN("----------------------------------------------------------------------------------------");
        DPRINTLN("BeesManager::updateServer - enter in updateServer");
#endif     
      HTTPClient http;
      for (beeStatus_iterator it = beesStatus.begin(); it != beesStatus.end(); it++) {
        BeeStatus& beeStatus = it->second;
        
// A sequence of String concatenations causes many allocations/deallocations/reallocations, which makes “holes” in the memory map
/*
        String url = String("/api/things/") + String(it->first) + String("/value");
*/
        sprintf(urlBuffer,"/api/things/%s/value",it->first.c_str());
#ifdef DEBUG_RESTCALL
        DPRINTF("BeesManager::updateServer - urlBuffer = %s\n", urlBuffer);
#endif        
        http.begin("api.thingshub.org", 3000, urlBuffer, root_ca); // Specify the URL and certificate
        http.addHeader("thapikey", "491e94d9-9041-4e5e-b6cb-9dad91bbf63d");
        http.addHeader("Content-Type", "application/json");

        beeStatus.toJson(sensorsJsonDoc);

        // String sensorsBuffer;
        serializeJson(sensorsJsonDoc, sensorsBuffer);
#ifdef DEBUG_RESTCALL
        DPRINTF("BeesManager::updateServer - before http.PUT() - %s\n", sensorsBuffer);
#endif        
        int httpCode = http.PUT(sensorsBuffer);
#ifdef DEBUG_RESTCALL
        DPRINTF("BeesManager::updateServer - http code after http.PUT() - %d\n", httpCode);
#endif        
        if (httpCode > 0)
        {
#ifdef DEBUG_RESTCALL
          // Check for the returning code
          DPRINTF("BeesManager::updateServer - RestCall return payload : %s\n", http.getString().c_str());
#endif
        }
#ifdef DEBUG_RESTCALL
        DPRINTLN("BeesManager::updateServer - before http.end()");      
#endif        
        http.end(); //Free resources
#ifdef DEBUG_RESTCALL
        DPRINTLN("BeesManager::updateServer - after http.end()");      
#endif       
      }
#ifdef DEBUG_RESTCALL
      DPRINTLN("BeesManager::updateServer - exit from updateServer");
      DPRINTLN("----------------------------------------------------------------------------------------");
#endif         
    }
};
beeStatus_collection BeesManager::beesStatus;
char BeesManager::urlBuffer[urlBufferCapacity] PROGMEM = "";
DynamicJsonDocument BeesManager::sensorsJsonDoc(sensorsJsonDocCapacity);
char BeesManager::sensorsBuffer[sensorsBufferCapacity] PROGMEM = "";

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
  if (!jMsg.is<JsonArrayConst>())
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: !jMsg.is<JsonArray>()");
    serializeJson(jMsg, Serial);
    DPRINTLN("");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: end");
#endif
    return;
  }
  if (jMsg.size() != 4)
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: jMsg.size() != 4");
    serializeJson(jMsg, Serial);
    DPRINTLN("");
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
    serializeJson(jMsg, Serial);
    DPRINTLN("");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: end");
#endif
    return;
  }

#ifdef DEBUG_SOCKETIOMANAGER
  DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Command begin");
#endif

  const char* thingId = jMsg[1];

  auto beeObj = jMsg[2].as<JsonObjectConst>();
  if (!beeObj.containsKey("sensors"))
  {
#ifdef DEBUG_SOCKETIOMANAGER
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: !beeObj.containsKey('sensors')");
    serializeJson(jMsg, Serial);
    DPRINTLN("");
    DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Command end");
#endif
    return;
  }

  auto sensors = beeObj["sensors"].as<JsonArrayConst>();
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
    BeesManager::setSensorValue(thingId, sensorId.c_str(), value);
  }

#ifdef DEBUG_SOCKETIOMANAGER
  DPRINTLN("DEBUG_SOCKETIOMANAGER - onUpdateThingValue: Command end");
#endif
}

bool convertToJson(const tm& t, JsonVariant variant) {
  char buffer[32];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &t);
  return variant.set(buffer);
}

void remoteLog(const tm& ts, const char* level, int code, const char* msg) {

  HTTPClient http;

  http.begin("api.thingshub.org", 3000, "/api/log", root_ca); // Specify the URL and certificate
  http.addHeader("thapikey", "491e94d9-9041-4e5e-b6cb-9dad91bbf63d");
  http.addHeader("Content-Type", "application/json");

  DynamicJsonDocument doc(1024);

  doc["timestamp"]  = ts;
  doc["level"]      = level;
  doc["code"]       = code;
  doc["message"]    = msg;

  String body;
  serializeJson(doc, body);
  DPRINTF("Body = %s", body.c_str());
  int httpCode = http.POST(body.c_str());
  if (httpCode > 0)
  {
  }
  http.end(); //Free resources
}

void setup()
{
  Serial.begin(115200);
  BeesManager::setup();
  WiFiManager::connect();

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }
  Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  remoteLog(timeinfo,"info",1,"During setup");

  ArduinoOTA
  .onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH)
      type = "sketch";
    else // U_SPIFFS
      type = "filesystem";

    // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
    DPRINTLN("Start updating " + type);
  })
  .onEnd([]() {
    DPRINTLN("\nEnd");
  })
  .onProgress([](unsigned int progress, unsigned int total) {
    DPRINTF("Progress: %u%%\r", (progress / (total / 100)));
  })
  .onError([](ota_error_t error) {
    DPRINTF("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) DPRINTLN("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) DPRINTLN("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) DPRINTLN("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) DPRINTLN("Receive Failed");
    else if (error == OTA_END_ERROR) DPRINTLN("End Failed");
  });
  ArduinoOTA.begin();
  
  SocketIOManager::on("onUpdateThingValue", onUpdateThingValue);
  SocketIOManager::beginSocketSSLWithCA("api.thingshub.org", 3000, "/socket.io/?EIO=4&token=491e94d9-9041-4e5e-b6cb-9dad91bbf63d", root_ca, "arduino");  
}

unsigned long updateServerInterval = 0;
void loop()
{
#ifdef DEBUG_MEMORY_DIAG
  DPRINTLN("loop - before -----------------------------------------------------------------------");

  DPRINTF("getHeapSize : %d\n", ESP.getHeapSize());
  DPRINTF("getFreeHeap : %d\n", ESP.getFreeHeap());
  DPRINTF("getMinFreeHeap : %d\n", ESP.getMinFreeHeap());
  DPRINTF("getMaxAllocHeap : %d\n", ESP.getMaxAllocHeap());

  DPRINTF("getPsramSize : %d\n", ESP.getPsramSize());
  DPRINTF("getFreePsram : %d\n", ESP.getFreePsram());
  DPRINTF("getMaxAllocPsram : %d\n", ESP.getMaxAllocPsram());

  DPRINTF("getChipRevision : %d\n", ESP.getChipRevision());
  DPRINTF("getChipModel : %d\n", ESP.getChipModel());
  DPRINTF("getChipCores : %d\n", ESP.getChipCores());
  DPRINTF("getSdkVersion : %d\n", ESP.getSdkVersion());

  DPRINTF("getFlashChipSize : %d\n", ESP.getFlashChipSize());
  DPRINTF("getFlashChipSpeed : %d\n", ESP.getFlashChipSpeed());
  DPRINTF("getFlashChipMode : %d\n", ESP.getFlashChipMode());
#endif

  bool prior = BeesManager::loop();
  WiFiManager::loop();// Check if wifi is ok, eventually try reconnecting every "WiFiManager::check_wifi_interval" milliseconds
  if (WiFi.status() != WL_CONNECTED)
    return;
  ArduinoOTA.handle();
  if ((prior == true) || (millis() - updateServerInterval >= 5000))
  {   
    BeesManager::updateServer(); 
    updateServerInterval = millis();
  }
  SocketIOManager::loop();

#ifdef DEBUG_MEMORY_DIAG
  DPRINTLN("loop - after -----------------------------------------------------------------------");

  DPRINTF("getHeapSize : %d\n", ESP.getHeapSize());
  DPRINTF("getFreeHeap : %d\n", ESP.getFreeHeap());
  DPRINTF("getMinFreeHeap : %d\n", ESP.getMinFreeHeap());
  DPRINTF("getMaxAllocHeap : %d\n", ESP.getMaxAllocHeap());

  DPRINTF("getPsramSize : %d\n", ESP.getPsramSize());
  DPRINTF("getFreePsram : %d\n", ESP.getFreePsram());
  DPRINTF("getMaxAllocPsram : %d\n", ESP.getMaxAllocPsram());

  DPRINTF("getChipRevision : %d\n", ESP.getChipRevision());
  DPRINTF("getChipModel : %d\n", ESP.getChipModel());
  DPRINTF("getChipCores : %d\n", ESP.getChipCores());
  DPRINTF("getSdkVersion : %d\n", ESP.getSdkVersion());

  DPRINTF("getFlashChipSize : %d\n", ESP.getFlashChipSize());
  DPRINTF("getFlashChipSpeed : %d\n", ESP.getFlashChipSpeed());
  DPRINTF("getFlashChipMode : %d\n", ESP.getFlashChipMode());

#endif

}
