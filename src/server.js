const {CALL_MESSAGE, CALLRESULT_MESSAGE, CALLERROR_MESSAGE, SOCKET_TIMEOUT} = require('./constants');
const { createError } = require('./error');
const NOREPLY = Symbol("NOREPLY");

const {createValidator } = require('./validator');
// const validator = createValidator('ocpp1.6', require('../schemas/ocpp1_6.json'));
const validator = createValidator('ocpp2.0.1', require('../schemas/ocpp2_0_1.json'));

class RPCServer{
    constructor(client, msg) {
        this.client = client;
        this.msg = msg;
        this._handlers = new Map();
    }

    async handle(method, handler) {
        this._handlers.set(method, handler);
    }

    async onMessage(method, params) {
        let payload;
        let messageTypeId, messageId, action, jsonPayload;

        try {
            payload = JSON.parse(this.msg);
        } catch (error) {
            throw createError("RpcFrameworkError", "Message must be a JSON structure", {});
        }

        try {
            if (!Array.isArray(payload)) {
                throw createError("RpcFrameworkError", "Message must be an array", {});
            }

            [messageTypeId, messageId, action, jsonPayload] = payload;
            // const [messageTypePart, msgIdPart, ...more] = payload;

            if (typeof messageTypeId !== 'number') {
                throw createError("RpcFrameworkError", "Message type must be a number", {});
            }

            if (![CALL_MESSAGE, CALLRESULT_MESSAGE, CALLERROR_MESSAGE].includes(messageTypeId)) {
                throw createError("MessageTypeNotSupported", "Unrecognised message type", {});
            }

            if (typeof messageId !== 'string') {
                throw createError("RpcFrameworkError", "Message ID must be a string", {});
            }

            else{
                switch (messageTypeId) {
                    case CALL_MESSAGE:
                        console.log("CALL_MESSAGE");
        
                        if (typeof action !== 'string') {
                            throw createError("RpcFrameworkError", "Action must be a string", {});
                        }

                        else{
                            try {
                                validator.validate(`urn:${action}.req`, jsonPayload);
                            } catch (error) {
                                throw createError("InternalError", error.message, {});
                            }

                            await this.handle(method, ({jsonPayload}) => {
                                console.log(`Server got ${method} from ${this.client.id}:`, jsonPayload);
                                // respond to accept the client
                                return params;
                            });

                            let handler = this._handlers.get(action);
                            if (!handler) {
                                throw createError("NotImplemented", `Unable to handle '${method}' calls`, {});
                            }

                            const ac = new AbortController();
                            const callPromise = new Promise(async (resolve, reject) => {
                                function reply(val) {
                                    if (val instanceof Error) {
                                        reject(val);
                                    } else {
                                        resolve(val);
                                    }
                                }

                                try {
                                    reply(await handler({
                                        messageId: messageId,
                                        action,
                                        jsonPayload,
                                        signal: ac.signal,
                                        reply,
                                    }));
                                } catch (error) {
                                    reply(error);
                                }
                            });

                            const result = await callPromise;

                            if (result === NOREPLY) {
                                return; // don't send a reply
                            }

                            try {
                                validator.validate(`urn:${action}.conf`, result);
                            } catch (error) {
                                throw createError("InternalError", error.message, {});
                            }

                            try {
                                await this.sendMessage(CALLRESULT_MESSAGE, messageId, result);
                            } catch (error) {
                                throw createError("InternalError", error.message, {});
                            }
                        }
                        break;
        
                    case CALLRESULT_MESSAGE:
                        console.log("CALLRESULT_MESSAGE");
                        break;
        
                    case CALLERROR_MESSAGE:
                        console.log("CALLERROR_MESSAGE");
                        break;
                      
                    default:
                        console.log("Wrong message type id");
                }
            }

        } catch (error) {
            await this.sendMessage(CALLERROR_MESSAGE, messageId, error.message);
        }
    }

    async sendMessage (messageType = CALLRESULT_MESSAGE, messageId, command) {
        return new Promise((resolve, reject) => {
            let messageToSend;
            messageToSend = JSON.stringify([messageType, messageId, command]);

            if (this.client.readyState === this.client.OPEN) {
                this.client.send(messageToSend);
                resolve();
            } else {
                console.log(`Socket closed ${messageId}`);
            }
        });
    }
}

module.exports = RPCServer;