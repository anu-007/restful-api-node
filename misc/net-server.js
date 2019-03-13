// example tcp server

const net = require('net');
 
//create the server
const server = net.createServer(function(connection) {
    //send the word pong
    const outboundMessage = 'pong';
    connection.write(outboundMessage);

    //when client write something log it out
    connection.on('data', function(inboundMessage) {
        const messageString = inboundMessage.toString();
        console.log('i wrote '+outboundMessage+' and they said '+ messageString);
    });
});

//listening
server.listen(6000);