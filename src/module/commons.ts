import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { cryptoWaitReady, blake2AsHex, xxhashAsHex } from '@polkadot/util-crypto'
import { BN, u8aToHex } from '@polkadot/util'
import { config as dotenvConfig } from 'dotenv'

const keyring = new Keyring({ type: 'sr25519' })
import aresTypes from '../../type-spec'
import { KeyringPair } from '@polkadot/keyring/types'
import { ApiBase } from '@polkadot/api/base'

dotenvConfig()

export async function fetchGenesisAccount () {
  await cryptoWaitReady()
  const alice: KeyringPair = keyring.addFromUri('//Alice', { name: 'Alice' })
  const bob = keyring.addFromUri('//Bob', { name: 'Bob' })
  const charlie = keyring.addFromUri('//Charlie', { name: 'Charlie' })
  const dave = keyring.addFromUri('//Dave', { name: 'Dave' })
  const eve = keyring.addFromUri('//Eve', { name: 'Eve' })
  const ferdie = keyring.addFromUri('//Ferdie', { name: 'Ferdie' })

  const alice_stash = keyring.addFromUri('//Alice//stash', { name: 'Alice_stash' })
  const bob_stash = keyring.addFromUri('//Bob//stash', { name: 'Bob_stash' })
  const charlie_stash = keyring.addFromUri('//Charlie//stash', { name: 'Charlie_stash' })
  const dave_stash = keyring.addFromUri('//Dave//stash', { name: 'Dave_stash' })
  const eve_stash = keyring.addFromUri('//Eve//stash', { name: 'Eve_stash' })
  const ferdie_stash = keyring.addFromUri('//Ferdie//stash', { name: 'Ferdie_stash' })

  return {
    alice,
    bob,
    charlie,
    dave,
    eve,
    ferdie,
    alice_stash,
    bob_stash,
    charlie_stash,
    dave_stash,
    eve_stash,
    ferdie_stash
  }
}

export async function fetchCustomAccount () {
  await cryptoWaitReady()
  console.warn("******** your mnemonic ********")
  const mnemonic = 'please input your mnemonic'
  const root = keyring.addFromMnemonic(mnemonic, { name: 'testnet' }, 'sr25519')
  // const a1 = root.derive('//hard/soft1')
  const a0 = root.derive('//0', { name: 'a0' })
  const a1 = root.derive('//1', { name: 'a1' })
  const a2 = root.derive('//2', { name: 'a2' })
  const a3 = root.derive('//3', { name: 'a3' })
  const a4 = root.derive('//4', { name: 'a4' })
  const a5 = root.derive('//5', { name: 'a5' })
  const a6 = root.derive('//6', { name: 'a6' })
  const a7 = root.derive('//7', { name: 'a7' })
  const a8 = root.derive('//8', { name: 'a8' })
  const a9 = root.derive('//9', { name: 'a9' })
  const a10 = root.derive('//10', { name: 'a10' })
  const a11 = root.derive('//11', { name: 'a11' })
  const a12 = root.derive('//12', { name: 'a12' })
  const a13 = root.derive('//13', { name: 'a13' })
  const a14 = root.derive('//14', { name: 'a14' })
  const a15 = root.derive('//15', { name: 'a15' })
  return {
    root, a0, a1, a2, a3, a4, a5,
    a6, a7, a8, a9, a10, a11, a12, a13,
    a14, a15,
  }
}

/**
 * Creates a balance instance for testing purposes which most often do not need to specifiy/use decimal part.
 * @param amountInt Integer part of the balance number
 * @param decimalsString Decimals part of the balance number. Note! This is a string sequence just after '.' separator
 *  that is the point that separates integers from decimals. E.g. (100, 4567) => 100.45670000...00
 */
export function balance (amountInt: number, decimalsString?: string) {
  const decimalsPadded = (decimalsString || '').padEnd(12, '0')
  return new BN(amountInt.toString() + decimalsPadded)
}

export async function getCurrentBlockNumber (api: ApiBase<'promise'>,): Promise<number> {
  const blockHash = await api.rpc.chain.getFinalizedHead()
  const header = await api.rpc.chain.getHeader(blockHash)
  return header.number.toNumber()
}

export function rotateKeys (suri: string) {
  let auraMnemonic = 'ski twice answer print final maximum imitate rural fluid ritual garment liberty'
  let grandpaMnemonic = 'innocent small taxi design ask ritual slab silent anger blur way used'

  const auraRoot = keyring.addFromMnemonic(auraMnemonic, { name: 'aura' }, 'sr25519')
  const grandpaRoot = keyring.addFromMnemonic(grandpaMnemonic, { name: 'grandpa' }, 'ed25519')

  const a0 = auraRoot.derive(`${suri}`, { name: 'a0' })
  const b0 = grandpaRoot.derive(`${suri}`, { name: 'b0' })

  let contact = function (publicKeys: Uint8Array[]) {
    let totalSize = 0
    for (let i = 0; i < publicKeys.length; i++) {
      let publicKey = publicKeys[i]
      totalSize += publicKey.length
    }

    let start = 0
    const buffer = new ArrayBuffer(totalSize)
    const uint8 = new Uint8Array(buffer)
    for (let i = 0; i < publicKeys.length; i++) {
      let publicKey = publicKeys[i]
      //console.log(`index:${i}-> ${u8aToHex(publicKey)}`)
      uint8.set(publicKey, start)
      start += publicKey.length
    }
    console.log(`rotate-keys: ${u8aToHex(uint8)}`)
    return uint8
    //return u8aToHex(uint8);
  }

  return contact([
    a0.publicKey,
    b0.publicKey
  ])
}

export function sleep (ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function apiProvider (): Promise<ApiPromise> {

  const WS_ENDPOINT = process.env.WS_ENDPOINT

  // Initialise the provider to connect to the local node
  const provider = new WsProvider(WS_ENDPOINT || 'ws://127.0.0.1:9944')
  return await ApiPromise.create({ provider })
  // return await ApiPromise.create(
  //     {
  //         provider,
  //         rpc:{
  //             system: {
  //                 children: {
  //                     description: 'Just a test method',
  //                     params: [
  //                         {
  //                             name: 'target_hash',
  //                             type: 'Hash',
  //                             isOptional: true
  //                         }
  //                     ],
  //                     type: 'Vec<Hash>'
  //                 }
  //             }
  //         },
  //         typesBundle: { spec: { 'ares-gladios': aresTypes } }
  //     })
}
