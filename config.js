// container for all enviroment
const enviroments = {};

// staging (default) object
enviroments.staging = {
    'port': 3000,
    'envName': 'staging'
};

// production object
enviroments.production = {
    'port': 5001,
    'envName': 'production'
};

// Determine which enviroment was passed s a command line argument
const currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current env is one of the enviroment above, if not then default to staging
var enviromentToExport = typeof(enviroments[currentEnv]) == 'object' ? enviroments[currentEnv] : enviroments.staging;

// export the module
module.exports = enviromentToExport;