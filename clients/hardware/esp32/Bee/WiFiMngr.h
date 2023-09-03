#ifndef _WiFiMngr_h_
#define _WiFiMngr_h_

#include <WiFi.h>
#include "BuildDefine.h"

// WiFi
class WiFiManager
{
private:
    static const char *wifi_ssid;
    static const char *wifi_password;

    static const unsigned long check_wifi_interval;

    static bool wifi_reconnection;
    static unsigned long check_wifi;

public:
    WiFiManager()
    {
    }
    static void connect()
    {
        do
        {
            WiFi.begin(WiFiManager::wifi_ssid, WiFiManager::wifi_password);
            delay(5000);
            DPRINTLN("Connecting to WiFi...");
        } while (WiFi.status() != WL_CONNECTED);
        DPRINTLN("Connected to the WiFi");
    }
    static void loop()
    {
        // if wifi is down, try reconnecting every 15 seconds
        if (WiFi.status() != WL_CONNECTED)
        {
            WiFiManager::wifi_reconnection = true;
            if (millis() - WiFiManager::check_wifi >= WiFiManager::check_wifi_interval)
            {
                WiFiManager::check_wifi = millis();
                WiFi.disconnect();
                WiFi.begin(WiFiManager::wifi_ssid, WiFiManager::wifi_password);
                DPRINTLN("Reconnecting to WiFi...");
            }
        }
        if ((WiFi.status() == WL_CONNECTED) && (WiFiManager::wifi_reconnection == true))
        {
            WiFiManager::wifi_reconnection = false;
            DPRINTLN("Reconnected to WiFi");
        }
    }
};

#ifdef WIFISETUPEXTERNAL

#include "WiFiSetup.h"

#else

const char *WiFiManager::wifi_ssid = "";
const char *WiFiManager::wifi_password = "";

#endif

const unsigned long WiFiManager::check_wifi_interval = 15000;
unsigned long WiFiManager::check_wifi = 0;
bool WiFiManager::wifi_reconnection = false;

#endif