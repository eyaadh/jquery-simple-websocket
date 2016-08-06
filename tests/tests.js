describe('jQuery Deferred Web Socket', function() {
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


    it('sends json and receives xml msg from server.', function(done) {
        var simpleXmlWebSocket = $.simpleWebSocket({
            url: 'ws://127.0.0.1:3000/',
            attempts: 60, // default values
            timeout: 10000,
            dataType: 'json'
        });

        simpleXmlWebSocket.connect().done(function() {
            expect(simpleXmlWebSocket.isConnected()).toBe(true);

            simpleXmlWebSocket.listen(function(data) {
                try {
                    var domParser = new DOMParser();
                    var dom = domParser.parseFromString(data, "text/xml");
                    expect(true).toBe(true);
                } catch (e) {
                    expect(true).toBe(false); // test failure
                }
                done();
            });

            simpleXmlWebSocket.send({'cmd': 'xmlResponse', 'text': 'hello'});
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


    it('handles continues reconnecting listeners', function(done) {
        simpleWebSocket.listen(function(data) {
            console.log('listener');
            expect(data.text).toBe('hello');
            console.log(data);
            console.log('done');
            done();
        });

        simpleWebSocket.connect().done(function() {
            simpleWebSocket.close();

            simpleWebSocket.send({'text': 'hello'}).done(function() {
                console.log('data send');
            }).fail(function() {
                // will only get invoked when sending data fails
                expect(true).toBe(false); // test failure
            });
        });

    });


    it('handles multiple sockets', function(done) {
        var simpleCnt = 0;
        var anotherCnt = 0;

        simpleWebSocket.send({'cmd': 'spawnServer', 'port': 3010, 'delay': 0}).done(function() {
            var another = $.simpleWebSocket({ url: 'ws://127.0.0.1:3010/' });

            simpleWebSocket.listen(function(data) {
                simpleCnt++;
                expect(data.text).toBe('hello');
                expect(simpleCnt).toBe(1);
                expect(anotherCnt).toBe(1);
                console.log('done');
                another.close();
                done();
            });

            another.listen(function(data) {
               anotherCnt++;
               simpleWebSocket.send({'text': 'hello'}).fail(function() {
                    expect(true).toBe(false); // test failure
               });
            });

            another.send({'invoke simpleSocket': 'doit'});
        }).fail(function() {
            expect(true).toBe(false); // test failure
        });

    });

    it('is fluent', function(done) {
        simpleWebSocket.listen(function(data) {
           console.log(data);
        }).listen(function(data) {
            expect(data.text).toBe('hello');
            done();
        }).send({'text': 'hello'}).done(function() {
            console.log('data send');
        }).fail(function() {
            expect(true).toBe(false); // test failure
        });
    });

    it('removes listener', function(done) {
        var listener = function(data) {
           console.log(data);
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
        for (var i=0; i<10; i++) {
            simpleWebSocket.listen(function(data) {
               console.log(data);
               expect(true).toBe(false); // test failure
            }).done(function() {
               console.log('listener done');
               expect(true).toBe(true);
            });
        }

        simpleWebSocket.listen(function(data) {
           console.log(data);
           expect(true).toBe(false); // test failure
        }).done(function() {
           console.log('done');
           expect(true).toBe(true);
           done();
        });

        simpleWebSocket.connect().done(function() {
            simpleWebSocket.removeAll();
            console.log('listeners removed, send messages');
            simpleWebSocket.send({'msg': 'hello1'});
            simpleWebSocket.send({'msg': 'hello2'});
            simpleWebSocket.send({'msg': 'hello3'});
        });
    });

    it('reconnects', function(done) {

        simpleWebSocket.send({'cmd': 'spawnServer', 'port': 3001, 'delay': 15000}).done(function() {
            console.log('reconnect test');
            simpleWebSocket.close();

            delayedWebSocket = $.simpleWebSocket({ url: 'ws://127.0.0.1:3001/' });
            delayedWebSocket.connect().done(function() {
                console.log('gracefull connect');

                delayedWebSocket.listen(function(data) {
                    expect(data.msg).toBe('hello echo3');
                    done();
                });

                delayedWebSocket.send({'msg': 'hello echo3'}).fail(function() {
                    console.log('sending message failed');
                    expect(true).toBe(false); // test failure
                });

            }).fail(function() {
                console.log('reconnection failed');
                expect(true).toBe(false); // test failure
            })

        });


    });

});
