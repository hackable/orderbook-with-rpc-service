'use strict'

const { PeerRPCClient } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');

const link = new Link({
    grape: 'http://127.0.0.1:30001'
});
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

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

for (let i = 0; i < 10; i++) { // Simulates 10 requests
    const payload = randomOrder();

    peer.request('rpc_test', payload, { timeout: 10000 }, (err, data) => {
        if (err) {
            console.error(err);
            process.exit(-1);
        } else {
            console.log(data);
        }
    });
}



// Wait some time for the orders to be processed, then fetch state for each asset.
setTimeout(() => {
    const assets = ['BTC/USD', 'ETH/USD', 'LTC/USD'];
    assets.forEach((asset) => {
        peer.request('rpc_test', { action: 'getState', asset: asset }, { timeout: 10000 }, (err, data) => {
            if (err) {
                console.error(err);
                process.exit(-1);
            } else {
                console.log(`State for ${asset}:`, JSON.stringify(data));
            }
        });
    });
}, 5000); // 5 seconds delay to allow order additions to complete



// After fetching the state for each asset, fetch state for all assets.
setTimeout(() => {
    peer.request('rpc_test', { action: 'getStateForAllAssets' }, { timeout: 10000 }, (err, data) => {
        if (err) {
            console.error(err);
            process.exit(-1);
        } else {
            console.log("State for all assets:", JSON.stringify(data));
        }
    });
}, 5000); // 5 seconds delay to allow previous requests to complete.
