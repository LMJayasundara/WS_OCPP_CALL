const {createValidator } = require('./validator');

// const validator = createValidator('ocpp2.0.1', require('../schemas/ocpp2_0_1.json'));
const validator = createValidator('ocpp1.6', require('../schemas/ocpp1_6.json'));

const msgId = 3;
const method = "BootNotification";
const params = {
    // chargePointVendor: "ocpp-rpc",
    chargePointModel: "ocpp-rpc",
}

try {
    let res = validator.validate(`urn:${method}.req`, params);
    console.log(res);
} catch (error) {
    // this.emit('strictValidationFailure', error);
    console.log("error: ", error.details); // 
    // throw error;
}
