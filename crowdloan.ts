// Import
import { ApiPromise, WsProvider } from '@polkadot/api'
import { u8aToHex } from '@polkadot/util'
import { encodeAddress, decodeAddress, blake2AsU8a, addressEq } from '@polkadot/util-crypto'

import { blake2AsHex } from '@polkadot/util-crypto'
import yargs from 'yargs'
import writeJsonFile from 'write-json-file'
import { Option } from '@polkadot/types-codec'
import { apiProvider } from './src/module/commons'
import { DeriveOwnContributions } from '@polkadot/api-derive/crowdloan/types'
import { Balance } from '@polkadot/types/interfaces'
import { Null, Struct } from '@polkadot/types'

async function new_api () {
  const api = await apiProvider()

  let para_id = 2008
  let network_prefix = 2

  // const child_key = await api.derive.crowdloan.childKey(para_id)
  // console.log(keys)
  const r = await api.derive.crowdloan.contributions(para_id)
  let addresses = r.contributorsHex
  // let addresses = [u8aToHex(decodeAddress('Fi8s4pW6CwJnkLsRFhqTbg2t29ApEnMUMejUvZr1StF1UkV', false, 2))]
  const contributions: DeriveOwnContributions = await api.derive.crowdloan.ownContributions(para_id, addresses)
  let count = 0
  for (let address in contributions) {
    console.log({
      'account': encodeAddress(address, network_prefix),
      'contribution': contributions[address].toString(),
    })
    count++
  }
  console.log(count)
}

async function old_api (address: string | undefined) {
  const api = await apiProvider()
  // const fund_info =  await ((await api.at(parentHash)).query.crowdloan.funds(2008))
  // const fund_info = await api.query.crowdloan.funds(2008)
  // console.log(fund_info.trieIndex)
  // const keys = await  api.derive.crowdloan.childKey(2008)
  // console.log(keys)
  // console.log(await api.derive.crowdloan.contributions(2008))
  // console.log(await ownContributions('2008',api))

  const fund_index = 67 // query from crowdloan.funds
  const ss58Format = 2
  const parentHash = (await api.rpc.chain.getHeader() as any)['parentHash']
  const buf = Buffer.allocUnsafe(4)
  //ares parachain fund_index
  buf.writeUInt32LE(fund_index)

  let child_key = new Uint8Array([...Buffer.from('crowdloan'), ...buf])
  let crowdloan_key = new Uint8Array([...Buffer.from(':child_storage:default:'), ...blake2AsU8a(child_key, 256)])
  if (address) {
    let decode_address = decodeAddress(address, false, ss58Format)
    let contribution = await api.rpc.childstate.getStorage(u8aToHex(crowdloan_key), u8aToHex(decode_address), parentHash)
    let x = api.createType('(Balance, Vec<u8>)', contribution.toString())
    console.log(x['0'].toString())
  } else {
    let all_keys = await api.rpc.childstate.getKeys(u8aToHex(crowdloan_key), null, parentHash)
    console.log(all_keys.map((i) => {
      console.log(i.toHex())
    }))
  }
}

async function main () {
  // await new_api();
  await old_api('CariHwPNVYJCLFYhyuB2L6fr5r2JwUvUtGRbfysfiJnF9bs')
}

main().catch(console.error).finally(() => process.exit())
