//request handlers
const _data = require('./data');
const helpers = require('./helpers');

// define handlers
const handlers = {};

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
//TODO: only let authenticated user access their object, dont let them access anyones else
handlers._users.get = function(data, callback) {
    //check if the phone number provided is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false;
    if(phone) {
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
        callback(400, {'Error': 'missing required filed'});
    }
};

//users - put
//required data : phone
//optional data : firstName, lastName, password (at least one must be specified)
// TODO: only let authenticated user to update their own object, don't let them update others
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
            callback(400, {'Error': 'missing fields to update'});
        }
    } else {
        callback(400, {'Error': 'missing required fields'});
    }
};

//users - delete
//required fields: phone
//TODO: only authenticated user to delete its object, don't let them to delete others
//TODO: cleanup any other data related to user 
handlers._users.delete = function(data, callback) {
    //check if the phone number is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false;
    if(phone) {
        //lookup to data
        _data.read('users', phone, function(err, data) {
            if(!err && data) {
                _data.delete('users', phone, function(err) {
                    if(!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'could not delete user'});
                    }
                });
            } else {
                callback(400, {'Error': 'could not find the specified user'});
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