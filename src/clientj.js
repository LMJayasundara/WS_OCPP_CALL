const {CALL_MESSAGE, CALLRESULT_MESSAGE, CALLERROR_MESSAGE, SOCKET_TIMEOUT} = require('./constants');
const { randomUUID} = require('crypto');
const {createValidator } = require('./validator');
// const validator = createValidator('ocpp1.6', require('../schemas/ocpp1_6.json'));
const validator = createValidator('ocpp2.0.1', require('../schemas/ocpp2_0_1.json'));

class RPCClient{
    constructor(ws){
        this.ws = ws;
    }

    async call(method, params) {
        try {
            validator.validate(`urn:${method}.req`, params);
        } catch (error) {
            throw error;
        }

        const msgId = randomUUID();
        this.sendMessage(CALL_MESSAGE, msgId, method, params);
    }

    async sendMessage(messageType = CALL_MESSAGE, messageId, method, params) {
        return new Promise((resolve, reject) => {
            let messageToSend;
            messageToSend = JSON.stringify([messageType, messageId, method, params]);

            if (this.ws.readyState === this.ws.OPEN) {
                this.ws.send(messageToSend);
                resolve();
            } else {
                console.log(`Socket closed ${messageId}`);
            }
        });
    }
}

module.exports = RPCClient;