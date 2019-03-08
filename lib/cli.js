//cli related tasks
 const readLine = require('readline');
 const util = require('util');
 const debug = util.debuglog('cli');
 const events = require('events');
 class _events extends events{};
 
 const e = new _events();

 //instensiate the cli object
 const cli = {};

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