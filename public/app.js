//front end logic for app

//container for the front end application
const app = {};

//config
app.config = {
    'sessionToken': false
};

//ajax client for restful API
app.client = {};

//interface for making API calls
app.client.request = function(headers, path, method, queryStringObject, payload, callback) {
    //setting defaults for all of these
    headers = typeof(headers) == 'object' && headers !== null ? headers : {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;

    //for each querystring parameter end add it to the path
    let requestUrl = path+'?';
    let counter = 0;
    for(let queryKey in queryStringObject) {
        if(queryStringObject.hasOwnProperty(queryKey)) {
            counter ++;
            //if atleast one query string parameter has already been added, prepend new one
            if(counter > 1) {
                requestUrl += '%';
            }
            //add key value
            requestUrl += queryKey+'='+queryStringObject[queryKey];
        }
    }
    //form http request as a JSON type
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    //for each header sent, add it to request
    for(let headerKey in headers) {
        if(header.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        } 
    }
    //if there is a current session token set, that as header
    if(app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }
    //when the request come back
    xhr.onreadystatechange = function() {
        if(xhr.readyState == XMLHttpRequest.DONE) {
            const statusCode = xhr.status;
            const responseReturned = xhr.responseText;

            //callbackif requested
            if(callback) {
                try {
                    const parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch(e) {
                    callback(statusCode, false);
                }
            }
        }
    }
    //send payload as JSON
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}
