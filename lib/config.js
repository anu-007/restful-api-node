// container for all enviroment
const enviroments = {};

// staging (default) object
enviroments.staging = {
    'httpPort': 5003,
    'httpsPort': 5004,
    'envName': 'staging',
    'hashingSecret': 'this is a secret',
    'maxChecks': 5,
    'twilio': {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+918750841262'
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'Not a real company inc.',
        'yearCreated': '2019',
        'baseUrl': 'http://localhost:3000/'
    }
};

// production object
enviroments.production = {
    'httpPort': 5001,
    'httpsPort': 5002,
    'envName': 'production',
    'hashingSecret': 'this is also a secret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': '',
        'authToken': '',
        'fromPhone': ''
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'Not a real company inc.',
        'yearCreated': '2019',
        'baseUrl': 'http://localhost:5000/'
    }
};

// Determine which enviroment was passed s a command line argument
const currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current env is one of the enviroment above, if not then default to staging
var enviromentToExport = typeof(enviroments[currentEnv]) == 'object' ? enviroments[currentEnv] : enviroments.staging;

// export the module
module.exports = enviromentToExport;