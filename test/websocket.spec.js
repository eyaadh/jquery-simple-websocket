describe('jQuery Deferred Web Socket Spec', function() {
    var simpleWebSocket;

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000; // 1min

    beforeEach(function() {
        simpleWebSocket = $.simpleWebSocket({
            url: 'ws://127.0.0.1:3000/',
            attempts: 60, // default values
            timeout: 10000
        });
    });

    afterEach(function() {
        simpleWebSocket.removeAll();
        simpleWebSocket.close();
    });

    it('connects to nodejs server', function(done) {
        simpleWebSocket.connect().done(function() {
            expect(simpleWebSocket.isConnected()).toBe(true);
            done();
        }).fail(function(e) {
            expect(true).toBe(false); // test failure
            done();
        });
    });


    it('receives echo msg from server', function(done) {
        simpleWebSocket.connect().done(function() {
            expect(simpleWebSocket.isConnected()).toBe(true);

            simpleWebSocket.listen(function(data) {
                expect(data.msg).toBe('hello echo1');
                done();
            });

            simpleWebSocket.send({'msg': 'hello echo1'});

        }).fail(function(e) {
            expect(true).toBe(false); // test failure
            done();
        });
    });


    it('sends xml and receives xml echo from server.', function(done) {
        var simpleXmlWebSocket = $.simpleWebSocket({
            url: 'ws://127.0.0.1:3000/',
            attempts: 60, // default values
            timeout: 10000,
            dataType: 'xml'
        });

        simpleXmlWebSocket.connect().done(function() {
            expect(simpleXmlWebSocket.isConnected()).toBe(true);

            simpleXmlWebSocket.listen(function(data) {
                try {
                    var xmlText = new XMLSerializer().serializeToString(data);
                    expect(data.getElementById('test').textContent).toBe('hello');
                } catch (e) {
                    expect(true).toBe(false); // test failure
                }
                done();
            });

            simpleXmlWebSocket.send('<xml><message id="test">hello</message></xml>');
        }).fail(function(e) {
            expect(true).toBe(false); // test failure
            done();
        });

    });


    it('sends text data and receives echo text data.', function(done) {
        var simpleXmlWebSocket = $.simpleWebSocket({
            url: 'ws://127.0.0.1:3000/',
            attempts: 60, // default values
            timeout: 10000,
            dataType: 'text'
        });

        simpleXmlWebSocket.connect().done(function() {
            expect(simpleXmlWebSocket.isConnected()).toBe(true);

            simpleXmlWebSocket.listen(function(data) {
                expect(data).toBe('text: hello');
                done();
            });

            simpleXmlWebSocket.send('text: hello');
        }).fail(function(e) {
            expect(true).toBe(false); // test failure
            done();
        });

    });


    it('connects automatically, receiving echo msg', function(done) {
        simpleWebSocket.listen(function(data) {
            expect(data.msg).toBe('hello echo2');
            done();
        });

        simpleWebSocket.send({'msg': 'hello echo2'});
    });


    it('handles continued reconnecting listeners', function(done) {
        simpleWebSocket.listen(function(data) {
            expect(data.text).toBe('hello');
            done();
        });

        simpleWebSocket.connect().done(function() {
            simpleWebSocket.send({'text': 'hello'}).done(function() {
                // nothing
            }).fail(function() {
                // will only get invoked when sending data fails
                expect(true).toBe(false); // test failure
            });
        });

    });


    it('handles multiple sockets', function(done) {

        simpleWebSocket.send({'cmd': 'spawnServer', 'port': 3010, 'delay': 500}).done(function() {
            var socket3010 = $.simpleWebSocket({ url: 'ws://127.0.0.1:3010/' });

            simpleWebSocket.listen(function(data) {
                expect(data.text).toBe('hello from 3010');
                socket3010.close();
                done();
            });

            socket3010.listen(function(data) {
               simpleWebSocket.send({'text': 'hello from 3010'}).fail(function() {
                    expect(true).toBe(false); // test failure
               });
            });

            socket3010.send({'doit': 'invoke simpleSocket'});
        }).fail(function() {
            expect(true).toBe(false); // test failure
        });
    });

    it('is fluent', function(done) {
        simpleWebSocket.listen(function(data) {
           // nothing
        }).listen(function(data) {
            expect(data.text).toBe('hello');
            done();
        }).send({'text': 'hello'}).done(function() {
            // nothing
        }).fail(function() {
            expect(true).toBe(false); // test failure
        });
    });

    it('removes listener', function(done) {
        var listener = function(data) {
           expect(true).toBe(false); // test failure
        };

        simpleWebSocket.listen(listener).done(function() {
            expect(true).toBe(true);
            done();
        });

        simpleWebSocket.connect().done(function() {
            simpleWebSocket.remove(listener);

            simpleWebSocket.send({'msg': 'hello'});
            simpleWebSocket.send({'msg': 'hello2'});
            simpleWebSocket.send({'msg': 'hello3'});
        });
    });


    it('removes all listeners', function(done) {
        simpleWebSocket.listen(function(data) {
            expect(true).toBe(false); // test failure
        }).done(function() {
            expect(true).toBe(true);
        });

        simpleWebSocket.listen(function(data) {
            expect(true).toBe(false); // test failure
        }).done(function() {
            expect(true).toBe(true);
        });

        simpleWebSocket.listen(function(data) {
            expect(true).toBe(false); // test failure
        }).done(function() {
            expect(true).toBe(true);
        });


        simpleWebSocket.listen(function(data) {
           expect(true).toBe(false); // test failure
        }).done(function() {
           expect(true).toBe(true);
           done();
        });

        simpleWebSocket.connect().done(function() {
            simpleWebSocket.removeAll();
            simpleWebSocket.send({'msg': 'hello1'});
            simpleWebSocket.send({'msg': 'hello2'});
            simpleWebSocket.send({'msg': 'hello3'});
        });
    });

    it('reconnects', function(done) {

        simpleWebSocket.send({'cmd': 'spawnServer', 'port': 3001, 'delay': 500}).done(function() {
            simpleWebSocket.close();

            var delayedWebSocket = $.simpleWebSocket({ url: 'ws://127.0.0.1:3001/' });
            delayedWebSocket.connect().done(function() {
                delayedWebSocket.listen(function(data) {
                    expect(data.msg).toBe('hello echo3');
                    done();
                });

                delayedWebSocket.send({'msg': 'hello echo3'}).fail(function() {
                    expect(true).toBe(false); // test failure
                });

            }).fail(function() {
                expect(true).toBe(false); // test failure
            });

        });


    });

    it('reconnects after timeout', function(done) {

        simpleWebSocket.send({'cmd': 'spawnServer', 'port': 3020, 'delay': 5000}).done(function() {
            simpleWebSocket.close();

            var socket = $.simpleWebSocket({ url: 'ws://127.0.0.1:3020/',
                                                   timeout: 1000,
                                                   attempts: 4 });
            socket.connect().done(function() {
                expect(true).toBe(false);
            }).fail(function() {
                expect(true).toBe(true); // expected timeout

                socket.close();

                socket.connect().done(function() {
                     expect(true).toBe(true); // expect succeeding timeout
                     done();
                }).fail(function() {
                    expect(true).toBe(false);
                });
            });

        });

    });


    it('listens infinitely', function(done) {

        simpleWebSocket.send({'cmd': 'spawnServer', 'port': 3030, 'delay': 5000}).done(function() {
            simpleWebSocket.close();

            var socket = $.simpleWebSocket({ url: 'ws://127.0.0.1:3030/',
                                                   timeout: 1000,
                                                   attempts: 4 });
            socket.listen(function(data) {
               expect(data.text).toBe('hear message after timeout');
               done();
            });

            socket.send({'text': 'should not hear this'}).done(function() {
                expect(true).toBe(false);
            }).fail(function() {
                expect(true).toBe(true); // expected timeout

                socket.send({'text': 'hear message after timeout'});
            });

        });

    });

});
