import { ISubmittableResult } from '@polkadot/types/types'
import { KeyringPair } from '@polkadot/keyring/types'
import { BN, bufferToU8a, u8aConcat, u8aToHex } from '@polkadot/util'
import { ApiBase } from '@polkadot/api/base'
import { encodeAddress } from '@polkadot/util-crypto'
import { createEncode } from '@polkadot/util-crypto/base32/helpers'

const { apiProvider, sleep, balance } = require('./commons')
const { propose } = require('../../council')
const EMPTY_U8A_32 = new Uint8Array(32);

async function setting (api: ApiBase<'promise'> | undefined, root: KeyringPair, stash: string, waiter: string, minBalance: BN) {
  if (!api) return

  const _nonce:BN = await api.rpc.system.accountNextIndex(root.address)
  let nonce = _nonce.toNumber()

  const tx1 = await api.tx.sudo.sudo(
    api.tx.manualBridge.updateStash(stash)
  ).signAndSend(root,{ nonce: nonce })
  console.log(`Set stash account tx hash : ${tx1}`)

  const tx2 = await api.tx.sudo.sudo(
    api.tx.manualBridge.updateStash(waiter)
  ).signAndSend(root,{ nonce: nonce+1 })
  console.log(`Set waiter account tx hash : ${tx2}`)

  const tx3 = await api.tx.sudo.sudo(
    api.tx.manualBridge.updateMinimumBalanceThreshold(minBalance)
  ).signAndSend(root,{ nonce: nonce+2 })
  console.log(`Set waiter account tx hash : ${tx3}`)
}

module.exports = {
  setting
}
