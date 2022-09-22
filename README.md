## Ares pallet js-examples
this is a JS tool for maintaining Ares projects, mainly for interacting with Glaidos and Odyssey networks.

### Install 
* yarn install

## How to start
* You must start local testnet or use gladios testnet.
* You need config .env with your project root directory, like this:
```
WS_ENDPOINT=wss://gladios.aresprotocol.io
APP_STASH_ACCOUNT_MNEMONIC=//Alice//stash
APP_TEST_ACCOUNT_MNEMONIC=excite tape choice poverty section resist parent surge possible soap thing copper
```
* `APP_STASH_ACCOUNT_MNEMONIC` replace with a funding account you own to allocate test tokens
* `APP_TEST_ACCOUNT_MNEMONIC` The mnemonic of the test account, the test will be tested by the sub-account derived from the mnemonic.

## Test estimates
### Activate pallet-estimates 
* if your start local test you must activate pallet-estimates module.
```
yarn estimates-active-pallet
```

### Start estimates and participate it
* For `range` type
```
yarn estimates-for-localchain -t=range
```
* For `deviation` type
```
yarn estimates-for-localchain -t=deviation
```

### Estimates fund account query
* Query the range type under a Symbol through `-s=symbol` and `-t=range`
* Query the deviation type under a Symbol through `-s=symbol` and `-t=deviation`
* Like this:
```
yarn estimates-account -s=btc-usdt -t=range
```
