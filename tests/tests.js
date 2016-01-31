describe('jQuery Simple Web Socket', function() {
    var simpleWebSocket;

    beforeEach(function() {
        simpleWebSocket = $.simpleWebSocket({ url: 'ws://127.0.0.1:3000/' });
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

});
