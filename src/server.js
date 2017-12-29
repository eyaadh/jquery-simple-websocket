#!/usr/bin/env node
var window = {};
var WebSocketServer = require('websocket').server;
var http = require('http');

var requestHandler = function(request) {

    var connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        // console.log('\nNODEJS: server message received');
        // console.log(arguments);

        var type = 'text';
        var data;
        try {
            data = JSON.parse(message.utf8Data);
            type = 'json';
        } catch (e) {
            data = message.utf8Data;
            type = 'xml'; // or text
        }

        if (type === 'json') {
            if (data.cmd === 'spawnServer') {
                var delay = Number(data.delay);

                // console.log('\nNODEJS: delay server spawn '+delay);
                setTimeout(function() {
                    spawnServer(data.port);
                }, delay);
            } else if (data.cmd === 'throwError') {
                throw new Error("error");
            } else {
                connection.send(message.utf8Data);
            }
        } else {
            connection.send(message.utf8Data);
        }
    });

    connection.on('close', function(connection) {
    });

};

var spawnServer = function(port) {
    // console.log('\nNODEJS: spawn server on port '+port);
    var server = http.createServer(function(request, response) {
    });
    server.listen(port, function() { });

    wsServer = new WebSocketServer({
        httpServer: server
    });

    wsServer.on('request', requestHandler);
};

spawnServer(3000);
