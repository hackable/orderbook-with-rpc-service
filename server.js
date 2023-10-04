'use strict';

const { PeerRPCServer } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');

const link = new Link({
    grape: 'http://127.0.0.1:30001'
});
link.start();

const peer = new PeerRPCServer(link, {
    timeout: 300000
});
peer.init();

const port = 1024 + Math.floor(Math.random() * 1000);
const service = peer.transport('server');
service.listen(port);

setInterval(function () {
    link.announce('rpc_test', service.port, {})
}, 1000);

let subscribedClients = [];

service.on('request', async (rid, key, payload, handler) => {
    console.log('payload', payload);
    console.log('key', key);

    switch (payload.action) {
        case 'addOrder':
            broadcastOrderToClients(payload);
            handler.reply(null, { message: 'Order received and broadcasted!' });
            break;
        case 'subscribe':
            subscribedClients.push({ rid, key, handler });
            handler.reply(null, { message: 'Subscribed successfully!' });
            break;
    }
});

function broadcastOrderToClients(order) {
    subscribedClients.forEach(client => {
        client.handler.reply(client.rid, client.key, { order: order });
    });
}
