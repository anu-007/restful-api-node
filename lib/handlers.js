//request handlers
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// define handlers
const handlers = {};

/*
 * HTML handlers
 *
 */

//index handler
handlers.index = function(data, callback) {
    //reject any request that isin't a GET
    if(data.method == 'GET') {
        //prepare data for interpolation
        const templateData = {
            'head.title': 'Uptime monetoring made simple',
            'head.description': 'TWe offer free simple uptime monetoring for HTTP/HTTPS sites of all kinds , when your site goes down we send to text msg',
            'body.class': 'index',
        };

        //read in the index template as string
        helpers.getTemplate('index', templateData, function(err, str) {
            if(!err && str) {
                // add universal header and footers
                helpers.addUinversalTemplates(str, templateData, function(err, str) {
                    if(!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

//create account handler
handlers.accountCreate = function(data, callback) {
        //reject any request that isin't a GET
        if(data.method == 'GET') {
            //prepare data for interpolation
            const templateData = {
                'head.title': 'Create An account',
                'head.description': 'Signup is easy and only takes few seconds',
                'body.class': 'accountCreate',
            };
    
            //read in the index template as string
            helpers.getTemplate('accountCreate', templateData, function(err, str) {
                if(!err && str) {
                    // add universal header and footers
                    helpers.addUinversalTemplates(str, templateData, function(err, str) {
                        if(!err && str) {
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                } else {
                    callback(500, undefined, 'html');
                }
            });
        } else {
            callback(405, undefined, 'html');
        }
};

//create new session
handlers.sessionCreate = function(data, callback) {
    //reject any request that isin't a GET
    if(data.method == 'GET') {
        //prepare data for interpolation
        const templateData = {
            'head.title': 'Login to your Account',
            'head.description': 'Please enter your number and password to access your account',
            'body.class': 'sessionCreate',
        };

        //read in the index template as string
        helpers.getTemplate('sessionCreate', templateData, function(err, str) {
            if(!err && str) {
                // add universal header and footers
                helpers.addUinversalTemplates(str, templateData, function(err, str) {
                    if(!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

//favicon
handlers.favicon = function(data, callback) {
    //reject any request that isn't a GET
    if(data.method == 'GET') {
        //read in the favicon's data
        helpers.getStaticAsset('favicon.ico', function(err, data) {
            if(!err && data) {
                //callback data
                callback(200, data, 'favicon');
            } else {
                callback(500);
            }
        });
    } else {
        callback(405);
    }
}

//public assets
handlers.public = function(data, callback) {
    //reject any request that isn't a GET
    if(data.method == 'GET') {
        //get the filename requested
        const trrimedAssetName = data.trimmedPath.replace('public/', '').trim();
        if(trrimedAssetName.length > 0) {
            //read the asset's data
            helpers.getStaticAsset(trrimedAssetName, function(err, data) {
                if(!err && data) {
                    //determine the content type and default to plain text
                    let contentType = 'plain';
                    if(trrimedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }
                    if(trrimedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }
                    if(trrimedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }
                    if(trrimedAssetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }
                    //callback the data
                    callback(200, data, contentType);
                } else {
                    callback(404);
                }
            });
        } else {
            callback(404);
        }
    } else {
        callback(405);
    }
}

/*
 * JSON API handlers
 *
 */

//users
handlers.users = function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {
        handlers._users[data.method.toLowerCase()](data, callback);
    } else {
        callback(405);
    }
};

//container for users submethods
handlers._users = {};

//users - post
//required data: firstName, lastName, password, phone, tosAgreement
//optional data: none
handlers._users.post = function(data, callback) {
    //check for required fields are filled out
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 12 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? data.payload.tosAgreement : true;
    
    if(firstName && lastName && phone && password && tosAgreement) {
        //make sure that user doesn't already exist
        _data.read('users', phone, function(err, data) {
            if(err) {
                //hash the password
                const hashPassword = helpers.hash(password);

                //create user object
                if(hashPassword) {
                    const userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashPassword,
                        tosAgreement
                    };
    
                    //store the user
                    _data.create('users', phone, userObject, function(err) {
                        if(!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'could not create new user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'could not hash users\'s password'});
                }
            } else {
                callback(400, {'Error': 'user with that phone number already exist'});
            }
        })
    } else {
        callback(400, {'Error': 'missing required fields'});
    }
};

//users - get
//reqiore data : phone
//optional data : none
handlers._users.get = function(data, callback) {
    //check if the phone number provided is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false;
    if(phone) {
        //get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if(tokenIsValid) {
                //lookup to data
                _data.read('users', phone, function(err, data) {
                    if(!err && data) {
                        //remove the hashed password from user object
                        delete data.hashPassword;
                        callback(200, data);
                    } else {
                        callback(400);
                    }
                });
            } else {
                callback(403, {'Error': 'missing required token in header or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'missing required filed'});
    }
};

//users - put
//required data : phone
//optional data : firstName, lastName, password (at least one must be specified)
handlers._users.put = function(data, callback) {
    //check for the required field
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 12 ? data.payload.phone.trim() : false;

    //check for optional fields
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    //error if the phone is invalid
    if(phone) {
        if(firstName || lastName || password) {
            //get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            //verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
                if(tokenIsValid) {
                    //lookup user
                    _data.read('users', phone, function(err, userData) {
                        if(!err && userData) {
                            //update the field necessary
                            if(firstName) {
                                userData.firstName = firstName;
                            }
                            if(lastName) {
                                userData.lastName = lastName;
                            }
                            if(password) {
                                userData.password = helpers.hashPassword(password);
                            }

                            //store the new data
                            _data.update('users', phone, userData, function(err) {
                                if(!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {'Error': 'could not update data'});
                                }
                            })
                        } else {
                            callback(400, {'Error': 'specified user does not exist'});
                        }
                    })     
                } else {
                    callback(403, {'Error': 'missing required token in header or token is invalid'});
                }
            });
        } else {
            callback(400, {'Error': 'missing fields to update'});
        }
    } else {
        callback(400, {'Error': 'missing required fields'});
    }
};

//users - delete
//required fields: phone
handlers._users.delete = function(data, callback) {
    //check if the phone number is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false;
    if(phone) {
        //get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if(tokenIsValid) {
                //lookup to data
                _data.read('users', phone, function(err, userData) {
                    if(!err && userData) {
                        _data.delete('users', phone, function(err) {
                            if(!err) {
                                //delete each of the checks associated with the users
                                const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                const checksToDelete = userChecks.length;
                                if(checksToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionError = false;

                                    //loop through the checks
                                    userChecks.forEach(function(checkId) {
                                        //delete the checks
                                        _data.delete('checks', checkId, function(err) {
                                            if(err) {
                                                deletionError = true;
                                            }
                                            checksDeleted++;
                                            if(checksDeleted === checksToDelete) {
                                                if(!deletionError) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'Errors encountered while attempting to delete all of the users check all checks may not have been deleted from system successfully'});
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500, {'Error': 'could not delete user'});
                            }
                        });
                    } else {
                        callback(400, {'Error': 'could not find the specified user'});
                    }
                });
            } else {
                callback(403, {'Error': 'missing required token in header or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'missing required filed'});
    }
};

//tokens
handlers.tokens = function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {
        handlers._tokens[data.method.toLowerCase()](data, callback);
    } else {
        callback(405);
    }
};

//container for all the tokens method
handlers._tokens = {};

//tokens - post
//required data - phone, password
//optional data - none
handlers._tokens.post = function(data, callback) {
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 12 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password) {
        //lookup the user who matches the phone number
        _data.read('users', phone, function(err, userData) {
            if(!err && userData) {
                // hash the sent password and compare to the password stored in user object
                const hashPassword = helpers.hash(password);
                if(hashPassword == userData.hashPassword) {
                    // if valid create a new token with a random name, set expiration data 1 hour in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000*60*60;
                    const tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        if(!err) {
                            callback(200, tokenObject);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'could not create the new token'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'password did not matched'});
                }
            } else {
                callback(400, {'Error': 'could not find the specified user'});
            }
        });
    } else {
        callback(400, {'Error': 'missing required field'});
    }
}

// tokens -get
//required data: id
//optional data: none
handlers._tokens.get = function(data, callback) {
    //check if the id is valid
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id) {
        //lookup to data
        _data.read('tokens', id, function(err, tokenData) {
            if(!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'missing required filed'});
    }
}

// tokens -put
//required data: id, extend
//optional data: none
handlers._tokens.put = function(data, callback) {
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(id && extend) {
        // lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if(!err && tokenData) {
                //make sure if token is not expired
                if(tokenData.expires > Date.now()) {
                    //set expiration from 1 hour from now
                    tokenData.expires = Date.now() + 1000*60*60;

                    //store the new updates
                    _data.update('tokens', id, tokenData, function(err) {
                        if(!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error': 'error updating expiry time'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'token already expired and cannot extended'});
                }
            } else {
                callback(400, {'Error': 'specified token does not exist'});
            }
        });
    } else {
        callback(400, {'Error': 'missing required fileds or fields are invalid'})
    }
}

// tokens -delete
//required data: id
//optional data: none
handlers._tokens.delete = function(data, callback) {
    //check if the id is valid
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id) {
        //lookup to data
        _data.read('tokens', id, function(err, data) {
            if(!err && data) {
                _data.delete('tokens', id, function(err) {
                    if(!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'could not delete token'});
                    }
                });
            } else {
                callback(400, {'Error': 'could not find the specified token'});
            }
        });
    } else {
        callback(400, {'Error': 'missing required filed'});
    }
}

//verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
    //lookup the token
    _data.read('tokens', id, function(err, tokenDate) {
        if(!err && tokenDate) {
            if(tokenDate.phone == phone && tokenDate.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

//checks
handlers.checks = function(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {
        handlers._checks[data.method.toLowerCase()](data, callback);
    } else {
        callback(405);
    }
};

//container for all the checks method
handlers._checks = {};

//checks - post
//required data: protocol, url, methods, successcode, timeout
//optional data: none
handlers._checks.post = function(data, callback) {
    //validate input
    const protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 == 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds  : false;

    if(protocol && url && method && successCodes && timeoutSeconds) {
        //get the tokens from headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData) {
            if(!err && tokenData) {
                const userPhone = tokenData.phone;

                //lookup the user data
                _data.read('users', userPhone, function(err, userData) {
                    if(!err && userData) {
                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        //verify user have less than the number of checks allowed
                        if(userChecks.length < config.maxChecks) {
                            const checkId = helpers.createRandomString(20);
                            
                            //create the  check object and include the users f=phone
                            const checkObject = {
                                id: checkId,
                                userPhone,
                                protocol,
                                url,
                                method,
                                successCodes,
                                timeoutSeconds
                            };

                            //save the object
                            _data.create('checks', checkId, checkObject, function(err) {
                                if(!err) {
                                    // Add the check if to users object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    //save the new user data
                                    _data.update('users', userPhone, userData, function(err) {
                                        if(!err) {
                                            callback(200, checkObject);
                                        } else {
                                             callback(500, {'Error': 'could not update user with new check'});
                                        }
                                    });
                                } else {
                                    callback(500, {'Error': 'could not create new check'});
                                }
                            });
                        } else {
                            callback(400, {'Error': 'the user aalready has the maximum number of checks ('+ config.maxChecks+')'});
                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(401);
            }
        });
    } else {
        callback(400, {'Error': 'missing required input or inputs are invalid'});
    }
}

//checks- get
// required data - id
// optional data - none
handlers._checks.get = function(data, callback) {
    //check if the id is valid
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id) {
        //lookup the checks
        _data.read('checks', id, function(err, checkData) {
            if(!err && checkData) {
                //get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                //verify that the given token is valid for the user who created the check
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if(tokenIsValid) {
                        //return the check data
                        callback(200, checkData);
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'missing required filed'});
    }
};

//checks -put
//required data- id
//optionals data - protocol, url, methods, successCodes, timeoutSeconds (one must be given)
handlers._checks.put = function(data, callback) {
    //checks for the required fields
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    //check for optional fields
    const protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 == 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds  : false;

    //check to make sure id is valid
    if(id) {
        //check to make sure one or more optional field is sent
        if(protocol || url || method || successCodes || timeoutSeconds) {
            //lookup the check
            _data.read('checks', id, function(err, checkData) {
                if(!err && checkData) {
                    //get the token from the headers
                    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                    //verify that the given token is valid for the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                        if(tokenIsValid) {
                            //update the check where necessary
                            if(protocol) {
                                checkData.protocol = protocol;
                            }

                            if(url) {
                                checkData.url = url;
                            }

                            if(method) {
                                checkData.method = method;
                            }

                            if(successCodes) {
                                checkData.successCodes = successCodes;
                            }

                            if(timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            //store the new update
                            _data.update('checks', id, checkData, function(err) {
                                if(!err) {
                                    callback(200);
                                } else {
                                    callback(500, {'Error': 'could not update the check'});
                                }
                            });
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(400, {'Error': 'checkid does not exist'});
                }
            });
        } else {
            callback(400, {'Error': 'missing required field'});
        }
    } else {
        callback(400, {'Error': 'missing required field'});
    }
}

//checks - delete
//required data - id
//optional data - none
handlers._checks.delete = function(data, callback) {
    //check if the phone number is valid
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id) {
        //lookup the checks
        _data.read('checks', id, function(err, checkData) {
            if(!err && checkData) {
                 //get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                //verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if(tokenIsValid) {
                        //delete the checkdata
                        _data.delete('checks', id, function(err) {
                            if(!err) {
                                //lookup the users 
                                _data.read('users', checkData.userPhone, function(err, userData) {
                                    if(!err && data) {
                                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                        // remove the deleted checks from the list of checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            _data.update('users', checkData.userPhone, userData, function(err) {
                                                if(!err) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'could not update the user'});
                                                }
                                            });
                                        } else {
                                            callback(500, {'Error': 'could not find the check in users object so could not remove it'});
                                        }
                                    } else {
                                        callback(400, {'Error': 'could not find the specified user'});
                                    }
                                });
                            } else {
                                callback(500, {'Error': 'could not find the user who created the check, so could not remove the check from the list of checks on user object'});
                            }
                        });
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(400, {'Error': 'specified checkid does not exist'});
            }
        });
    } else {
        callback(400, {'Error': 'missing required filed'});
    }
};

// sample handler
handlers.ping = function(data, cb) {
    // call a http status code and a payload object
    cb(200);
}

//not found handler
handlers.notFound = function(data, cb) {
    cb(404);
}

module.exports = handlers;