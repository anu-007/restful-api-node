//unit tests

const helpers = require('./../lib/helpers');
const assert = require('assert');
const logs = require('../lib/logs');
const exampleDebuggingProblem = require('./../lib/exampleDebuggingProblem');

//a holder for the tests
const unit = {};

//assert that getANumber function return a number
unit['helpers.getANumber should return a number'] = function(done) {
    const val = helpers.getANumber();
    assert.equal(typeof(val), 'number');
    done();
};

//assert that getANumber function return 1
unit['helpers.getANumber should return 1'] = function(done) {
    const val = helpers.getANumber();
    assert.equal(val, 1);
    done();
};

//assert that getANumber function return 2
unit['helpers.getANumber should return 2'] = function(done) {
    const val = helpers.getANumber();
    assert.equal(val, 2);
    done();
};

// Logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log names'] = function(done){
    logs.list(true,function(err,logFileNames){
        assert.equal(err, false);
        assert.ok(logFileNames instanceof Array);
        assert.ok(logFileNames.length > 1);
        done();
    });
  };
  
// Logs.truncate should not throw if the logId doesnt exist
unit['logs.truncate should not throw if the logId does not exist, should callback an error instead'] = function(done){
    assert.doesNotThrow(function(){
        logs.truncate('I do not exist',function(err){
        assert.ok(err);
        done();
        })
    },TypeError);
};

// exampleDebuggingProblem.init should not throw (but it does)
unit['exampleDebuggingProblem.init should not throw when called'] = function(done){
    assert.doesNotThrow(function(){
        exampleDebuggingProblem.init();
        done();
    },TypeError);
};

module.exports = unit;