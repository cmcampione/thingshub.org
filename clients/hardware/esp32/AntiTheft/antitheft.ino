#include <ezButton.h>

struct AntiTheftConfig {

  int ArmedUnarmedLedPin;
  int ArmedUnarmedContactPin;
  int ArmedUnarmedContactOpenValue;

  int InstantAlarmLedPin;
  int InstantAlarmContactPin;
  int InstantAlarmContactOpenValue;

  int DelayedAlarmLedPin;
  int DelayedAlarmContactPin;
  int DelayedAlarmContactOpenValue;

  int AntiTamperAlarmLedPin;
  int AntiTamperAlarmContactPin;
  int AntiTamperAlarmContactOpenValue;

  int AlarmOnOffLedAndContactPin;

  int ExitTime;
  int EntryTime;

  int AlarmDutation;
};

class AntiTheft {
  private:
    enum class states {
      unarmed,
      armed,
      alarm,
      armedLeavingEnviroment
    };
  private:
    AntiTheftConfig _config;
  private:
    states _state;
  private:
    int _armedDelaySpan;    
    int _alarmSpan;
  private:
    int _armedUnarmedState;     // HIGH == Armed, LOW == Unarmed
    int _instanAlarmState;      // HIGH == Open,  LOW == Close
    int _delayedAlarmState;     // HIGH == Open,  LOW == Close
    int _antiTamperAlarmState;  // HIGH == Open,  LOW == Close
  private:    
    int _alarmState;            // HIGH == In alarm,  LOW == Not in alarm
  private:
    ezButton _buttonArmedUnarmed; // ToDo: To remove
  public:
    AntiTheft(const AntiTheftConfig& cnfg) : _config(cnfg),
    _state(states::unarmed),
    _armedDelaySpan(0),
    _alarmSpan(0),
    _alarmState(LOW),
    _armedUnarmedState(LOW),
    _buttonArmedUnarmed(cnfg.ArmedUnarmedContactPin) // Info: I use cnfg because i don't know if _config is already initialized
    {
    }
  public:
    void setup() {
      pinMode(_config.AlarmOnOffLedAndContactPin, OUTPUT);
      
      pinMode(_config.ArmedUnarmedContactPin, INPUT);
      _buttonArmedUnarmed.setDebounceTime(50); // ToDo: To remove
      pinMode(_config.ArmedUnarmedLedPin, OUTPUT);      
      
      pinMode(_config.InstantAlarmContactPin, INPUT);      
      pinMode(_config.InstantAlarmLedPin, OUTPUT);

      pinMode(_config.DelayedAlarmContactPin, INPUT);      
      pinMode(_config.DelayedAlarmLedPin, OUTPUT);

      pinMode(_config.AntiTamperAlarmContactPin, INPUT);      
      pinMode(_config.AntiTamperAlarmLedPin, OUTPUT);
    }
    void loop() {
      digitalWrite(_config.AlarmOnOffLedAndContactPin, _alarmState);

      _buttonArmedUnarmed.loop();
      if (_buttonArmedUnarmed.isPressed())
        _armedUnarmedState = !_armedUnarmedState;

      /*
      int armedUnarmedState = digitalRead(_config.ArmedUnarmedContactPin);
      _armedUnarmedState = armedUnarmedState == _config.ArmedUnarmedContactOpenValue ? HIGH : LOW;
      */
      
      digitalWrite(_config.ArmedUnarmedLedPin, _armedUnarmedState);

      int instanAlarmState = digitalRead(_config.InstantAlarmContactPin);
      _instanAlarmState = instanAlarmState == _config.InstantAlarmContactOpenValue ? HIGH : LOW;
      digitalWrite(_config.InstantAlarmLedPin, _instanAlarmState);

      int delayedAlarmState = digitalRead(_config.DelayedAlarmContactPin);
      _delayedAlarmState = delayedAlarmState == _config.DelayedAlarmContactOpenValue ? HIGH : LOW;
      digitalWrite(_config.DelayedAlarmLedPin, _delayedAlarmState);

      int antiTamperAlarmState = digitalRead(_config.AntiTamperAlarmContactPin);
      _antiTamperAlarmState = antiTamperAlarmState == _config.AntiTamperAlarmContactOpenValue ? HIGH : LOW;
      digitalWrite(_config.AntiTamperAlarmLedPin, _antiTamperAlarmState);

      switch (_state)
      {
        case states::unarmed:
            if (_antiTamperAlarmState == HIGH) {
                _alarmSpan = millis();
                _alarmState = HIGH;
                _state = states::alarm;
                break;
            }
            _alarmState = LOW;
            if (_armedUnarmedState == HIGH) {
                _armedDelaySpan = 0;
                _state = states::armedLeavingEnviroment;
                break;
            }
            break;
        case states::armedLeavingEnviroment:
        {
            if (_armedUnarmedState == LOW) {
                _state = states::unarmed;
                break;
            }
            if (_instanAlarmState == HIGH) {
                _alarmSpan = millis();
                _alarmState = HIGH;
                _state = states::alarm;            
                break;
            }
            if (_antiTamperAlarmState == HIGH) {
                _alarmSpan = millis();
                _alarmState = HIGH;
                _state = states::alarm;
                break;
            }
            if (_delayedAlarmState == HIGH && _armedDelaySpan == 0) {
                _armedDelaySpan = millis();
                break; // I have opened the delayed contact at least once
            }
            if (_armedDelaySpan == 0) {
                break; // I'm still inside the environment
            }
            int duration = millis() - _armedDelaySpan;
            if (duration <= _config.ExitTime) {
              if (_delayedAlarmState == LOW) {
                _armedDelaySpan = 0;
                _state = states::armed;
                break; // I have closed the delayed contact at least once during the delay period so I can arm the system
              }
              break;
            }
            // Here delayedAlarmState can be HIGH or LOW
            if (_delayedAlarmState == HIGH) {
                _alarmSpan = millis();
                _alarmState = HIGH;
                _state = states::alarm;
                break;
            }
              
            _armedDelaySpan = 0;
            _state = states::armed;
            break;
        }
        case states::armed:
        {
            if (_armedUnarmedState == LOW) {
                _state = states::unarmed;
                break;
            }
            if (_instanAlarmState == HIGH) {
                _alarmSpan = millis();
                _alarmState = HIGH;
                _state = states::alarm;            
                break;
            }
            if (_antiTamperAlarmState == HIGH) {
                _alarmSpan = millis();
                _alarmState = HIGH;
                _state = states::alarm;
                break;
            }
            if (_delayedAlarmState == HIGH && _armedDelaySpan == 0) {
                _armedDelaySpan = millis();
                break;
            }
            if (_armedDelaySpan == 0) {
                break;
            }
            int duration = millis() - _armedDelaySpan;
            if (duration <= _config.EntryTime) {
                break;
            }
            
            _alarmSpan = millis();
            _alarmState = HIGH;
            _state = states::alarm;
            break;
        }
        case states::alarm:
        {
            if (_armedUnarmedState == LOW) {
                _state = states::unarmed;
                break;
            }
            int duration = millis() - _alarmSpan;
            if (duration > _config.AlarmDutation) {
                _alarmSpan = millis();
                _alarmState = !_alarmState;
                break;
            }
            break;
        }
        default:
            break;
        }
    }
};

AntiTheftConfig mainAntiTheftCnfg {
  15,  2, HIGH,
   4, 16, HIGH,
  //17,  5, HIGH,   // don't run
  17, 23, HIGH, // run
  //17,  3, HIGH, // don't run
  18, 19, HIGH,   
  21,
  10000,
  10000,
  5000
};
AntiTheft mainAntiTheft(mainAntiTheftCnfg);

void setup() {
  Serial.begin(115200);         // initialize serial

  mainAntiTheft.setup();    
}

void loop() {
  mainAntiTheft.loop();
}
