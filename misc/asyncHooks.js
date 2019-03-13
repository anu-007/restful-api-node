// async hook example

const async_hooks = require('async_hooks');
const fs = require('fs');

//target execution context
const targetExecutionContext = false;

//write an arbitrary async function
const whatTimeIsIt = function(callback) {
    setInterval(function() {
        fs.writeSync(1, 'when the setinterval runs the execution contex is '+async_hooks.executionAsyncId()+'\n');
        callback(Date.now());
    }, 1000);
};

//call the function
whatTimeIsIt(function(time) {
    fs.writeSync(1, 'the time is '+time+'\n');
});

//hooks
const hooks = {
    init(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, 'hooks init '+asyncId+'\n');
    },
    before(asyncId) {
        fs.writeSync(1, 'hooks before '+asyncId+'\n');
    },
    after(asyncId) {
        fs.writeSync(1, 'hooks after '+asyncId+'\n');
    },
    destroy(asyncId) {
        fs.writeSync(1, 'hooks destroy '+asyncId+'\n');
    },
    promiseResolve(asyncId) {
        fs.writeSync(1, 'hooks promiseResolve '+asyncId+'\n');
    }
};

//create a new async hooks instance
const asyncHook = async_hooks.createHook(hooks);
asyncHook.enable();