const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true);

    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');
    const method = req.method.toUpperCase();
    const queryStringObject = parsedUrl.query;
    const headers = req.headers;
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        res.end('hello world\n');
        console.log(`request recieved on path: ${trimmedPath} via: ${method} method with query: ${JSON.stringify(queryStringObject)} and headers: ${JSON.stringify(headers)} with payload: ${JSON.stringify(buffer)}`);    
    });
});

server.listen(3000, _=> {
    console.log('server is up on port 3000');
});