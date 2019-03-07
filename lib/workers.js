//worker related tasks

//dependencies
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');
const _logs = require('./logs');
const util = require('util');
const debug = util.debuglog('workers');

//instenciate worker objects
const workers = {};

//lookup all the checks, get their data, send to a validator
workers.gatherAllChecks = function() {
    //get all the checks 
    _data.list('checks', function(err, checks) {
        if(!err && checks && checks.length > 0) {
            checks.forEach(function(check) {
                //read the check data
                _data.read('checks', check, function(err, originalCheckData) {
                    if(!err && originalCheckData) {
                        //pass it to check validator, and let the function continue or log errors as needed
                        workers.validateCheckData(originalCheckData);
                    } else {
                        debug('Error reading one of the checks data');
                    }
                });
            });
        } else {
            debug('Error: could not find any checks to process');
        }
    });
};

// sanity checking the check data
workers.validateCheckData = function(originalCheckData) {
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData != null ? originalCheckData : false;
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 12 ? originalCheckData.userPhone.trim() : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length ? originalCheckData.url.trim() : false;
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 == 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds  : false;

    //set the keys that may not be set if the workers never seen this check before
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked  : false;

    // if all the checks pass, pass the data along to the next step in the process
    if(originalCheckData.id &&
        originalCheckData.userPhone &&
        originalCheckData.protocol &&
        originalCheckData.url &&
        originalCheckData.method &&
        originalCheckData.successCodes &&
        originalCheckData.timeoutSeconds) {
            workers.performCheck(originalCheckData);
        } else {
            debug('Error: one of the checks is not properly formatted');
        }
};

//perform the check, send the originalcheckdata and the outcome of the check process, to the next step in the process
workers.performCheck = function(originalCheckData) {
    //prepare the initial check outcome
    const checkOutcome = {
        'error': false,
        'responseCode': false
    };
    //mark that the outcome not send yet
    let outcomeSent = false;

    //parse the hostname and the path out of the original check data
    const parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path; // using path not pathname because we want the querystring

    //constructing the request
    const requestDetail = {
        'protocol': originalCheckData.protocol+':',
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'tiemout': originalCheckData.timeoutSeconds * 1000
    };

    //instenciate the request object using either the http or https module
    const _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
    const req = _moduleToUse.request(requestDetail, function(res) {
        //grab the status of the ent request
        const status = res.statusCode;
        //update the check outcome and pass the data along
        checkOutcome.responseCode = status;
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });
    //bind to the error event so it dosent get thrown
    req.on('error', function(e) {
        //update the checkoutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': e
        };
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    //bind to the timeout
    req.on('timeout', function(e) {
        //update the checkoutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        };
        if(!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    //end the request
    req.end();
};

// process the check outcome, update the checkdata as needed, trigger nd alert if needed
// special logic for accomodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = function(originalCheckData, checkOutcome) {
    //decide if the check is considered up or down
    const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    //decide if the alert is warrented
    const alertWarrented = originalCheckData.lastChecked && originalCheckData.state != state ? true : false;

    // log the outcome
    const timeOfCheck = Date.now();
    workers.log(originalCheckData,checkOutcome, state, alertWarrented, timeOfCheck);

        //update the checkdata
        const newCheckData = originalCheckData;
        newCheckData.state = state;
        newCheckData.lastChecked = timeOfCheck;

    //save the updates
    _data.update('checks', newCheckData.id, newCheckData, function(err) {
        if(!err) {
            //send the new check data to the next phase in the process if needed
            if(alertWarrented) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                debug('Check outcome has not changed, no alert needed');
            }
        } else {
            debug('Error trying to save updates to one of the checks')
        }
    })
};

//Alert the user as to change to their check status
workers.alertUserToStatusChange = function(newCheckData) {
    const msg = 'Alert your check for '+newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state;
    helpers.sendTwilioSms(newCheckData.userPhone, msg, function(err) {
        if(!err) {
            debug('success: user was alerted to a status change in their check, via sms:', msg);
        } else {
            debug('Error: could not alert the user who have a state change in his alert');
        }
    });
};

workers.log = function(originalCheckData,checkOutcome, state, alertWarrented, timeOfCheck) {
    //form the log date
    const logData = {
        check : originalCheckData,
        outcome: checkOutcome,
        state: state,
        alert: alertWarrented,
        time: timeOfCheck
    };
    //convert to string
    const logString = JSON.stringify(logData);
    //determine the name of log file
    const logFileName = originalCheckData.id;

    //append the string to logfile
    _logs.append(logFileName, logString, function(err) {
        if(!err) {
            debug('logging to file succeed');
        } else {
            debug('logging to file failed');
        }
    });
}

//timer to execute the worker process once per minute
workers.loop = function() {
    setInterval(function() {
        workers.gatherAllChecks() 
    }, 1000*60);
};

//rotate (compress) logs file
workers.rotateLogs = function() {
    //listing all non-compress log files
    _logs.list(false, function(err, logs) {
        if(!err && logs && logs.length > 0) {
            logs.forEach((logName) => {
                //compress the data to a different file
                const logId = logName.replace('.log', '');
                const newFileId = logId+'-'+Date.now();
                _logs.compress(logId, newFileId, function(err) {
                    if(!err) {
                        //truncate the file
                        _logs.truncate(logId, function(err) {
                            if(!err) {
                                debug('Success truncating log file');
                            } else {
                                debug('Error truncating log file');
                            }
                        });
                    } else {
                        debug('Error compressing one of the log files', err);
                    }
                });
            });
        } else {
            debug('Error: could not find any logs to compress');
        }
    })
};

//timer to execute  the log-rotation process once per day
workers.logRotationLoop = function() {
    setInterval(function() {
        workers.rotateLogs() 
    }, 1000*60*60*24);
}

//init script
workers.init = function() {
    //send to console in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');
    //execute all the checks immediatly
    workers.gatherAllChecks();
    //call the loops so the checks will execute later on
    workers.loop();
    //compress ll logs immediatly
    workers.rotateLogs();
    //compression loops
    workers.logRotationLoop(); 
};

//export the workers
module.exports = workers;