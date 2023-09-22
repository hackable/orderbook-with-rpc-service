# OrderBook with RPC Service

This project showcases a simple OrderBook implementation along with an RPC server and client using the Grenache Node.js HTTP transport. It allows users to add orders to the OrderBook, query the state for specific assets, and get the state of all assets.

## Installation

First, ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

**Clone the repository:**
```bash
git clone [repository_url]
cd [repository_directory]
```

Install the required packages:
```bash
npm install
```


# boot two grape servers
```bash
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

## Testing
We utilize Jest for unit testing. To run the tests:
```bash
npm test
```
##Running the RPC Server
To initiate the RPC server, execute:
```bash
node server.js
```
This action starts the server, allowing it to announce itself in the Grape Bittorrent network. The server then awaits incoming RPC requests to perform actions on the OrderBook.


###Running the RPC Client
Once the server is operational, you can launch the RPC client:

``` bash
node client.js
```

# OrderBook with RPC Service

This client script showcases how to add random orders to the OrderBook, query the state for specific assets, and retrieve the state of all assets.

## Implementation Overview

- **OrderBook**: A class that maintains buy and sell orders. It supports both limit and market orders and facilitates partial order matching.

- **RPC Server**: Uses the Grenache Node.js HTTP transport to await incoming RPC requests. The server can process `addOrder`, `getState`, and `getStateForAllAssets` commands on the OrderBook.

- **RPC Client**: Demonstrates the interaction process with the RPC server by sending random order requests and extracting the OrderBook's state.

## Architecture Decisions

- **Order Matching**: Orders in the OrderBook match based on price for limit orders. Market orders are paired with the best available counterpart.

- **Concurrency**: The async/await pattern mitigates potential race conditions. For heightened concurrency or rigorous operations, consider a more advanced concurrency mechanism or a transaction-supporting database.We use async-mutex to ensure that the OrderBook doesn't face race conditions when multiple orders are being added simultaneously.

## Testing

Jest serves as our testing framework. Tests are designed for order additions, state retrievals, market orders, and partial order matches.

## Conclusion

This project offers a  demonstration of an OrderBook with RPC communication.
