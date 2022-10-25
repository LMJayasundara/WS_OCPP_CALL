const WebSocket = require('ws');
const username = "ID001";
const URL = "ws://127.0.0.1:8080/";
var reconn = null;

const RPCClient = require('./src/clientj');

function startWebsocket() {
    var ws = new WebSocket(URL, {
        perMessageDeflate: false,
        headers: {
            Authorization: Buffer.from(username).toString('base64'),
        },
    });

    const cli = new RPCClient(ws);

    const bootNotificationParams =  {
        "reason": "PowerUp",
        "chargingStation": {
            "model": "SingleSocketCharger",
            "vendorName": "VendorX"
        }
    };
    // const payload = [2, "19223201", "BootNotification", params];

    ws.on('open', function() {
        clearInterval(reconn);
        // ws.send(JSON.stringify(payload));
        cli.call("BootNotification", bootNotificationParams)
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