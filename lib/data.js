// library for storing and editing data
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

//constainer for the module
const lib = {};

//base directory for the data folder
lib.baseDir = path.join(__dirname,'/../.data/');

lib.create = function(dir, file, data, callback) {
    //open file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            //convert data to string
            const stringData = JSON.stringify(data);

            //wrrite to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err) {
                if(!err) {
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false);
                        } else {
                            callback('error closing a file');
                        }
                    });
                } else {
                    callback('error writing to new file');
                }
            });
        } else {
            callback('could not create new file, it may already exist');
        }
    });
}

//read data from a file
lib.read = function(dir, file, callback) {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err, data) {
        if(!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

//update data inside a file
lib.update = function(dir, file, data, callback) {
    //open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            //truncate the content of file
            fs.truncate(fileDescriptor, function(err){
                if(!err) {
                    //write to file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err) {
                        if(!err) {
                            fs.close(fileDescriptor, function(err) {
                                if(!err) {
                                    callback(false);
                                } else {
                                    callback('error closing the file');
                                }
                            })
                        } else {
                            callback('error writing to existing file');
                        }
                    });
                } else {
                    callback('error truncting file');
                }
            });
        } else {
            callback('could not open the file for updating');
        }
    });
};

//delete a file
lib.delete = function(dir, file, callback) {
    //unlinking the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
}

module.exports = lib;