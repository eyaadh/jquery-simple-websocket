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
                expect(data.msg).toBe('hello echo1');
                done();
            }).fail(function() {
                expect(true).toBe(false);
                done();
            })

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
        }).fail(function() {
            expect(true).toBe(false);
            done();
        });

        simpleWebSocket.send({'msg': 'hello echo2'}).fail(function() {
            expect(simpleWebSocket.isConnected()).toBe(true);
        });
    });


    it('handles listener errors', function(done) {
        simpleWebSocket.listen(function(data) {
            expect(true).toBe(true);
            console.log(data);
            throw new Error('listener error');
        }).fail(function() {
            console.log('fail');
            expect(true).toBe(true);
            done();
        });

        simpleWebSocket.send({'text': 'hello'}).done(function() {
            console.log('data send');
        }).fail(function() {
            // will only get invoked when sending data fails
            expect(true).toBe(false);
        });
    });


    it('reconnects', function(done) {

        simpleWebSocket.connect().done(function() {
            expect(simpleWebSocket.isConnected()).toBe(true);

            simpleWebSocket.send({'cmd': 'spawnServer'}).done(function() {
                console.log('reconnect test');
                simpleWebSocket.close();

                delayedWebSocket = $.simpleWebSocket({ url: 'ws://127.0.0.1:3001/' });
                delayedWebSocket.connect().done(function() {
                    console.log('reconnected');

                    delayedWebSocket.listen(function(data) {
                        expect(data.msg).toBe('hello echo3');
                        done();
                    }).fail(function() {
                        expect(true).toBe(false);
                        done();
                    })

                    delayedWebSocket.send({'msg': 'hello echo3'}).fail(function() {
                        expect(delayedWebSocket.isConnected()).toBe(true);
                    });

                }).fail(function() {
                    console.log('reconnection failed');
                    expect(true).toBe(false);
                })

            });
        }).fail(function(e) {
            expect(true).toBe(false);
            done();
        });

    });


    it('closes listeners due to exception', function(done) {
        console.log('handles errors');
        simpleWebSocket.listen(function(data) {
            expect(true).toBe(false);
            console.log(data);
        }).done(function() {
            console.log('connection closed');
            expect(true).toBe(true);
            expect(simpleWebSocket.isConnected()).toBe(false);
            done();
        });

        simpleWebSocket.send({'cmd': 'throw error'}).done(function() {
            console.log('data send');
            expect(true).toBe(true);
        });
    });

});
