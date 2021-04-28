#ifndef _SocketIOMngr_h_
#define _SocketIOMngr_h_

#include <map>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include <ArduinoJson.h>
#include "BuildDefine.h"

// ESP32
const int msgCapacity = 1024; // To Check. Do not move from here, some compilation error or compiler bug

// SocketIO
class SocketIOManager
{
    private:
        static SocketIOclient webSocket;
        static std::map<String, std::function<void(const StaticJsonDocument<msgCapacity>&)>> events;
    private:
        static void trigger(const StaticJsonDocument<msgCapacity> &jMsg)
        {
            const char* event = jMsg[0];
            auto e = events.find(event);
            if (e != events.end())
            {
                e->second(jMsg);
            }
            else
            {
#ifdef DEBUG_SOCKETIOMANAGER
                DPRINTF("DEBUG_SOCKETIOMANAGER - event %s not found. %d events available\n", event, events.size());
#endif
            }
        }
        static void handleEvent(socketIOmessageType_t type, uint8_t *payload, size_t length)
        {
            StaticJsonDocument<msgCapacity> jMsg;
            switch (type)
            {
            case sIOtype_DISCONNECT:
#ifdef DEBUG_SOCKETIOMANAGER
                DPRINTF("[IOc] Disconnected!\n");
#endif            
                break;
            case sIOtype_CONNECT:
#ifdef DEBUG_SOCKETIOMANAGER
                DPRINTF("[IOc] Connected to url: %s\n", payload);
#endif
                // join default namespace (no auto join in Socket.IO V3)
                webSocket.send(sIOtype_CONNECT, "/");
                break;
            case sIOtype_ACK:
#ifdef DEBUG_SOCKETIOMANAGER      
                DPRINTF("[IOc] get ack: %u\n", length);
#endif          
                break;
            case sIOtype_ERROR:
#ifdef DEBUG_SOCKETIOMANAGER      
                DPRINTF("[IOc] get error: %u\n", length);
#endif
                break;
            case sIOtype_BINARY_EVENT:
#ifdef DEBUG_SOCKETIOMANAGER      
                DPRINTF("[IOc] get binary: %u\n", length);
#endif          
                break;
            case sIOtype_BINARY_ACK:
#ifdef DEBUG_SOCKETIOMANAGER      
                DPRINTF("[IOc] get binary ack: %u\n", length);
#endif          
                break;
            case sIOtype_EVENT:
                DeserializationError error = deserializeJson(jMsg, payload);
                if (error)
                {
#ifdef DEBUG_SOCKETIOMANAGER
                    DPRINTF("DEBUG_SOCKETIOMANAGER - deserializeJson() failed: socketIOmessageType_t = %c\n", type);
                    DPRINTF("DEBUG_SOCKETIOMANAGER - payload = %s\n", length == 0 ? (uint8_t *)"" : payload);
                    DPRINTF("DEBUG_SOCKETIOMANAGER - deserializeJson() error: ");
                    DPRINTLN(error.c_str());
#endif
                    return;
                }
                trigger(jMsg);
                break;
            }
        }
    public:
        static void on(const char *event, std::function<void(const StaticJsonDocument<msgCapacity> &)> func)
        {
            events[event] = func;
        }
        static void remove(const char *event)
        {
            auto e = events.find(event);
            if (e != events.end())
            {
                events.erase(e);
            }
            else
            {
#ifdef DEBUG_SOCKETIOMANAGER
                DPRINTF("DEBUG_SOCKETIOMANAGER - event %s not found, can not be removed\n", event);
#endif
            }
        }
    public:
        static bool sendEVENT(const char * payload, size_t length = 0)
        {
            return SocketIOManager::webSocket.sendEVENT(payload, length);
        }
    public:
        static void beginSocketSSLWithCA(const char *host, uint16_t port, const char *url = "/socket.io/?EIO=4", const char *CA_cert = NULL, const char *protocol = "arduino")
        {
            SocketIOManager::webSocket.onEvent(handleEvent);                     
            SocketIOManager::webSocket.beginSocketIOSSLWithCA(host, port, url, CA_cert, protocol); 
        }
    public:        
        static void loop()
        {
            SocketIOManager::webSocket.loop();
        }    
};
SocketIOclient SocketIOManager::webSocket;
std::map<String, std::function<void(const StaticJsonDocument<msgCapacity> &)>> SocketIOManager::events;

#endif