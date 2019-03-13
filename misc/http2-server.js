// example http2 server

const http2 = require('http2');

//init the server
const server = http2.createServer();

//on a stream, send back hello world
server.on('stream', function(stream, header) {
     stream.respond({
        'status': 200,
        'content-type': 'text/html'
     });
     stream.end('<html><body><p>Hello world</p></body></html>')
});

//listen on 6000
server.listen(6000);