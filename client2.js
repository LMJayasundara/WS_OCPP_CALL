const WebSocket = require('ws');
const username = "ID002";
const URL = "ws://127.0.0.1:8080/";
var reconn = null;

function startWebsocket() {
    var ws = new WebSocket(URL, {
        perMessageDeflate: false,
        headers: {
            Authorization: Buffer.from(username).toString('base64'),
        },
    });

    const params = {
        "chargePointVendor": "ocpp-rpc",
        "chargePointModel": "ocpp-rpc",
    };
    const payload = [2, "19223201", "BootNotification", params];

    ws.on('open', function() {
        clearInterval(reconn);
        ws.send(JSON.stringify(payload));
    });

    ws.on('message', function(msg) {
        var [messageType, messageId, command] = JSON.parse(msg);
        console.log(command);
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