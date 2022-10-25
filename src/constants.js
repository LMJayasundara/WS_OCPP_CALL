const CALL_MESSAGE = 2; // Client-to-Server
const CALLRESULT_MESSAGE = 3; // Server-to-Client
const CALLERROR_MESSAGE = 4; // Server-to-Client
const SOCKET_TIMEOUT = 30 * 1000; // 30 sec
const protocols = ['ocpp1.6'] // ocpp2.0.1

module.exports = {
    CALL_MESSAGE, 
    CALLRESULT_MESSAGE, 
    CALLERROR_MESSAGE,
    SOCKET_TIMEOUT
};