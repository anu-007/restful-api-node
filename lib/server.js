// server related tasks
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const StringDecoder = require('string_decoder').StringDecoder;
const path = require('path');

const server = {};

server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res); 
});

//instanciate https server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res); 
});

//start the https server
server.httpsServer.listen(config.httpPort, _=> {
    console.log(`server is up on port ${config.httpsPort} in ${config.envName} mode`);
});

// unified server logic http ad https
server.unifiedServer = function(req,res) {
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
        const chooseHandler = typeof(server.router[trimmedPath]) != 'undefined' ? server.router[trimmedPath] : handlers.notFound;

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
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}

//init script
server.init = function() {
    //start the http server
    // instanciate the http server
    // TODO: config port problem
    server.httpServer.listen(3000, _=> {
        console.log(`server is up on port ${config.httpPort} in ${config.envName} mode`);
    });

    //start the https server

}

//export the server
module.exports = server;