# avanza
A Node.js package wrapping the web API of Avanza. Tested on Node.js version 26.10.

## Installation

You can install the package via npm by running:

    $ npm install @kfreskgard/avanza


## Authenticating

Authentication is done using username/password + TOTP.

In order to use the module, the secret of TOTP must be provided. It can be found when activating two-factor authentication. The secret should be a 32 character string.

## Usage
``` ts
import { AuthenticateRequest, Avanza, AvanzaError } from '@kfreskgard/avanza'

const avanza = new Avanza();
const credentials: AuthenticateRequest = {
    username: "abcd",
    password: "abcd",
    secret: "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHH"
};
(async () => {
    try {
        await avanza.authenticate(credentials);
        const positions = await avanza.getPositions();
        console.log(positions);
    } catch (e) {
        if (e instanceof AvanzaError && e.meta) {
            console.error(`Error: ${e}, metadata: ${JSON.stringify(e.meta)}`);
        } else {
            console.error(`Error: ${e}`);
        }
    }
})();
```

## Orders

``` ts
const order = await avanza.newOrder({
    accountId: "1234567",
    orderbookId: "5361",
    side: "BUY",
    price: 100,
    volume: 10
});

if (order.orderRequestStatus === "SUCCESS") {
    await avanza.modifyOrder({ accountId: "1234567", orderId: order.orderId, price: 101, volume: 10 });
    await avanza.deleteOrder({ accountId: "1234567", orderId: order.orderId });
} else {
    console.error(order.messageCode, order.message);
}
```

`validUntil` defaults to today and `condition` to `"NORMAL"`. A rejected order is returned with HTTP 200 and `orderRequestStatus: "ERROR"` rather than as an `AvanzaError`, so check the status.

## Deal and order events

After `authenticate()` the instance emits your deals and order changes as they happen.

``` ts
import { DealEvent, OrderEvent } from '@kfreskgard/avanza'

avanza.on("DEAL", (deal: DealEvent) => console.log(`Deal: ${deal.volume} ${deal.orderbook.name} @ ${deal.price}`));
avanza.on("ORDER", (order: OrderEvent) => console.log(`Order ${order.id}: ${order.state.value}`));
```

## Quote streaming

``` ts
avanza.quoteSubscribe("5361", quote => console.log(quote.orderbookId, quote.lastPrice));

// Later
avanza.quoteUnsubscribe("5361");
```

## Licence

This module is available under the [MIT Licence](http://opensource.org/licenses/MIT)
