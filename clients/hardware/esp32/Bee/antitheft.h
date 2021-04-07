#include <map>
#include <ezButton.h>

struct AntiTheftConfig {

  String AlarmStateId;
  int AlarmOnOffLedAndContactPin;

  String ArmedUnarmedStateId;
  int ArmedUnarmedLedPin;
  int ArmedUnarmedContactPin;
  int ArmedUnarmedContactOpenValue;

  String ArmedUnarmedStateLocalId;
  String ArmedUnarmedStateRemoteId;
  
  String InstantAlarmStateId;
  int InstantAlarmLedPin;
  int InstantAlarmContactPin;
  int InstantAlarmContactOpenValue;

  String DelayedAlarmStateId;
  int DelayedAlarmLedPin;
  int DelayedAlarmContactPin;
  int DelayedAlarmContactOpenValue;

  String AntiTamperAlarmStateId;
  int AntiTamperAlarmLedPin;
  int AntiTamperAlarmContactPin;
  int AntiTamperAlarmContactOpenValue;

  int ExitTime;
  int EntryTime;

  int AlarmDutation;
};

class AntiTheft {
  private:
    typedef std::map<String,int*> stateIds_collection;
  private:
    enum class states {
      unarmed,
      armed,
      alarm,
      armedLeavingEnviroment
    };
  private:
    stateIds_collection _statesIds;  
  public:
    typedef stateIds_collection::const_iterator const_iterator;
    const_iterator begin() const  { return _statesIds.begin(); }
    const_iterator end() const    { return _statesIds.end(); }    
  private:
    AntiTheftConfig _config;
  private:
    states _state;
  private:
    int _armedDelaySpan;    
    int _alarmSpan;
  private:
    int _armedUnarmedState;     // HIGH == Armed, LOW == Unarmed
    int _armedUnarmedStateLocal;
    int _armedUnarmedStateRemote;
    int _armedUnarmedStateLocalPrev;
    int _armedUnarmedStateRemotePrev;
  private:
    int _instantAlarmState;     // HIGH == Open,  LOW == Close
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
    _armedUnarmedStateLocal(LOW),
    _armedUnarmedStateRemote(LOW),
    _armedUnarmedStateLocalPrev(LOW),
    _armedUnarmedStateRemotePrev(LOW),
    _buttonArmedUnarmed(cnfg.ArmedUnarmedContactPin) // ToDo: To remove
    {
      _statesIds[_config.AlarmStateId]              = &_alarmState;
      _statesIds[_config.ArmedUnarmedStateId]       = &_armedUnarmedState;
      _statesIds[_config.ArmedUnarmedStateLocalId]  = &_armedUnarmedStateLocal;
      _statesIds[_config.ArmedUnarmedStateRemoteId] = &_armedUnarmedStateRemote;
      _statesIds[_config.InstantAlarmStateId]       = &_instantAlarmState;
      _statesIds[_config.DelayedAlarmStateId]       = &_delayedAlarmState;
      _statesIds[_config.AntiTamperAlarmStateId]    = &_antiTamperAlarmState;
    }
  public:
    void setState(const char* stateId, int value) {
      if (_statesIds.find(stateId) == _statesIds.end())
      {
  #ifdef DEBUG_BEESTATUS
        DPRINTF("BEESTATUS - StateId: %d not found\n", stateId);
  #endif
        return;
      }
      *_statesIds[stateId] = value;
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

      if (_armedUnarmedStateRemote != _armedUnarmedStateRemotePrev) {
        _armedUnarmedState = _armedUnarmedStateRemote;
        _armedUnarmedStateRemotePrev = _armedUnarmedState;
      }

      // ToDo: To remove
      _buttonArmedUnarmed.loop();
      if (_buttonArmedUnarmed.isPressed()) {
        _armedUnarmedStateLocal = !_armedUnarmedStateLocal;
      }
      /*
      _armedUnarmedStateLocal = digitalRead(_config.ArmedUnarmedContactPin) == _config.ArmedUnarmedContactOpenValue ? HIGH : LOW;      
      */
      if (_armedUnarmedStateLocal != _armedUnarmedStateLocalPrev) {
        _armedUnarmedState = _armedUnarmedStateLocal;
        _armedUnarmedStateLocalPrev = _armedUnarmedState;
      }

      digitalWrite(_config.ArmedUnarmedLedPin, _armedUnarmedState);

      _instantAlarmState = digitalRead(_config.InstantAlarmContactPin) == _config.InstantAlarmContactOpenValue ? HIGH : LOW;
      digitalWrite(_config.InstantAlarmLedPin, _instantAlarmState);
      
      _delayedAlarmState = digitalRead(_config.DelayedAlarmContactPin) == _config.DelayedAlarmContactOpenValue ? HIGH : LOW;
      digitalWrite(_config.DelayedAlarmLedPin, _delayedAlarmState);
      
      _antiTamperAlarmState = digitalRead(_config.AntiTamperAlarmContactPin) == _config.AntiTamperAlarmContactOpenValue ? HIGH : LOW;      
      digitalWrite(_config.AntiTamperAlarmLedPin, _antiTamperAlarmState);

      switch (_state)
      {
        case states::unarmed:
        {
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
        }
        case states::armedLeavingEnviroment:
        {
            if (_armedUnarmedState == LOW) {
                _state = states::unarmed;
                break;
            }
            if (_instantAlarmState == HIGH) {
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
            if (_instantAlarmState == HIGH) {
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
        case states::alarm:// 2
        {
            if (_antiTamperAlarmState == LOW && _armedUnarmedState == LOW) {
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
        {
            break;
        }
      }
      /*
      Serial.printf("-----------------------------------\n", _state);
      Serial.printf("State global:                    %d\n", _state);
      Serial.printf("State _armedUnarmedState:        %d\n", _armedUnarmedState);
      Serial.printf("State _armedUnarmedStateLocal:   %d\n", _armedUnarmedStateLocal);
      Serial.printf("State _armedUnarmedStateRemote:  %d\n", _armedUnarmedStateRemote);
      Serial.printf("State _instantAlarmState:        %d\n", _instantAlarmState);
      Serial.printf("State _delayedAlarmState:        %d\n", _delayedAlarmState);
      Serial.printf("State _antiTamperAlarmState:     %d\n", _antiTamperAlarmState);
      Serial.printf("State _alarmState:               %d\n", _alarmState);
      */
    }
};
