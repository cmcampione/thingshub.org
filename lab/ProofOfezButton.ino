/*
 * Created by ArduinoGetStarted.com
 *
 * This example code is in the public domain
 *
 * Tutorial page: https://arduinogetstarted.com/tutorials/arduino-button-toggle-led
 */

#include <ezButton.h>

/// constants won't change
const int LED_PIN1    = 15; // the number of the LED pin
const int BUTTON_PIN1 = 2; // the number of the pushbutton pin

const int LED_PIN2    = 4; // the number of the LED pin
const int BUTTON_PIN2 = 16; // the number of the pushbutton pin

const int LED_PIN3    = 17; // the number of the LED pin
const int BUTTON_PIN3 = 5; // the number of the pushbutton pin

const int LED_PIN4    = 18; // the number of the LED pin
const int BUTTON_PIN4 = 19; // the number of the pushbutton pin


ezButton button1(BUTTON_PIN1);
ezButton button2(BUTTON_PIN2);
ezButton button3(BUTTON_PIN3);
ezButton button4(BUTTON_PIN4);

// variables will change:
int ledState1 = LOW;   // the current state of LED
int ledState2 = LOW;   // the current state of LED
int ledState3 = LOW;   // the current state of LED
int ledState4 = LOW;   // the current state of LED

void setup() {
  Serial.begin(115200);         // initialize serial
  
  pinMode(LED_PIN1, OUTPUT);   // set arduino pin to output mode
  button1.setDebounceTime(50); // set debounce time to 50 milliseconds
  pinMode(LED_PIN2, OUTPUT);   // set arduino pin to output mode
  button2.setDebounceTime(50); // set debounce time to 50 milliseconds
  pinMode(LED_PIN3, OUTPUT);   // set arduino pin to output mode
  button1.setDebounceTime(50); // set debounce time to 50 milliseconds
  pinMode(LED_PIN4, OUTPUT);   // set arduino pin to output mode
  button2.setDebounceTime(50); // set debounce time to 50 milliseconds
}

void loop() {
  button1.loop(); // MUST call the loop() function first
  button2.loop(); // MUST call the loop() function first
  button3.loop(); // MUST call the loop() function first
  button4.loop(); // MUST call the loop() function first

  if(button1.isPressed()) {
    Serial.println("The button is pressed");

    // toggle state of LED
    ledState1 = !ledState1;

    // control LED arccoding to the toggleed sate
    digitalWrite(LED_PIN1, ledState1); 
  }
  if(button2.isPressed()) {
    Serial.println("The button is pressed");

    // toggle state of LED
    ledState2 = !ledState2;

    // control LED arccoding to the toggleed sate
    digitalWrite(LED_PIN2, ledState2); 
  }
  if(button3.isPressed()) {
    Serial.println("The button is pressed");

    // toggle state of LED
    ledState3 = !ledState3;

    // control LED arccoding to the toggleed sate
    digitalWrite(LED_PIN3, ledState3); 
  }
  if(button4.isPressed()) {
    Serial.println("The button is pressed");

    // toggle state of LED
    ledState4 = !ledState4;

    // control LED arccoding to the toggleed sate
    digitalWrite(LED_PIN4, ledState4); 
  }
}
