//example repl server

const repl = require('repl');

//start the repl
repl.start({
    'prompt': '>',
    'eval': function(str) {
        //evaluation function for incoming input
        console.log('we are at the evaluation stage: ', str);

        //if the user says fizz, say buzz back to them
        if(str.indexOf('fizz') > -1) {
            console.log('buzz');
        }
    }
});