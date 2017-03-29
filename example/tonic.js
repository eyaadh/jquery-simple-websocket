#!/usr/bin/env node
// Load jsdom, create a window and node.js jQuery wrapper
var jsdom = require("jsdom");
window = jsdom.jsdom().defaultView;
jQuery = $ = require("jquery")(window);
require("jquery-simple-websocket");

/*
var webSocket = $.simpleWebSocket({ url: 'wss://echo.websocket.org' });
webSocket.listen(function(message) {
    console.log(message.text);
});
webSocket.send({ 'text': 'hello echo' });
*/