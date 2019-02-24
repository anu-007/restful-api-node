// container for all enviroment
const enviroments = {};

// staging (default) object
enviroments.staging = {
    'httpPort': 5003,
    'httpsPort': 5004,
    'envName': 'staging',
    'hashingSecret': 'this is a secret'
};

// production object
enviroments.production = {
    'httpPort': 5001,
    'httpsPort': 5002,
    'envName': 'production',
    'hashingSecret': 'this is also a secret'
};

// Determine which enviroment was passed s a command line argument
const currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current env is one of the enviroment above, if not then default to staging
var enviromentToExport = typeof(enviroments[currentEnv]) == 'object' ? enviroments[currentEnv] : enviroments.staging;

// export the module
module.exports = enviromentToExport;