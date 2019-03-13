// example tls server

const tls = require('tls');
const fs = require('fs');
const path = require('path');
 
//server options
const options = {
    'key': fs.readFileSync(path.join(__dirname,'../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'../https/cert.pem'))
};

//create the server
const server = tls.createServer(options, function(connection) {
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