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
                expect(data.msg).toBe('hello echo');
                done();
            }).fail(function() {
                expect(true).toBe(false);
                done();
            });
            simpleWebSocket.send({'msg': 'hello echo'});


        }).fail(function(e) {
            expect(true).toBe(false);
            done();
        });
    });


    it('connects automatically, receiving echo msg', function(done) {
        simpleWebSocket.listen(function(data) {
            expect(data.msg).toBe('hello echo');
            done();
        }).fail(function() {
            expect(true).toBe(false);
            done();
        });

        simpleWebSocket.send({'msg': 'hello echo'}).fail(function() {
            expect(simpleWebSocket.isConnected()).toBe(true);
        });
    });


    // last test, ends server process
    it('reconnects', function(done) {

        simpleWebSocket.connect().done(function() {
            expect(simpleWebSocket.isConnected()).toBe(true);

            simpleWebSocket.send({'cmd': 'spawnFiveMinServer'}).done(function() {
                console.log('reconnect test');
                simpleWebSocket.close();
                delayedWebSocket = $.simpleWebSocket({ url: 'ws://127.0.0.1:3001/' });

                delayedWebSocket.connect().done(function() {
                    console.log('reconnected');
                }).fail(function() {
                    console.log('reconnection failed');
                    expect(true).toBe(false);
                });

                delayedWebSocket.listen(function(data) {
                    expect(data.msg).toBe('hello echo');
                    done();
                }).fail(function() {
                    expect(true).toBe(false);
                    done();
                });

                delayedWebSocket.send({'msg': 'hello echo'}).fail(function() {
                    expect(delayedWebSocket.isConnected()).toBe(true);
                });
            });
        }).fail(function(e) {
            expect(true).toBe(false);
            done();
        });

    });

});
