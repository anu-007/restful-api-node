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
const util = require('util');
const debug = util.debuglog('server');

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
        chooseHandler(data, function(statusCode, payload, contentTyoe) {
            //determine the type of response (fallback to json)
            contentTyoe = typeof(contentTyoe) == 'string' ? contentTyoe : 'json';

            // use the status code returned by handler or send 200 by default
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // return the response parts that are content specific
            let payloadString = '';
            if(contentTyoe == 'json') {
                res.setHeader('Content-Type', 'application/json');
                // use the payload called by the handler, or default to the empty object
                payload = typeof(payload) == 'object' ? payload : {};
                // convert hte payload to string
                payloadString = JSON.stringify(payload);
            }
            if(contentTyoe == 'favicon'){
                res.setHeader('Content-Type', 'image/x-icon');
                // convert hte payload to string
                payloadString = typeof(payload) == 'string' ? payload : '';
            }
            if(contentTyoe == 'css'){
                res.setHeader('Content-Type', 'text/css');
                // convert hte payload to string
                payloadString = typeof(payload) == 'string' ? payload : '';
            }
            if(contentTyoe == 'png'){
                res.setHeader('Content-Type', 'image/png');
                // convert hte payload to string
                payloadString = typeof(payload) == 'string' ? payload : '';
            }
            if(contentTyoe == 'jpg'){
                res.setHeader('Content-Type', 'image/jpeg');
                // convert hte payload to string
                payloadString = typeof(payload) == 'string' ? payload : '';
            }
            if(contentTyoe == 'plain'){
                res.setHeader('Content-Type', 'text/plain');
                // convert hte payload to string
                payloadString = typeof(payload) == 'string' ? payload : '';
            }

            //return the response parts that are common to all content type
            res.writeHead(statusCode);
            res.end(payloadString);

            // if the response is 200 print green else red
            if(statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+'/'+trimmedPath+' '+statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+'/'+trimmedPath+' '+statusCode);
            }         
        }); 
    });
};

// defining a request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'sessions/create': handlers.sessionCreate,
    'sessions/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.public
}

//init script
server.init = function() {
    //start the http server
    // instanciate the http server
    // TODO: config port problem
    server.httpServer.listen(3000, _=> {
        console.log('\x1b[36m%s\x1b[0m', `server is up on port ${config.httpPort} in ${config.envName} mode`);
    });

    //start the https server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log('\x1b[35m%s\x1b[0m', `server is up on port ${config.httpsPort} in ${config.envName} mode`);
    });
};

//export the server
module.exports = server;