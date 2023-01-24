# avanza
A Node.js module wrapping the web API of Avanza. Tested on Node.js version 17.5.0.

## Installation

You can install the module via npm by running:

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

## Licence

This module is available under the [MIT Licence](http://opensource.org/licenses/MIT)


