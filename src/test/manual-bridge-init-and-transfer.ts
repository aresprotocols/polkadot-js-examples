import { apiProvider, balance, fetchGenesisAccount, sleep, getCurrentBlockNumber } from '../module/commons'
import { Index } from '@polkadot/types/interfaces/runtime'
import { BN } from '@polkadot/util'
import { ApiBase } from '@polkadot/api/base'
import { KeyringPair } from '@polkadot/keyring/types'

const {
  setting
} = require('../module/manual_bridge')

async function transfer () {
  const api = await apiProvider()
  const genesis = await fetchGenesisAccount()
  const sender = genesis.alice_stash
  const _balance = balance(1000000)
  const txs = [
    api.tx.balances.transfer(genesis.alice.address, _balance),
    api.tx.balances.transfer(genesis.charlie.address, _balance),
    api.tx.balances.transfer(genesis.dave.address, _balance),
    api.tx.balances.transfer(genesis.ferdie.address, _balance),
  ];

  // construct the batch and send the transactions
  api.tx.utility
    .batch(txs)
    .signAndSend(sender, ({ status }) => {
      if (status.isInBlock) {
        console.log(`included in ${status.asInBlock}`);
      }
    });
}


async function init_pallet () {
  const api = await apiProvider()
  const genesis = await fetchGenesisAccount()
  const root = genesis.alice
  await setting(api, root, root.address, root.address, balance(1000))

}

(async () => {
  await transfer()
  await sleep(6000)
  await init_pallet()
  await sleep(6000)

})().catch(console.error).finally(() => process.exit())
