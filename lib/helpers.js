//helpers for various tasks
const crypto = require('crypto');
const queryString = require('querystring');
const https = require('https');
const config = require('./config');
const path = require('path');
const fs = require('fs');

// container for all helpers
const helpers = {};

// sample for testing that simply returns a number
helpers.getANumber = function() {
     return 1;
};

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

//get the string content of a template
helpers.getTemplate = function(templateName, data, callback) {
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data != null ? data : false;
    if(templateName) {
        const templatesDir = path.join(__dirname, '/../templates/');
        fs.readFile(templatesDir+templateName+'.html', 'utf8', function(err, str) {
            if(!err && str && str.length > 0) {
                //do the interpolation on the string
                const finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else {
                callback('No template could be found');
            }
        })
    } else {
        callback('A valid templatename was not specified');
    }
};

//add the universal header and footer to a string and pass provided data object to the header and footer fot interpolation
helpers.addUinversalTemplates = function(str, data, callback) {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data != null ? data : false;
    //get the header
    helpers.getTemplate('_header', data, function(err, headerString) {
        if(!err && headerString) {
            //GET THE FOOTER
            helpers.getTemplate('_footer', data, function(err, footerString) {
                if(!err && footerString) {
                    //add them all together
                    const fullString = headerString+str+footerString;
                    callback(false, fullString); 
                } else {
                    callback('Could not find the footer template');
                }
            });
        } else {
            callback('Could not find the header template');
        }
    });
};

//take a given string and a data object and find/replace all keys within it
helpers.interpolate = function(str, data) {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data != null ? data : false;

    //add the template gloabls to the data objects, prependign with their keyname with 'global'
    for(let keyName in config.templateGlobals) {
        if(config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.'+keyName] = config.templateGlobals[keyName];
        }
    }

    //for each key in the data object, insert it's value into the string at corresponding placeholders
    for(let key in data) {
        if(data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
            const replace = data[key];
            const find = '{'+key+'}';
            str = str.replace(find, replace);
        }
    }
    return str;
}

//get the content of static public assets
helpers.getStaticAsset = function(fileName, callback) {
    fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
    if(fileName) {
        const publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir+fileName, function(err, data) {
            if(!err && data) {
                callback(false, data);
            } else {
                callback('no file could be found');
            }
        });
    } else {
        callback('A valid filename was not specified');
    }
}

module.exports = helpers;