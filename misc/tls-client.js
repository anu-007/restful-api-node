// Example tls client

const tls = require('tls');
const fs = require('fs');
const path = require('path');

//server options
const options = {
    'ca': fs.readFileSync(path.join(__dirname,'../https/cert.pem')) //only required due to self signed cert
};

//define the message to send
const outboundMessage = 'ping';

//create the client
const client = tls.connect(6000, options, function() {
    //send the message
    client.write(outboundMessage);
});

//when the server writes back, log what it says then kill it
client.on('data', function(inboundMessage) {
    const messageString = inboundMessage.toString();
    console.log('i wrote '+outboundMessage+' and they said '+ messageString);
    client.end(); 
});