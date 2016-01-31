#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {});
server.listen(3000, function() { });

wsServer = new WebSocketServer({
    httpServer: server
});

var serverSpawned = false;
var echoRequestHandler = function(request) {

    var connection = request.accept(null, request.origin);

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
    });

}

// WebSocket server
wsServer.on('request', echoRequestHandler);

var spawnFiveMinServer = function() {
    var fiveMinServer = http.createServer(function(request, response) {
    });
    fiveMinServer.listen(3001, function() { });

    fiveMinWsServer = new WebSocketServer({
        httpServer: fiveMinServer
    });

    fiveMinWsServer.on('request', echoRequestHandler);

    setTimeout(function() {
        console.log('server process ended, restart the server if needed.');
        process.exit();
    }, 300000);
}