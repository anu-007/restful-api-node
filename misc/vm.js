// example vm

const vm = require('vm');

//find the context for the script to run in
const context = {
    'foo': 25
};

//define the script
const script = new vm.Script(`
    foo = foo * 2;
    var bar = foo + 1;
    var fizz = 52;
`);

//run the script in new context
script.runInNewContext(context);
console.log(context);