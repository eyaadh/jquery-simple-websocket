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
            expect(true).toBe(false);
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
            expect(true).toBe(false);
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
                expect(true).toBe(false);
            });
        });

    });


    it('reconnects', function(done) {

        simpleWebSocket.send({'cmd': 'spawnServer'}).done(function() {
            console.log('reconnect test');
            simpleWebSocket.close();

            delayedWebSocket = $.simpleWebSocket({ url: 'ws://127.0.0.1:3001/' });
            delayedWebSocket.connect().done(function() {
                console.log('reconnected');

                delayedWebSocket.listen(function(data) {
                    expect(data.msg).toBe('hello echo3');
                    done();
                });

                delayedWebSocket.send({'msg': 'hello echo3'}).fail(function() {
                    expect(delayedWebSocket.isConnected()).toBe(true);
                });

            }).fail(function() {
                console.log('reconnection failed');
                expect(true).toBe(false);
            })

        });


    });

});
