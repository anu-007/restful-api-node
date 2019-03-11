// Primary file for API

//dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

//declare the app
const app = {};

//init function
app.init = function() {
    //start the server
    debugger;
    server.init();
    debugger;

    //start the workers
    debugger;
    workers.init();
    debugger;

    //start the cli and make sure it starts at last
    debugger;
    setTimeout(function() {
        cli.init();
        debugger;
    },50);
    debugger;

    // set foo at 1
    debugger;
    let foo = 1;
    console.log('just assigned 1 to foo');
    debugger;

    //increment foo
    foo++;
    console.log('just incremented foo');
    debugger;

    //square foo
    foo = foo * foo;
    console.log('just squared foo');
    debugger;

    //convert foo to string
    foo = foo.toString();
    console.log('just converted foo to string');
    debugger;

    //call this script that will throw
    exampleDebuggingProblem.init();
    console.log('just called the library');
    debugger;
};

//execute
app.init();

//export the app
module.exports = app;