#ifndef _RCSensorsManager_h_
#define _RCSensorsManager_h_

#include <RCSwitch.h>
#include "BuildDefine.h"
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

#endif