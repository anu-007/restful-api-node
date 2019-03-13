// Example tcp client

const net = require('net');

//define the message to send
const outboundMessage = 'ping';

//create the client
const client = net.createConnection({ 'port': 6000 }, function() {
    //send the message
    client.write(outboundMessage);
});

//when the server writes back, log what it says then kill it
client.on('data', function(inboundMessage) {
    const messageString = inboundMessage.toString();
    console.log('i wrote '+outboundMessage+' and they said '+ messageString);
    client.end(); 
});