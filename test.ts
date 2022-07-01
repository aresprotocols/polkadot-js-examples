import { base64Decode, blake2AsHex, blake2AsU8a, decodeAddress, sr25519PairFromSeed } from '@polkadot/util-crypto'

const { fetchCustomAccount, fetchGenesisAccount, sleep, balance, rotateKeys, apiProvider } = require('./src/module/commons')
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { decodePair } from '@polkadot/keyring/pair/decode'
import { EncryptedJsonEncoding } from '@polkadot/util-crypto/json/types'
import { hexToU8a, u8aToHex } from '@polkadot/util'
import { Struct } from '@polkadot/types'
import { FundInfo } from '@polkadot/types/interfaces'
import { ownContributions, childKey } from '@polkadot/api-derive/crowdloan'

const keyring = new Keyring({ type: 'sr25519' })

keyring.setSS58Format(34)

async function main () {


  // console.log(child_encoded_bytes + blake2AsHex(concatArray, 256))
  return
  // returns Hash
  // const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  // returns SignedBlock
  // returns Hash
  // const blockHash = await api.rpc.chain.getBlockHash(202425);
  // const signedBlock = await api.rpc.chain.getBlock(blockHash);

  // signedBlock.block.extrinsics.forEach((ex, index) => {
  //   console.log(index, ex.toHex());
  // });

  const json = {
    'encoded': 'QBJdPaREFaowzlPHlT3i1F0DP5yDvKkT5eO7q76il+gAgAAAAQAAAAgAAAAs2TR500YOFgydfk7WM5k38GqAmKH8Ma/FKkceYBCmi9EVmII4ejRsGk4Kwb5mDWe4CI04xgUcqtkovOiv6krrJCMSgjtgun9wzBHe0PhllGQTWBKY0xLslm4o3l55RssCQQ0VmnauDOwKpDNvdZjxhKnefUMYQq/bd+Ixu1EuKhfekYkxkxEkCxoKdGZhd7uhQB9ncq9py5t11Rl7',
    'encoding': { 'content': ['pkcs8', 'sr25519'], 'type': ['scrypt', 'xsalsa20-poly1305'], 'version': '3' },
    'address': '5CGQbtGcRA7dJ45zs3RsC37VyqgRC1HunLoNGzLCroVDVC2i',
    'meta': {
      'genesisHash': null,
      'name': 'ares_test_aura_1',
      'parentAddress': '5GeBGwPGY2E882iydJ5FbYjcqZAsndFBEhKKZWs35JT2N5dm',
      'suri': '//1//aura',
      'whenCreated': 1634615439489
    }
  }
  let e: EncryptedJsonEncoding[] = ['scrypt', 'xsalsa20-poly1305']
  const passphrase = '123456'

  // const json = {
  //   'encoded': 'MFMCAQEwBQYDK2VwBCIEICiwriIca7BoVrKH9g1+oNmFUupaFtsWlWhJqjcds+tR/RkMznTfNWQytBC9ZGgjCdbe2yfHaEXa84hVfLrDyjShIwMhAEbr3e+M2bsWfcMIeNcRO34Wjm8GRr7/131p05utdrR6',
  //   'encoding': { 'content': ['pkcs8', 'sr25519'], 'type': ['none'], 'version': '3' },
  //   'address': '5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV',
  //   'meta': {}
  // }
  // let e: EncryptedJsonEncoding[] = ['none']
  // const passphrase = ""

  // @ts-ignore
  const pair = keyring.addFromJson(json)
  pair.unlock(passphrase)
  const decoded = decodePair(passphrase, base64Decode(json.encoded), e)
  // const decoded = decodePair('', base64Decode(json.encoded))
  const a = keyring.addFromUri(`${process.env.MNEMONIC}//1//aura`, {}, 'sr25519')
  const b = a.derive('//1//aura')

  //0xca7854b381567a194ab27d4ce598da122fe6eeaa830e03635a62e5b9bc2c4046
  // console.log(a.address)
  // console.log(decoded)
  // console.log(pair.publicKey)
  // console.log(a.publicKey)
  const seed = hexToU8a('')
  //let test = schnorrkelKeypairFromSeed(seed)
  let test = keyring.addFromSeed(seed, {}, 'sr25519')
  let testb = sr25519PairFromSeed(seed)
  console.log(`addFromUri a publicKey: ${u8aToHex(a.publicKey)}, address:${a.address}`)
  console.log(`addFromUri b publicKey: ${u8aToHex(b.publicKey)}, address:${b.address}`)
  console.log(`addFromJson  publicKey: ${u8aToHex(pair.publicKey)}, address:${pair.address}`)
  console.log(`addFromSeed publicKey: ${u8aToHex(test.publicKey)}, address: ${test.address}`)
  console.log(`sr25519PairFromSeed publicKey: ${u8aToHex(testb.publicKey)}, secretKey: ${u8aToHex(testb.secretKey)}`)
  console.log(`decoded json publicKey: ${u8aToHex(decoded.publicKey)}, secretKey: ${u8aToHex(decoded.secretKey)}`)
  console.log(`toJSON: ${JSON.stringify(test.toJson(''))}`)
  // console.log(`decoded publicKey: ${u8aToHex(decoded.publicKey)}`)
  // a.
  // console.log(`verify: ${a.verify("test", msg1,a.publicKey)}`)
}

main().catch(console.error).finally(() => process.exit())
