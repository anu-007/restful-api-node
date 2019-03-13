// example http2 client

const http2 = require('http2');

const client = http2.connect('http://localhost:6000');

//create a request
const req = client.request({
    ':path': '/'
});

//when a msg is recieved add the pieces together unitl you reach the end
let str = '';
req.on('data', function(chunk) {
    str+=chunk;
});

//when the msg end log it out
req.on('end', function() {
    console.log(str);
});

//end the request
req.end();