const { Mutex } = require('async-mutex');

class OrderBook {
    constructor() {
        // Using objects to manage bids and asks for each asset
        this.bids = {}; // descending order
        this.asks = {}; // ascending order
        this.filledOrders = [];
        this.mutex = new Mutex();
    }

    initAsset(asset) {
        if (!this.bids[asset]) this.bids[asset] = [];
        if (!this.asks[asset]) this.asks[asset] = [];
    }

    async addOrder(order) {
      const release = await this.mutex.acquire();
      try {
        this.initAsset(order.asset);

        if (order.orderType === 'market') {
            this.matchMarketOrder(order);
        } else {
            const bookSide = order.type === 'buy' ? this.bids[order.asset] : this.asks[order.asset];
            const comparator = order.type === 'buy'
                ? (a, b) => b.price - a.price
                : (a, b) => a.price - b.price;

            // Insert order
            let inserted = false;
            for (let i = 0; i < bookSide.length; i++) {
                if (comparator(order, bookSide[i]) <= 0) {
                    bookSide.splice(i, 0, order);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) bookSide.push(order);

            this.matchLimitOrders(order.asset);
        }

      } finally {
          release();
      }

    }

    matchLimitOrders(asset) {
        while (this.bids[asset].length > 0 && this.asks[asset].length > 0) {
            const topBid = this.bids[asset][0];
            const topAsk = this.asks[asset][0];

            // No match
            if (topBid.price < topAsk.price) break;

            const matchedVolume = Math.min(topBid.volume, topAsk.volume);
            this.recordMatchedOrder(topBid.clientId, topAsk.clientId, asset, topAsk.price, matchedVolume);

            topBid.volume -= matchedVolume;
            topAsk.volume -= matchedVolume;

            if (topBid.volume <= 0) this.bids[asset].shift();
            if (topAsk.volume <= 0) this.asks[asset].shift();
        }
    }

    matchMarketOrder(order) {
        const asset = order.asset;
        this.initAsset(asset);

        if (order.type === 'buy') {
            while (order.volume > 0 && this.asks[asset].length > 0) {
                const topAsk = this.asks[asset][0];
                const matchedVolume = Math.min(order.volume, topAsk.volume);

                this.recordMatchedOrder(order.clientId, topAsk.clientId, asset, topAsk.price, matchedVolume);

                order.volume -= matchedVolume;
                topAsk.volume -= matchedVolume;

                if (topAsk.volume <= 0) this.asks[asset].shift();
            }
        } else if (order.type === 'sell') {
            while (order.volume > 0 && this.bids[asset].length > 0) {
                const topBid = this.bids[asset][0];
                const matchedVolume = Math.min(order.volume, topBid.volume);

                this.recordMatchedOrder(topBid.clientId, order.clientId, asset, topBid.price, matchedVolume);

                order.volume -= matchedVolume;
                topBid.volume -= matchedVolume;

                if (topBid.volume <= 0) this.bids[asset].shift();
            }
        }
    }

    recordMatchedOrder(buyer, seller, asset, price, volume) {
        this.filledOrders.push({
            asset,
            buyer,
            seller,
            price,
            volume,
            timestamp: new Date().toISOString()
        });
    }

    getState(asset) {
        this.initAsset(asset);
        return {
            asset,
            bids: this.bids[asset],
            asks: this.asks[asset],
            filledOrders: this.filledOrders.filter(order => order.asset === asset)
        };
    }

    getStateForAllAssets() {
        const state = {};

        for (let asset in this.bids) {
            state[asset] = {
                bids: this.bids[asset],
                asks: this.asks[asset],
                filledOrders: this.filledOrders.filter(order => order.asset === asset)
            };
        }

        return state;
    }


}

module.exports = OrderBook;
