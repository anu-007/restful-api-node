//helpers for various tasks
const crypto = require('crypto');
const config = require('./config');

// container for all helpers
const helpers = {};

// creates a sha256 hash of the password
helpers.hash = function(str) {
    if(typeof(str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false
    }
}

//parse json string to an objec in all cases without throwing
helpers.parseJsonToObject = function(str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch(err) {
        return {};
    }
}

module.exports = helpers;