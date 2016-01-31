/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
(function($){
    var SimpleWebSocket = (function() {
         var _opt;
         var _ws;
         var _reconnectTries;
         var _reConnectDeferred = null;
         var _listeners = [];

         var _webSocket = function(opt) {
             var ws;
             if (opt.protocols) {
                 ws = window['MozWebSocket'] ? new MozWebSocket(opt.url, opt.protocols) : window['WebSocket'] ? new WebSocket(opt.url, opt.protocols) : null;
             } else {
                 ws = window['MozWebSocket'] ? new MozWebSocket(opt.url) : window['WebSocket'] ? new WebSocket(opt.url) : null;
             }

             if (!ws) {
                 return null;
             }

             $(ws).bind('open', opt.open)
             .bind('close', opt.close)
             .bind('message', function(e) {
                var json = $.evalJSON(e.originalEvent.data);
                if (opt[e.type]) {
                    opt[e.type].call(this, json);
                }
             });
             ws.onerror = function(e) { // cross-browser
                 if (opt.error) {
                     opt.error.call(this, e);
                 }
             };

             return ws;
         };

         var _connect = function() {
             console.log('connection attempt');
             var attempt = jQuery.Deferred();
             if (_ws) {
                 if (_ws.readyState === 1) {
                     console.log('connected');
                     attempt.resolve(_ws);
                     return attempt.promise();
                 } else {
                     // close previous socket
                     _ws.close();
                 }
             }

            _ws = _webSocket({
                'url': _opt.url,
                open: function(e) {
                    console.log('socket open');
                    var sock = this;
                    if (attempt) {
                        attempt.resolve(sock);
                    }
                },
                close: function(e) {
                    console.log('close');
                    for (var i=0, len=_listeners.length; i<len; i++) {
                        _listeners[i].deferred.resolve();
                    }

                    if (attempt) {
                        attempt.rejectWith(e);
                    }
                },
                message: function(message) {
                    for (var i=0, len=_listeners.length; i<len; i++) {
                        try {
                            _listeners[i].deferred.notify(message);
                            _listeners[i].listener.apply(this, [message]);
                        } catch (error) {
                            _listeners[i].deferred.reject(error);
                        }
                    }
                },
                error: function(e) {
                    console.log('error');
                    console.log(e);
                    if (attempt) {
                        attempt.rejectWith(e);
                    }
                }
            });

             return attempt.promise();
         };

         var _close = function() {
            if (_ws) {
                _ws.close();
                _ws = null;
                _reConnectDeferred = null;
            }
         };

         var _isConnected = function() {
             return _ws !== null && _ws.readyState === 1;
         }

         var _reConnect = function() {
             console.log('reconnect');
             if (!_reConnectDeferred || _reConnectDeferred.state() !== 'pending') {
                 _reConnectTries = 60; // 10min
                 _reConnectDeferred = jQuery.Deferred();
             }

             if (_ws && _ws.readyState === 1) {
                 console.log('reconnected');
                 _reConnectDeferred.resolve(_ws);
             } else {
                 _connect().done(function() {
                     console.log('reconnected');
                    _reConnectDeferred.resolve(_ws);
                 }).fail(function() {
                    console.log('reconnect retry: '+_reConnectTries);
                    if (_reConnectTries-- > 0) {
                       window.setTimeout(function() {
                           _reConnect();
                       }, 10000);
                    } else {
                       console.log('reconnect failed');
                       _reConnectDeferred.rejectWith();
                    }
                 });
             }

             return _reConnectDeferred.promise();
         }

         var _send = function(data) {
             var attempt = jQuery.Deferred();
             if (!_isConnected()) {
                 (function(json) {
                     _reConnect().done(function(ws) {
                         ws.send(json);
                         attempt.resolve();
                     }).fail(function() {
                         attempt.rejectWith();
                     });
                 })(JSON.stringify(data));
             } else {
                 _ws.send(JSON.stringify(data));
                 attempt.resolve();
             }
             return attempt.promise();
         };

         var _indexOfListener = function(listener) {
            for (var i=0, len=_listeners.length; i<len; i++) {
                if (_listeners[i].listener === listener) {
                    return i;
                }
            }
            return -1;
         };

         var _isNotEmpty = function(obj, property) {
            return typeof obj !== 'undefined' &&
                    obj !== null &&
                    typeof property !== 'undefined' &&
                    property !== null &&
                    property !== '' &&
                    typeof obj[property] !== 'undefined' &&
                    obj[property] !== null &&
                    obj[property] !== '';
         }

         var _init = function(opt) {
            // TODO add reconnect timeout options
            if (opt !== null && _isNotEmpty(opt, 'url')) {
                _opt = opt;
            } else {
                console.log('error');
                throw new Error("Missing argument, example usage: $.simpleWebSocket({ url: 'ws://127.0.0.1:3000' }); ");
            }
         };

         var api = {

             init: function(opt) {
                _init(opt);
             },

             connect: function() {
               return _reConnect();
             },

             isConnected: function() {
                return _isConnected();
             },

             send: function(data) {
                return _send(data);
             },

             listen: function(listener) {
                var d = jQuery.Deferred();
                if (_indexOfListener(listener) !== -1) {
                    d.reject(new Error('Listener already listening.'));
                } else {
                    var d = jQuery.Deferred();
                    d.progress(function() {
                        // TODO remove or figure why progress isn't invoked
                        console.log('progress');
                        console.log(arguments);
                        // listener.apply(this, arguments);
                    });
                    _listeners.push({ 'deferred': d, 'listener': listener });
                }
                return d.promise();
             },

             remove: function(listener) {
                var index = _indexOfListener(listener);
                if (index !== -1) {
                    _listeners[i].deferred.resolve();
                    _listeners.splice(index, 1);
                }
             },

             close: function() {
                  _close();
             }
         };
         return api;
     })();

    $.extend({
        simpleWebSocket: function(opt) {
            SimpleWebSocket.init(opt);
            return SimpleWebSocket;
        }
    });
})(jQuery);
