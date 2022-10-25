const WebSocket = require('ws');
var http = require('http');
var express = require('express');
var app = express();
const PORT = 8080;

const server_res = require('./src/serverj');

var server = new http.createServer({
}, app);

var wss = new WebSocket.Server({
    server,
    verifyClient: function (info, cb) {
        var clientID = Buffer.from(info.req.headers.authorization,'base64').toString('utf-8');
        info.req.identity = clientID;
        cb(true, 200, 'Authorized');
    }
});

wss.on('connection', async function (ws, request) {
    ws.id = request.identity;
    console.log("Connected Charger ID: "  + ws.id);

    ws.on('message', async function (msg) {

        return new Promise(function(resolve, reject) {
            const ccc = Array.from(wss.clients).find(client => (client.readyState === client.OPEN && client.id == request.identity));
            resolve(ccc)
        }).then(async (client)=>{

            if(client != undefined){
                let req_res = new server_res(client, msg);

                await req_res.onMessage("BootNotification", {
                    status: "Accepted",
                    interval: 300,
                    currentTime: new Date().toISOString()
                });
            }
            else{
                client.terminate();
                console.log("Client Undefined!");
            }
        });

    });

    ws.on('close', function () {
        console.log(ws.id + ' Client disconnected');
    });

});

server.listen(PORT, ()=>{
    console.log( (new Date()) + " Server is listening on port " + PORT);
});