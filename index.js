const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const StringDecoder = require('string_decoder').StringDecoder;

// TODO get rid of this
helpers.sendTwilioSms('917676276713', 'Hello!', function(err) {
    console.log(err);
});

const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res); 
});

// instanciate the http server
// TODO: config port problem
httpServer.listen(3000, _=> {
    console.log(`server is up on port ${config.httpPort} in ${config.envName} mode`);
});

//instanciate https server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res); 
});

//start the https server
httpsServer.listen(config.httpPort, _=> {
    console.log(`server is up on port ${config.httpsPort} in ${config.envName} mode`);
});

// unified server logic http ad https
const unifiedServer = function(req,res) {
    // getting url and parsing it
    const parsedUrl = url.parse(req.url, true);

    // getting the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // getting querystring as an object
    const queryStringObject = parsedUrl.query;

    // getting the HTTP method
    const method = req.method.toUpperCase();

    // getting headers as an object
    const headers = req.headers;

    // getting the payload (if any)
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        //choose the handler this request to go to, if not found then use not found handler
        const chooseHandler = typeof(router[trimmedPath]) != 'undefined' ? router[trimmedPath] : handlers.notFound;

        // construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        }

        // router the request to the handler specified in the router
        chooseHandler(data, function(statusCode, payload) {
            // use the status code returned by handler or send 200 by default
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload called by the handler, or default to the empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // convert hte payload to string
            const payloadString = JSON.stringify(payload);

            // return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // log the request path
            console.log('Returning this response', statusCode, payloadString);            
        }); 
    });
};

// defining a request router
const router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}