const WebSocket = require('ws');
const username = "ID001";
const URL = "ws://127.0.0.1:8080/";
var reconn = null;

function startWebsocket() {
    var ws = new WebSocket(URL, {
        perMessageDeflate: false,
        headers: {
            Authorization: Buffer.from(username).toString('base64'),
        },
    });

    const bootNotificationParams =  {
        "reason": "PowerUp",
        "chargingStation": {
            "model": "SingleSocketCharger",
            "vendorName": "VendorX"
        }
    };
    const payload = [2, "19223201", "BootNotification", bootNotificationParams];

    ws.on('open', async function() {
        clearInterval(reconn);
        ws.send(JSON.stringify(payload));
    });

    ws.on('message', function(msg) {
        var [messageType, messageId, command] = JSON.parse(msg);
        console.log([messageType, messageId, command]);
    });

    ws.on('error', function (err) {
        console.log(err.message);
    });

    ws.on('close', function() {
        ws = null;
        reconn = setTimeout(startWebsocket, 5000);
    });
};

startWebsocket();