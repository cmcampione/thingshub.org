#include <ezButton.h>

/// constants won't change
const int LED_ARMED_UNARMED      = 15; // the number of the LED pin
const int BUTTON_ARMED_UNARMED   = 2; // the number of the pushbutton pin

const int LED_INSTANT_ALARM       = 4; // the number of the LED pin
const int BUTTON_INSTANT_ALARM    = 16; // the number of the pushbutton pin

const int LED_DELAYED_ALARM       = 17; // the number of the LED pin
const int BUTTON_DELAYED_ALARM    = 5; // the number of the pushbutton pin

const int LED_ANTITAMPER_ALARM    = 18; // the number of the LED pin
const int BUTTON_ANTITAMPER_ALARM = 19; // the number of the pushbutton pin

const int LED_ALARM_ON_OFF         = 21; // the number of the LED pin

ezButton buttonArmedUnarmed(BUTTON_ARMED_UNARMED);
ezButton buttonInstantAlarm(BUTTON_INSTANT_ALARM);
ezButton buttonDelayedAlarm(BUTTON_DELAYED_ALARM);
ezButton buttonAntiTamperAlarm(BUTTON_ANTITAMPER_ALARM);

const int stateUnarmed  = 0;
const int stateArmed    = 1;
const int stateAlarm    = 2;
const int stateArmedLeavingEnviroment  = 3;

int state = stateUnarmed;

// variables will change:
int armedUnarmedState    = LOW;   // the current state of LED
int instanAlarmState     = LOW;   // the current state of LED
int delayedAlarmState    = LOW;   // the current state of LED
int antiTamperAlarmState = LOW;   // the current state of LED

int alarmState      = LOW;

int armedDelaySpan  = 0;

int alarmSpan       = 0;

void setup() {
  Serial.begin(115200);         // initialize serial
  
  pinMode(LED_ARMED_UNARMED, OUTPUT);   // set arduino pin to output mode
  buttonArmedUnarmed.setDebounceTime(50); // set debounce time to 50 milliseconds
  pinMode(LED_INSTANT_ALARM, OUTPUT);   // set arduino pin to output mode
  buttonInstantAlarm.setDebounceTime(50); // set debounce time to 50 milliseconds
  pinMode(LED_DELAYED_ALARM, OUTPUT);   // set arduino pin to output mode
  buttonDelayedAlarm.setDebounceTime(50); // set debounce time to 50 milliseconds
  pinMode(LED_ANTITAMPER_ALARM, OUTPUT);   // set arduino pin to output mode
  buttonAntiTamperAlarm.setDebounceTime(50); // set debounce time to 50 milliseconds

  pinMode(LED_ALARM_ON_OFF, OUTPUT);   // set arduino pin to output mode
}

void loop() {
  
  digitalWrite(LED_ARMED_UNARMED, armedUnarmedState);
  digitalWrite(LED_INSTANT_ALARM, instanAlarmState); 
  digitalWrite(LED_DELAYED_ALARM, delayedAlarmState); 
  digitalWrite(LED_ANTITAMPER_ALARM, antiTamperAlarmState);
  
  digitalWrite(LED_ALARM_ON_OFF, alarmState); 
  
  switch (state)
  {
    case stateUnarmed:
        alarmState = LOW;
        if (armedUnarmedState == HIGH) {
            armedDelaySpan = 0;
            state = stateArmedLeavingEnviroment;
            break;
        }
        break;
    case stateArmedLeavingEnviroment:
    {
        if (armedUnarmedState == LOW) {
            state = stateUnarmed;
            break;
        }
        if (instanAlarmState == LOW) {
            alarmSpan = millis();
            alarmState = HIGH;
            state = stateAlarm;            
            break;
        }
        if (antiTamperAlarmState == LOW) {
            alarmSpan = millis();
            alarmState = HIGH;
            state = stateAlarm;
            break;
        }
        if (delayedAlarmState == LOW && armedDelaySpan == 0) {
            armedDelaySpan = millis();
            break;
        }
        if (armedDelaySpan == 0) {
            break;
        }
        int duration = millis() - armedDelaySpan;
        if (duration <= 10000) {
            break;
        }
        // Here delayedAlarmState can be HIGH or LOW
        if (delayedAlarmState == LOW) {
            alarmSpan = millis();
            alarmState = HIGH;
            state = stateAlarm;            
            break;
        }
          
        armedDelaySpan = 0;
        state = stateArmed;
        break;
    }
    case stateArmed:
    {
        if (armedUnarmedState == LOW) {
            state = stateUnarmed;
            break;
        }
        if (instanAlarmState == LOW) {
            alarmSpan = millis();
            alarmState = HIGH;
            state = stateAlarm;            
            break;
        }
        if (antiTamperAlarmState == LOW) {
            alarmSpan = millis();
            alarmState = HIGH;
            state = stateAlarm;
            break;
        }
        if (delayedAlarmState == LOW && armedDelaySpan == 0) {
            armedDelaySpan = millis();
            break;
        }
        if (armedDelaySpan == 0) {
            break;
        }
        int duration = millis() - armedDelaySpan;
        if (duration <= 10000) {
            break;
        }
        
        alarmSpan = millis();
        alarmState = HIGH;
        state = stateAlarm;
        break;
    }
    case stateAlarm:
    {
        if (armedUnarmedState == LOW) {
            state = stateUnarmed;
            break;
        }
        int duration = millis() - alarmSpan;
        if (duration > 10000) {
            alarmSpan = millis();
            alarmState = !alarmState;
            break;
        }
        break;
    }
    default:
        break;
    }

    buttonArmedUnarmed.loop(); // MUST call the loop() function first
    buttonInstantAlarm.loop(); // MUST call the loop() function first
    buttonDelayedAlarm.loop(); // MUST call the loop() function first
    buttonAntiTamperAlarm.loop(); // MUST call the loop() function first
  
    if (buttonArmedUnarmed.isPressed())
      armedUnarmedState = !armedUnarmedState;
    if (buttonInstantAlarm.isPressed())
      instanAlarmState = !instanAlarmState;
    if (buttonDelayedAlarm.isPressed())
      delayedAlarmState = !delayedAlarmState;
    if (buttonAntiTamperAlarm.isPressed())
      antiTamperAlarmState = !antiTamperAlarmState;
}
