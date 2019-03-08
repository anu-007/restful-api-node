//cli related tasks
 const readLine = require('readline');
 const util = require('util');
 const debug = util.debuglog('cli');
 const events = require('events');
 class _events extends events{};
 
 const e = new _events();

 //instensiate the cli object
 const cli = {};

 //input handlers
 e.on('man', function(str) {
     cli.responders.help();
 });

 e.on('help', function(str) {
     cli.responders.help();
 });

 e.on('exit', function(str) {
    cli.responders.exit();
 });

 e.on('stats', function(str) {
    cli.responders.stats();
 });

 e.on('list users', function(str) {
    cli.responders.listUsers();
 });

 e.on('more user info', function(str) {
    cli.responders.moreUserInfo(str);
 });

 e.on('list checks', function(str) {
    cli.responders.listChecks(str);
 });

 e.on('more check info', function(str) {
    cli.responders.moreCheckInfo(str);
 });

 e.on('list logs', function(str) {
    cli.responders.listLogs();
 });

 e.on('more log info', function(str) {
    cli.responders.moreLogInfo(str);
 });

 //responders object
 cli.responders = {};

 //help/man
 cli.responders.help = function() {
    console.log('help');
 };

 //exit
 cli.responders.exit = function() {
    console.log('exit');
 };

 //stats
 cli.responders.stats = function() {
    console.log('stats');
 };

 //list users
 cli.responders.listUsers = function(str) {
    console.log('list users',str);
 };

 //more user info
 cli.responders.moreUserInfo = function(str) {
    console.log('more user info',str);
 };

 //list checks
 cli.responders.listChecks = function(str) {
    console.log('list checks',str);
 };

 //more check info
 cli.responders.moreCheckInfo = function(str) {
    console.log('more check info',str);
 };

 //list logs
 cli.responders.listLogs = function() {
    console.log('list logs');
 };

 // more log info
 cli.responders.moreLogInfo = function(str) {
    console.log('more log info',str);
 };

 //input processor
 cli.processInput = function(str) {
     str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
     //only want to process the input if a user actually wrote something otherwise ignore it
     if(str) {
         //codify the unique string that identify the unique questions to be asked
         const uniqueInputs = [
             'man',
             'help',
             'exit',
             'stats',
             'list users',
             'more user info',
             'list checks',
             'more check info',
             'list logs',
             'more log info'
         ];
         //go throught possible inputs, emit on event when match is found
         let matchFound = false;
         let counter = 0;

         uniqueInputs.some(function(input) {
            if(str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;
                //emit the event matching the unique input and include the full string given by user
                e.emit(input, str);
                return true;
            }
         });

         //if no match found, tell user to try again
         if(!matchFound) {
             console.log('Sorry, try again');
         }
     }
 }

 //init script
 cli.init = function() {
    // send the start message to console in dark blue
    console.log('\x1b[34m%s\x1b[0m', `cli is running`);

    //start the interface
    const _interface = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    });

    //create an initial prompt
    _interface.prompt();

    //handle each line of input seperately
    _interface.on('line', function(str) {
        //send to input processor
        cli.processInput(str);

        //re-initialize the prompt afterwards
        _interface.prompt();

        //if the user stops the cli
        _interface.on('close', function(){
            process.exit(0);
        });
    });
 }

 module.exports = cli;