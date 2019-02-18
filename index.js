const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const server = http.createServer((req, res) => {
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
            payload: buffer
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
});

// starting server and have it listen to 3000
server.listen(3000, _=> {
    console.log('server is up on port 3000');
});

// define handlers
const handlers = {};

// sample handler
handlers.sample = function(data, cb) {
    // call a http status code and a payload object
    cb(406, { name: 'my name is sample handler' });
}

//not found handler
handlers.notFound = function(data, cb) {
    cb(404);
}

// defining a request router
const router = {
    'sample': handlers.sample
}