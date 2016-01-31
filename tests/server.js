#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(3000, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

var serverSpawned = false;
var echoRequestHandler = function(request) {

    var connection = request.accept(null, request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        console.log(message);
        if (message.utf8Data === '{"cmd":"spawnFiveMinServer"}') {
            if (!serverSpawned) {
                console.log('delay server spawn 15s');
                setTimeout(function() {
                    console.log('spawn 5min server');
                    spawnFiveMinServer();
                }, 15000);
                serverSpawned = true;
            }
        }
        connection.send(message.utf8Data);
    });

    connection.on('close', function(connection) {
        // close user connection
    });

}

// WebSocket server
wsServer.on('request', echoRequestHandler);

var spawnFiveMinServer = function() {
    var fiveMinServer = http.createServer(function(request, response) {
        // process HTTP request. Since we're writing just WebSockets server
        // we don't have to implement anything.
    });
    fiveMinServer.listen(3001, function() { });

    // create the server
    fiveMinWsServer = new WebSocketServer({
        httpServer: fiveMinServer
    });

    // WebSocket server
    fiveMinWsServer.on('request', echoRequestHandler);

    // close server after 5m
    setTimeout(function() {
        console.log('server process ended, restart the server if needed.');
        process.exit();
    }, 300000);
}
