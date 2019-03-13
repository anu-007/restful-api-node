// example client

const dgram = require('dgram');

//create a client
const client = dgram.createSocket('udp4');

//define a msg and pull it into a buffer
const messageString = 'This is a message';
const messageBuffer = Buffer.from(messageString);

//send off the message
client.send(messageBuffer, 6000, 'localhost', function(err) {
    client.close();
});