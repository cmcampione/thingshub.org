
const int stateUnarmed  = 0;
const int stateArmed    = 1;
const int stateAlarmOn  = 2;
const int stateAlarmOff = 3;
const int stateLeaving  = 4;

int state = stateUnarmed;

int pinValueArmedUnarmed    = 0;    // 0 = Disarmed, 1 = Armed
int pinValueInstantAlarm    = 0;    // 0 = Open, 1 = Closed
int pinValueDelayedAlarm    = 0;    // 0 = Open, 1 = Closed
int pinValueAntiTamperAlarm = 0;    // 0 = Open, 1 = Closed

int pinValueAlarmOnOff = 0;

int armedDelaySpan  = 0;
int alarmOnSpan     = 0;
int alarmOfSpan     = 0;

int millis() {
    return 1000;
}

void setup() {
}

void loop() {
    switch (state)
    {
    case stateUnarmed:
        pinValueAlarmOnOff = 0;
        if (pinValueArmedUnarmed == 1) {
            armedDelaySpan = 0;
            state = stateLeaving;
            break;
        }
        break;
    case stateLeaving:
        if (pinValueArmedUnarmed == 0) {
            state = stateUnarmed;
            break;
        }
        if (pinValueInstantAlarm == 0) {
            alarmOnSpan = millis();
            state = stateAlarmOn;            
            break;
        }
        if (pinValueAntiTamperAlarm == 0) {
            alarmOnSpan = millis();
            state = stateAlarmOn;
            break;
        }
        if (pinValueDelayedAlarm == 0 && armedDelaySpan == 0) {
            armedDelaySpan = millis();
            break;
        }
        if (armedDelaySpan == 0) {
            break;
        }
        int duration = millis() - armedDelaySpan;
        if (duration <= 3000) {
            break;
        }
        armedDelaySpan = 0;
        state = stateArmed;
        break;
    case stateArmed:
        if (pinValueArmedUnarmed == 0) {
            state = stateUnarmed;
            break;
        }
        if (pinValueInstantAlarm == 0) {
            alarmOnSpan = millis();
            state = stateAlarmOn;            
            break;
        }
        if (pinValueAntiTamperAlarm == 0) {
            alarmOnSpan = millis();
            state = stateAlarmOn;
            break;
        }
        if (pinValueDelayedAlarm == 0 && armedDelaySpan == 0) {
            armedDelaySpan = millis();
            break;
        }
        if (armedDelaySpan == 0) {
            break;
        }
        int duration = millis() - armedDelaySpan;
        if (duration <= 3000) {
            break;
        }
        alarmOnSpan = millis();
        state = stateAlarmOn;
        break;
    case stateAlarmOn:        
        if (pinValueArmedUnarmed == 0) {
            state = stateUnarmed;
            break;
        }
        pinValueAlarmOnOff = 1;
        int duration = millis() - alarmOnSpan;
        if (duration > 3000) {
            alarmOfSpan = millis();
            state = stateAlarmOff;
            break;
        }
        break;
    case stateAlarmOff:
        if (pinValueArmedUnarmed == 0) {
            state = stateUnarmed;
            break;
        }
        pinValueAlarmOnOff = 0;
        int duration = millis() - alarmOfSpan;
        if (duration > 3000) {
            alarmOnSpan = millis();
            state = stateAlarmOn;
            break;
        }
        break;
    default:
        break;
    }
}