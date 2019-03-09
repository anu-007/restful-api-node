//cli related tasks
 const readLine = require('readline');
 const os = require('os');
 const v8 = require('v8');
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
    const commands = {
        'exit': 'kill the cli and the rest of application',
        'man': 'show the help page',
        'help': 'Alias for man command',
        'stats': 'get stats of underlying os and resource utilization',
        'list users': 'shows a list of all registered (undeleted) user',
        'more user info --{userId}': 'show details of the specific user',
        'list checks --up --down': 'shows list of all active checks in the system',
        'more check info --{checkId}': 'show details of specified check',
        'list logs': 'show a list of all the log files available to be read (compressed and uncompressed)',
        'more log info --{fileName}': 'Show details of specified log file'
    };
    //show the header of man page as wide as width of console
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    //show each command followed by its explanation
    for(let key in commands) {
        if(commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = '\x1b[33m'+key+'\x1b[0m';
            const padding = 60 - line.length;
            for(let i = 0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);
    //end with another horizontal lline
    cli.horizontalLine();
 };

 //create the vertical space
 cli.verticalSpace = function(lines) {
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
    for(let i = 0; i < lines; i++) {
        console.log('');
    }
 };

 //create a horizontal line across the screen
 cli.horizontalLine = function() {
    //get the available screen size
    const width = process.stdout.columns;
    let line = '';
    for(let i = 0; i < width; i++) {
        line += '-';
    }
    console.log(line);
 };

 //create centered text on the screen
 cli.centered = function(str) {
     str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';
     //get the available screen size
     const width = process.stdout.columns;
     //calculate the left padding there should be
     const leftPadding = Math.floor((width - str.length) / 2);

     //put the left padded spaces before the string itself
     let line = '';
     for(let i = 0; i < leftPadding ; i++) {
         line += ' ';
     }
     line += str;
     console.log(line);
 }

 //exit
 cli.responders.exit = function() {
    process.exit(0);
 };

 //stats
 cli.responders.stats = function() {
    //compile an object for stts
    const stats = {
        'load Average': os.loadavg().join(' '),
        'cpu count': os.cpus().length,
        'free memory': os.freemem(),
        'current malloced memory': v8.getHeapSpaceStatistics().malloced_memory,
        'peak malloced memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated heap used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'uptime': os.uptime() + 'seconds'
    };
    //create a header gor stats
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    //log out each stats
    for(let key in stats) {
        if(stats.hasOwnProperty(key)) {
            const value = stats[key];
            let line = '\x1b[33m'+key+'\x1b[0m';
            const padding = 60 - line.length;
            for(let i = 0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace(1);
    //end with another horizontal lline
    cli.horizontalLine();
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