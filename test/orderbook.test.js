const OrderBook = require('../libs/orderbook'); // Adjust the path accordingly

describe('Order Tests', () => {

    let orderbook;

    beforeEach(() => {
        orderbook = new OrderBook();
    });

    test('should initialize empty bids and asks', () => {
        const state = orderbook.getStateForAllAssets();
        expect(state).toEqual({});
    });

    test('should add a bid order correctly', async () => {
        await orderbook.addOrder({
            clientId: '1',
            asset: 'BTC/USD',
            type: 'buy',
            orderType: 'limit',
            price: 1000,
            volume: 1
        });

        const state = orderbook.getState('BTC/USD');
        expect(state.bids[0]).toEqual({
            clientId: '1',
            asset: 'BTC/USD',
            type: 'buy',
            orderType: 'limit',
            price: 1000,
            volume: 1
        });
        expect(state.asks.length).toBe(0);
    });

    test('should add an ask order correctly', async () => {
        await orderbook.addOrder({
            clientId: '2',
            asset: 'BTC/USD',
            type: 'sell',
            orderType: 'limit',
            price: 2000,
            volume: 1
        });

        const state = orderbook.getState('BTC/USD');
        expect(state.asks[0]).toEqual({
            clientId: '2',
            asset: 'BTC/USD',
            type: 'sell',
            orderType: 'limit',
            price: 2000,
            volume: 1
        });
        expect(state.bids.length).toBe(0);
    });

    test('should match limit orders correctly', async () => {
        await orderbook.addOrder({
            clientId: '1',
            asset: 'BTC/USD',
            type: 'buy',
            orderType: 'limit',
            price: 1000,
            volume: 1
        });

        await orderbook.addOrder({
            clientId: '2',
            asset: 'BTC/USD',
            type: 'sell',
            orderType: 'limit',
            price: 1000,
            volume: 1
        });

        const state = orderbook.getState('BTC/USD');
        expect(state.bids.length).toBe(0);
        expect(state.asks.length).toBe(0);
        expect(state.filledOrders.length).toBe(1);
        expect(state.filledOrders[0]).toEqual(expect.objectContaining({
            buyer: '1',
            seller: '2',
            asset: 'BTC/USD',
            price: 1000,
            volume: 1
        }));
    });


    test('should match a market buy order with an existing limit sell order', async () => {
        await orderbook.addOrder({
            clientId: '1',
            asset: 'BTC/USD',
            type: 'sell',
            orderType: 'limit',
            price: 1000,
            volume: 1
        });

        await orderbook.addOrder({
            clientId: '2',
            asset: 'BTC/USD',
            type: 'buy',
            orderType: 'market',
            volume: 1
        });

        const state = orderbook.getState('BTC/USD');
        expect(state.bids.length).toBe(0);
        expect(state.asks.length).toBe(0);
        expect(state.filledOrders.length).toBe(1);
        expect(state.filledOrders[0]).toEqual(expect.objectContaining({
            buyer: '2',
            seller: '1',
            asset: 'BTC/USD',
            price: 1000,
            volume: 1
        }));
    });


    test('should partially match a buy order with an existing sell order', async () => {
        await orderbook.addOrder({
            clientId: '1',
            asset: 'BTC/USD',
            type: 'sell',
            orderType: 'limit',
            price: 1000,
            volume: 2
        });

        await orderbook.addOrder({
            clientId: '2',
            asset: 'BTC/USD',
            type: 'buy',
            orderType: 'limit',
            price: 1000,
            volume: 1
        });

        const state = orderbook.getState('BTC/USD');
        expect(state.bids.length).toBe(0);
        expect(state.asks[0].volume).toBe(1); // 1 remaining from the original 2
        expect(state.filledOrders.length).toBe(1);
        expect(state.filledOrders[0]).toEqual(expect.objectContaining({
            buyer: '2',
            seller: '1',
            asset: 'BTC/USD',
            price: 1000,
            volume: 1
        }));
    });


});
