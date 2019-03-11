//test runner

const helpers = require('./../lib/helpers');
const assert = require('assert');

//application logic for test runner
_app = {};

//container for the test
_app.tests = {};

//addon the unit test
_app.tests.unit = require('./unit');

//count all the tests
_app.countTests = function() {
    let counter = 0;
    for(let key in _app.tests) {
        if(_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];
            for(let testName in subTests) {
                if(subTests.hasOwnProperty(testName)) {
                    counter++;
                }
            }
        }
    }
    return counter;
};

//run all test collect error and successes
_app.runTests = function() {
    const errors = [];
    let successes = 0;
    let limit = _app.countTests();
    let counter = 0;
    for(let key in _app.tests) {
        if(_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];
            for(let testName in subTests) {
                if(subTests.hasOwnProperty(testName)) {
                    (function() {
                        const tempTestName = testName;
                        const testValue = subTests[testName];
                        //call the tests
                        try {
                            testValue(function() {
                                //if it calls back without throwing then it succeeded console in green
                                console.log('\x1b[32m%s\x1b[0m', tempTestName);
                                counter++;
                                successes++;
                                if(counter == limit) {
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            });
                        } catch(e) {
                            //if it throws then it failed so capture the error thrown, log it in red
                            errors.push({
                                'name': testName,
                                'error': e
                            });
                            console.log('\x1b[31m%s\x1b[0m', tempTestName);
                            counter++;
                            if(counter == limit) {
                                _app.produceTestReport(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }
};

//produce a test outcome report
_app.produceTestReport = function(limit, successes, error) {
    console.log('');
    console.log('----------------------BEGIN TEST REPORTS--------------------------');
    console.log('');
    console.log('total tests: ', limit);
    console.log('Pass: ', successes);
    console.log('Fails: ', error.length);
    console.log('');

    //if there are errors the print them in details
    if(error.length > 0) {
        console.log('----------------------BEGIN ERROR DETAILS--------------------------');
        console.log('');

        error.forEach(function(testError) {
            console.log('\x1b[31m%s\x1b[0m', testError.name);
            console.log(testError.error);
            console.log('');
        });

        console.log('');
        console.log('----------------------END ERROR DETAILS--------------------------');
    }
    console.log('');
    console.log('----------------------END TEST REPORTS--------------------------');
};

//run the tests
_app.runTests();