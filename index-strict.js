// Primary file for API

//dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

//declare the app
const app = {};

//declare a global that strict mode should catch
 foo = 'bar';

//init function
app.init = function() {
    //start the server
    server.init();

    //start the workers
    workers.init();

    //start the cli and make sure it starts at last
    setTimeout(function() {
        cli.init();
    },50);
};

//execute
app.init();

//export the app
module.exports = app;