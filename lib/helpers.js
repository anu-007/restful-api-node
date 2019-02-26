//helpers for various tasks
const crypto = require('crypto');
const queryString = require('querystring');
const https = require('https');
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

//create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength) {
        // define all the posssible characters that can go in the string
        const possibleCharacter = 'abcdefghijklmnopqrstuvwxyz';

        //start the final string
        let str = '';
        for(i = 1; i <= strLength; i++) {
            //get a random character from the possibleCharacters string
            const randomCharacter = possibleCharacter.charAt(Math.floor(Math.random()*possibleCharacter.length)); 
            //append this character to final string
            str += randomCharacter;
        }
        return str;
    } else {
        return false;
    }
}

// send an sms via twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
    //validation parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone) {
        // configure the request payload
        const payload = {
            'from': config.twilio.fromPhone,
            'to': '+'+phone,
            'Body': msg
        };

        //configure the request details
        const stringPayload = queryString.stringify(payload);

        //configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth': config.twilio.accountSid+':'+config.twilio.authToken,
            'headers': {
                'Content-type': 'application/x-www-form-urlencoded',
                 'Content-Length': Buffer.byteLength(stringPayload),
            }
        };

        //instenciate request object
        const req = https.request(requestDetails, function(res) {
            //grab the status of sent request
            const status = res.statusCode;
            //callback successful if the request went through
            if(status == 200 || status == 201) {
                callback(false)
            } else {
                callback('Status code returned was'+ status);
            }
        });

        //bind to the error event so it dosen't get thrown
        req.on('err', function(e) {
            callback(e);
        });

        //add the payload
        req.write(stringPayload);

        //end the request
        req.end();
    } else {
        callback('Given parameters are missing or invalid');
    }
};

module.exports = helpers;