/*
  Simple example for receiving
  
  https://github.com/sui77/rc-switch/
*/

#include <RCSwitch.h>

RCSwitch mySwitch = RCSwitch();

void setup() {
  Serial.begin(115200);
  mySwitch.enableReceive(4);  // Pin 4
  ledcSetup(0, 2000, 8);
  ledcAttachPin(23, 0);
}

void loop() {
  if (mySwitch.available()) {

    long sensorId = mySwitch.getReceivedValue();

    Serial.printf("Received %d\n", sensorId);
   
    mySwitch.resetAvailable();

    if (sensorId == 8171288)
      ledcWrite(0, 5);
    if (sensorId == 8171284)
      ledcWrite(0, 0);  
  }
}
