// Primary file for API

//dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const os = require('os');
const cluster = require('cluster');

//declare the app
const app = {};

//init function
app.init = function(callback) {
    //if we are on master threas start worker and cli
    if(cluster.isMaster) {
        //start the workers
        workers.init();

        //start the cli and make sure it starts at last
        setTimeout(function() {
            cli.init();
            callback();
        },50);

        //fork the process
        for(let i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }
    } else {
        //if we are not in the master thread start server
        server.init();
    }
};

//self invoking only if required directly
if(require.main === module) {
    app.init(function(){});
}

//export the app
module.exports = app;