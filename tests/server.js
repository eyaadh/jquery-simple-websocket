#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {});
server.listen(3000, function() { });

wsServer = new WebSocketServer({
    httpServer: server
});

var serverSpawned = false;
var port = 3001;
var echoRequestHandler = function(request) {

    var connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        console.log(message);
        if (message.utf8Data === '{"cmd":"spawnServer"}') {
            if (!serverSpawned) {
                console.log('delay server spawn 15s');
                setTimeout(function() {
                    spawnServer(port++);
                }, 15000);
                serverSpawned = true;
            }
        } else if (message.utf8Data === '{"cmd":"throw error"}') {
            throw new Error("error");
        }
        connection.send(message.utf8Data);
    });

    connection.on('close', function(connection) {
    });

}

// WebSocket server
wsServer.on('request', echoRequestHandler);

var spawnServer = function(port) {
    var server = http.createServer(function(request, response) {
    });
    server.listen(port, function() { });

    wsServer = new WebSocketServer({
        httpServer: server
    });

    wsServer.on('request', echoRequestHandler);
}