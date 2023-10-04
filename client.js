'use strict';

const { PeerRPCClient } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const OrderBook = require('./libs/orderbook'); // Assuming you have an orderbook library

const link = new Link({
    grape: 'http://127.0.0.1:30001'
});
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

const orderbook = new OrderBook();


// Subscribing to updates
peer.request('rpc_test', { action: 'subscribe' }, { timeout: 10000 }, (err, data) => {
    if (err) {
        console.error(err);
    } else {
        console.log(data);

        // Simulates sending orders
        for (let i = 0; i < 10; i++) {
            const payload = randomOrder();
            orderbook.addOrder(payload);
            peer.request('rpc_test', payload, { timeout: 10000 }, (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(data);
                }
            });
        }
    }
});

function randomOrder() {
    const types = ['buy', 'sell'];
    const orderTypes = ['limit', 'market'];
    const assets = ['BTC/USD', 'ETH/USD', 'LTC/USD'];

    return {
        action: 'addOrder',
        clientId: `${Math.floor(Math.random() * 1000)}`, // Generates a random clientId
        asset: assets[Math.floor(Math.random() * assets.length)],
        type: types[Math.floor(Math.random() * types.length)],
        orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
        price: 500 + Math.floor(Math.random() * 5000), // Random price between 500 and 5500
        volume: 1 + Math.floor(Math.random() * 10) // Random volume between 1 and 10
    };
}


// Listen for updates
peer.on('data', (data) => {
    console.log('Update received:', data);
    if (data && data.order) {
        // Assuming addOrder is a method of your orderbook that adds an order
        orderbook.addOrder(data.order);
    }
});


// Get state for a specific asset
function getState(asset) {
    // Note: Ensure that your orderbook class has a method getState
    const state = orderbook.getState(asset);
    console.log(`State for ${asset}:`, state);
}

// Get state for all assets
function getStateForAllAssets() {
    // Note: Ensure that your orderbook class has a method getStateForAllAssets
    const allStates = orderbook.getStateForAllAssets();
    console.log("State for all assets:", allStates);
}

// Example usage:
setInterval(() => {
    getState('BTC/USD');  // Example asset
    getStateForAllAssets();
}, 5000);
