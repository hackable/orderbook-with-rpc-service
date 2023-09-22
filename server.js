'use strict'

const { PeerRPCServer }  = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const OrderBook = require('./libs/orderbook');

const orderbook = new OrderBook();


const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {
  timeout: 300000
})
peer.init()

const port = 1024 + Math.floor(Math.random() * 1000)
const service = peer.transport('server')
service.listen(port)

setInterval(function () {
  link.announce('rpc_test', service.port, {})
}, 1000)


service.on('request', async (rid, key, payload, handler) => {
    console.log('payload', payload); // e.g., { action: 'addOrder', clientId: '...', type: '...', ... }
    console.log('key', key);

    switch (payload.action) {
        case 'addOrder':
            try {
                await orderbook.addOrder({
                    clientId: payload.clientId,
                    asset: payload.asset,
                    type: payload.type,
                    orderType: payload.orderType,
                    price: payload.price,
                    volume: payload.volume
                });
                handler.reply(null, { message: 'Order added successfully!' });
            } catch (error) {
                handler.reply(new Error('Failed to add order'), null);
            }
            break;

        case 'getState':
            if (!payload.asset) {
                handler.reply(new Error('Asset not provided for getState'), null);
                return;
            }
            const state = orderbook.getState(payload.asset);
            handler.reply(null, { state: state });
            break;

        case 'getStateForAllAssets':
            const allStates = orderbook.getStateForAllAssets();
            handler.reply(null, { allStates: allStates });
            break;

        default:
            handler.reply(new Error('Invalid action'), null);
    }
});
