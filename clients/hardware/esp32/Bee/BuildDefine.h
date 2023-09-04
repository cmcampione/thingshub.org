#ifndef _BuildDefine_h_
#define _BuildDefine_h_

#define DEBUG
#ifdef DEBUG
  #define DPRINT(...)    Serial.print(__VA_ARGS__)     //DPRINT is a macro, debug print
  #define DPRINTF(...)   Serial.printf(__VA_ARGS__)     //DPRINT is a macro, debug print
  #define DPRINTLN(...)  Serial.println(__VA_ARGS__)   //DPRINTLN is a macro, debug print with new line
#else
  #define DPRINT(...)     //now defines a blank line
  #define DPRINTF(...)    //now defines a blank line
  #define DPRINTLN(...)   //now defines a blank line
#endif

//#define ANTITHEFT
//#define ANTITHEFT_TEST
#define VARIUS_SENSORS

//#define DEBUG_BEESTATUS
//#define DEBUG_BEESTATUS_VERBOSE
//#define DEBUG_RCSENSORSMANAGER
//#define DEBUG_SOCKETIOMANAGER
//#define DEBUG_RESTCALL
//#define DEBUG_TIMING
//#define DEBUG_REST_TIMING
//#define DEBUG_MEMORY_DIAG

#define WIFISETUPEXTERNAL

#endif
