//example udp server

const dgram = require('dgram');

//create a server
const server = dgram.createSocket('udp4');

server.on('message', function(messageBuffer, sender) {
    //do something with an incoming message or do something with the sender
    const messageString = messageBuffer.toString();
    console.log(messageString);
});

//bind to 6000
server.bind(6000);