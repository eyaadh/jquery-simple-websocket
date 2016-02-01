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
                throw new Error('Error, websocket could not be initialized.');
            }

            $(ws).bind('open', opt.open)
            .bind('close', opt.close)
            .bind('message', function(e) {
                var json = $.evalJSON(e.originalEvent.data);
                if (opt[e.type]) {
                    opt[e.type].call(this, json);
                }
            }).bind('error', function(e) {
                if (opt.error) {
                    opt.error.call(this, e);
                }
            });
            return ws;
         };

         var _connect = function() {
             var attempt = jQuery.Deferred();
             if (_ws) {
                 if (_ws.readyState === 1) {
                     attempt.resolve(_ws);
                     return attempt.promise();
                 } else {
                     // close previous socket
                     _ws.close();
                 }
             }

            _ws = _webSocket($.extend(_opt, {
                open: function(e) {
                    var sock = this;
                    if (attempt) {
                        attempt.resolve(sock);
                    }
                },
                close: function(e) {
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
                        } catch (error) {
                            _listeners[i].deferred.reject(error);
                        }
                    }
                },
                error: function(e) {
                    if (attempt) {
                        attempt.rejectWith(e);
                    }
                }
            }));

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
             if (!_reConnectDeferred || _reConnectDeferred.state() !== 'pending') {
                 _reConnectTries = _prop(_opt, 'attempts', 60); // default 10min
                 _reConnectDeferred = jQuery.Deferred();
             }

             if (_ws && _ws.readyState === 1) {
                 _reConnectDeferred.resolve(_ws);
             } else {
                 _connect().done(function() {
                    _reConnectDeferred.resolve(_ws);
                 }).fail(function() {
                    if (_reConnectTries-- > 0) {
                       window.setTimeout(function() {
                           _reConnect();
                       }, _prop(_opt, 'timeout', 10000));
                    } else {
                       _reConnectDeferred.rejectWith();
                    }
                 });
             }

             return _reConnectDeferred.promise();
         }

         var _send = function(data) {
             var attempt = jQuery.Deferred();

             (function(json, simpleWebSocket) {
                 _reConnect().done(function(_ws) {
                     _ws.send(json);
                     attempt.resolve(simpleWebSocket);
                 }).fail(function() {
                     attempt.rejectWith();
                 });
             })(JSON.stringify(data), api);

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

         var _prop = function(obj, property, defaultValue) {
             if (_isNotEmpty(obj, property)) {
                return obj[property];
             }
            return defaultValue;
         }

         var _init = function(opt) {
            if (_isNotEmpty(opt, 'url')) {
                _opt = opt;
            } else {
                throw new Error("Missing argument, example usage: $.simpleWebSocket({ url: 'ws://127.0.0.1:3000' }); ");
            }
         };

         var _listen = function(listener) {
            var d = jQuery.Deferred();

            _reConnect().done(function() {
                if (_indexOfListener(listener) !== -1) {
                    d.reject(new Error('Listener already listening.'));
                } else {
                    d.progress(function() {
                        listener.apply(this, arguments);
                    });
                    _listeners.push({ 'deferred': d, 'listener': listener });
                }
            }).fail(function(e) {
                d.reject(e);
            });

            return d.promise();
         }

         var api = {

             init: function(opt) {
                _init(opt);
                return api;
             },

             connect: function() {
               return $.extend(api, _reConnect());
             },

             isConnected: function(callback) {
                if (callback) {
                    callback.apply(this, [_isConnected()]);
                    return api;
                } else {
                    return _isConnected();
                }
             },

             send: function(data) {
                return $.extend(api, _send(data));
             },

             listen: function(listener) {
                return $.extend(api, _listen(listener));
             },

             remove: function(listener) {
                var index = _indexOfListener(listener);
                if (index !== -1) {
                    _listeners[i].deferred.resolve();
                    _listeners.splice(index, 1);
                }
                return api;
             },

             close: function() {
                _close();
                return api;
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
