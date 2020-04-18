#ifndef BuildDefine_h
#define BuildDefine_h

#define DEBUG
#ifdef DEBUG    //Macros are usually in all capital letters.
  #define DPRINT(...)    Serial.print(__VA_ARGS__)     //DPRINT is a macro, debug print
  #define DPRINTF(...)    Serial.printf(__VA_ARGS__)     //DPRINT is a macro, debug print
  #define DPRINTLN(...)  Serial.println(__VA_ARGS__)   //DPRINTLN is a macro, debug print with new line
#else
  #define DPRINT(...)     //now defines a blank line
  #define DPRINTF(...)    //now defines a blank line
  #define DPRINTLN(...)   //now defines a blank line
#endif

//#define DEBUG_BEESTATUS
#define DEBUG_RCSENSORSMANAGER
//#define DEBUG_SOCKETIOMANAGER
//#define DEBUG_RESTCALL

#define WIFISETUPEXTERNAL

#endif
