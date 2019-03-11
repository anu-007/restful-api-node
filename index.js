// Primary file for API

//dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

//declare the app
const app = {};

//init function
app.init = function(callback) {
    //start the server
    server.init();

    //start the workers
    workers.init();

    //start the cli and make sure it starts at last
    setTimeout(function() {
        cli.init();
        callback();
    },50);
};

//self invoking only if required directly
if(require.main === module) {
    app.init(function(){});
}

//export the app
module.exports = app;