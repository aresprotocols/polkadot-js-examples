import { ApiPromise } from '@polkadot/api'
import { AccountId, Keys } from '@polkadot/types/interfaces'
import { Vec } from '@polkadot/types-codec'
import { Option } from '@polkadot/types'
import * as fs from 'fs'

const { fetchCustomAccount, fetchGenesisAccount, sleep, balance, rotateKeys, apiProvider } = require('./commons')
const { transfer } = require('./balance')
const { submitCandidacy, voteCandidate, renounceCandidacy, propose, voteAll } = require('./council')
const {
  addBounty,
  proposeApproveBounty,
  proposeCurator,
  curatorAccept,
  rewardImplementer,
  claim
} = require('./bounties')

const { externalPropose, externalProposeDefault, externalProposeMajority } = require('./democracy')
const { bond, bondMore, vote, setSessionKeys, setValidatorPreferences, stop, setValidatorCount } = require('./staking')
const {
  newEstimates,
  participateEstimates,
  queryPreparedEstimates,
  queryActiveEstimates,
  queryCompletedEstimates,
  queryParticipants,
  queryWinners
} = require('./estimates')

const { upgrade } = require('./upgrade')

const { blake2AsHex, base64Decode, signatureVerify } = require('@polkadot/util-crypto')
const { decodePair } = require('@polkadot/keyring/pair')
const { u8aToHex } = require('@polkadot/util')
const { Keyring, } = require('@polkadot/api')
const { extractAuthor } = require('@polkadot/api-derive/type/util')
const keyring = new Keyring({ type: 'sr25519' })

async function rotateKeysByRPC (suri: string) {
  const api = await apiProvider()
  const keys = await api.rpc.author.rotateKeys()
  console.log(`keys: ${u8aToHex(keys)}`)
  return keys
}

async function networkFlow () {
  const accounts = await fetchCustomAccount()
  const genesis = await fetchGenesisAccount()
  // await bond(genesis['bob'], genesis['bob_stash'], balance(83334))
  // await bond(genesis['charlie'], genesis['charlie_stash'], balance(83334))
  // await bond(genesis['dave'], genesis['dave_stash'], balance(83334))
  // await bond(genesis['eve'], genesis['eve_stash'], balance(83334))
  // await bond(genesis['ferdie'], genesis['ferdie_stash'], balance(83334))

  // await sleep(3000)
  // await setSessionKeys(genesis['bob'], await rotateKeysByRPC('//bob'));
  // await setSessionKeys(genesis['charlie'], await rotateKeysByRPC('//charlie'));
  // await setSessionKeys(genesis['dave'], await rotateKeysByRPC('//dave'));
  // await setSessionKeys(genesis['eve'], await rotateKeysByRPC('//eve'));
  // await setSessionKeys(genesis['ferdie'], await rotateKeysByRPC('//ferdie'));

  //await setSessionKeys(genesis['eve'], rotateKeys('//eve'));
  // await setSessionKeys(genesis['ferdie'], rotateKeys('//ferdie'));

  // await sleep(3000)
  // await setValidatorPreferences(genesis['alice'], '10000.00%');
  // await setValidatorPreferences(genesis['bob'], '10000.00%');
  // await setValidatorPreferences(genesis['charlie'], '10000.00%');
  // await setValidatorPreferences(genesis['dave'], '10000.00%');
  // await setValidatorCount(genesis['alice'], 3);
  // await vote(genesis['eve'], [
  //     genesis['bob_stash'].address
  // ]);

  // await vote(genesis['ferdie'], [
  //     genesis['charlie_stash'].address
  // ]);

  // await stop(genesis['charlie']);
  // await stop(genesis['dave']);
  // await stop(genesis['eve']);
  // await stop(genesis['ferdie']);
}

async function estimatesFlow (api: ApiPromise) {
  const accounts = await fetchCustomAccount()
  const genesis = await fetchGenesisAccount()

  let created = true
  let participate = true
  let testLocked = false
  let start = 0, end = 0
  // subscribe to all new headers (with extended info)
  api.derive.chain.subscribeNewHeads(async (header) => {
    let current = header.number.toNumber()

    let fraction = 10000
    let bscAddr = '0x8365EFb25D0822AaF15Ee1D314147B6a7831C403'
    if (created || participate || testLocked) {
      console.log(`#${header.number}: ${header.author}`)
    }
    if (created) {
      start = current + 10
      end = start + 10
      let distribute = end + 10
      created = false

      await newEstimates(genesis['alice'], 'btc-usdt', start, end, distribute, 'DEVIATION', 500000, null, balance(100))

      // await newEstimates(accounts['a1'], 'btc-usdt', start, end, distribute, "RANGE", null, [20000 *  fraction, 40000 * fraction, 50000 * fraction], balance(200));

      await newEstimates(genesis['alice'], 'eth-usdt', start, end, distribute, 'RANGE', null, [1000 * fraction, 3000 * fraction, 2000 * fraction], balance(123))

      // await newEstimates(genesis['a2'], 'dot-usdt', start, end, distribute, 'DEVIATION', 500000, null, balance(222))
      console.log('new estimates')

    } else if (!created && current > start && participate) {
      participate = false

      await participateEstimates(genesis['alice'], 'btc-usdt', 60000 * fraction, null, 'Base1', bscAddr)

      await participateEstimates(genesis['alice'], 'eth-usdt', null, 3, 'Base5', bscAddr)

      // await participateEstimates(genesis['a2'], 'dot-usdt', 40 * fraction, null, 'Base2', bscAddr)
      console.log('participate estimates')
    } else if (!created && testLocked && current + 6 > end && end > 0) {
      testLocked = false
      console.log('test locked estimates')
      await participateEstimates(genesis['alice'], 'btc-usdt', 60000 * fraction, null, 'Base1', bscAddr)
    }

    // [10000, 20000, 30000, 40000]
    // x <= 10000 :0  /  10000 < x <= 20000 :1  /  20000 < x <= 30000 :2 / x > 30000  :3
    // let range = [10000, 20000];
    // let rangeIndex = 2;
    // if (rangeIndex == range.length){
    //     /// price > range[range.length-1]
    // }else if (rangeIndex == 0){
    //     /// price <= range[0]
    // }else{
    //     /// range[index-1] < price <= range[index + 1]
    // }
    //query
  })
  // console.log(header.author.toHex());

  // api.tx.crowdloan.contribute(2000, balance(1000), null)
  //     .signAndSend(genesis.bob, ({ status, dispatchError }) => {
  //         if (dispatchError) {
  //             if (dispatchError.isModule) {
  //                 // for module errors, we have the section indexed, lookup
  //                 const decoded = api.registry.findMetaError(dispatchError.asModule);
  //                 const { docs, name, section } = decoded;

  //                 console.log(`${section}.${name}: ${docs.join(' ')}`);
  //             }
  //             console.log(`${dispatchError}`);
  //         }
  //     })
  while (true) {
    await sleep(3000)

    if (!created && !participate && !testLocked) {
      await queryPreparedEstimates('btc-usdt')
      await queryPreparedEstimates('eth-usdt')
      await queryPreparedEstimates('dot-usdt')

      await queryActiveEstimates('btc-usdt')
      await queryActiveEstimates('eth-usdt')
      await queryActiveEstimates('dot-usdt')

      await queryCompletedEstimates('btc-usdt')
      await queryCompletedEstimates('eth-usdt')
      await queryCompletedEstimates('dot-usdt')

      await queryParticipants('btc-usdt', 1)
      await queryParticipants('eth-usdt', 1)
      await queryParticipants('dot-usdt', 1)

      await queryWinners('btc-usdt', 1)
      await queryWinners('eth-usdt', 1)
      await queryWinners('dot-usdt', 1)
    }
  }

  // await newEstimates(accounts['a0'], 'btc-usdt', start, end, distribute, "DEVIATION", 500000, null, balance(1));
  // return start;

  // await participateEstimates(accounts['a1'], 'btc-usdt', 2, 10000, '12344');
  // await queryAllEstimates('btc-usdt');
  // await queryParticipants('btc-usdt', 110, 10, 10, 500000, balance(1))
  // await queryWinners('btc-usdt', 110, 10, 10, 500000, balance(1))
}

async function sessionKeys () {
  const api = await apiProvider()
  const a = (await api.query.session.nextKeys('4SJT3cozQ7Uv31M8A1q5ysarUEtv58xcoA5GgWBnoZ3b7G5w')) as Option<Keys>
  console.log(a.toHex())

}

async function main () {
  const accounts = await fetchCustomAccount()
  const genesis = await fetchGenesisAccount()
  const api = await apiProvider()

  // console.log(await api.runtimeMetadata())

  // console.log(signedBlock.block.header.author)
  keyring.setSS58Format(34)
  const initAccount = keyring.addFromMnemonic(process.env.MNEMONIC, { name: 'init' }, 'sr25519')
  const controller0 = initAccount.derive('//1//controller')

  //0xcc9c195e5d8503758007bc65f3f24815dfb76f18288ca167a30f8c2f0affff3c
  // console.log(b.toHuman())
  // {
  //     //初始化 价格竞猜的设置
  //     let newMembers = [
  //         accounts['a0'].address,
  //         accounts['a1'].address,
  //         accounts['a2'].address
  //     ]
  //     let unsignedMembers = [
  //         initAccount.derive("//1//aura").address
  //     ]
  //     let lockedEstimates = 5;
  //     let minimumTicketPrice = balance(100);
  //     console.log(`newMembers: ${newMembers}, unsignedMembers: ${unsignedMembers}, lockedEstimates: ${lockedEstimates}, minimumTicketPrice: ${minimumTicketPrice}`);
  //     // Send the actual sudo transaction
  //     const tx = await api.tx.sudo
  //         .sudo(
  //             api.tx.estimates.preference(newMembers, unsignedMembers, lockedEstimates, minimumTicketPrice)
  //         )
  //         .signAndSend(controller0);
  //     console.log(`sudo hash: ${tx}`);
  //     await sleep(3000);
  // }

  // console.log(xxhashAsHex("Aura", 128));
  // console.log(xxhashAsHex("Authorities", 128));

  // const txB = await api.tx.estimates.participateEstimates('btc-usdt', 2650, 10, 10, 500000, balance(1000), 60000, 'wehjfjw')
  //     .signAndSend(accounts['a0']);
  // console.log(`txHash: ${txB.status} `)
  // const te = await api.query.estimates.winners({

  // });
  // console.log(te);
  // await estimatesFlow(api);
  // await bondMore(genesis['alice_stash'], balance(100000))
  {
    /**
     Balance-flow
     **/
    // await transfer(genesis.alice, accounts, 4000)
    // await transfer(controller0, accounts, 10000);
    // await sleep(4000)
  }

  {
    /**
     *Council-flow
     *
     **/
    // await submitCandidacy(accounts)
    // await voteCandidate(accounts)
    // await renounceCandidacy(accounts.a0)

    // const call = api.tx.system.remark(remark)
    // const call = api.tx.system.remark("123")
    // console.log(`call length: ${call.length}. call hash: ${call.hash.toHex()}`)
    // await propose(accounts.a2, call)

  }

  {
    /**
     Bounty-flow
     **/
    const curator = accounts.a0
    const beneficiary = accounts.a11
    // await addBounty(accounts.root)
    // await proposeApproveBounty(genesis.alice)

    // await proposeCurator(genesis.alice, accounts.a0, 100)
    // await curatorAccept(curator)
    // await rewardImplementer(curator, beneficiary)
    // await claim(beneficiary)
  }

  {

    // await externalPropose(genesis.alice)
    // await externalProposeMajority(genesis.eve)
    // await externalProposeDefault(genesis.bob)
    // await sleep(3200)
    // await voteAll(genesis)

  }
}

(async () => {
  const genesis = await fetchGenesisAccount()
  const initAccount = keyring.addFromMnemonic(process.env.MNEMONIC, { name: 'init' }, 'sr25519')
  const controller0 = initAccount.derive('//1//controller')
  const path = '/Users/zhong/spaces/ares/ares/target/release/wbuild/runtime-pioneer-node/runtime_pioneer_node.wasm'
  const code = fs.readFileSync(path).toString('hex')
  const api = await apiProvider()
  await upgrade(controller0, code)
  // const authorities = await api.query.aura.authorities()
  // console.log(authorities.toHuman())
  // // const keys = await api.query.session.queuedKeys()
  // // console.log(keys.toHuman())
  //
  // const s  ="0x104aa6e0eeed2e3d1f35a8eb1cd650451327ad378fb8975dbf5747016ff3be2460a483a387dd54aa61d1619bfca66b41e0bbee9cd199306e4310f823526d6ebe6ab200d0328d26f7cbb67223c179ab14a2152d7afb6689f07b618fda33695d5fd4a483a387dd54aa61d1619bfca66b41e0bbee9cd199306e4310f823526d6ebe6a70214e02fb2ec155a4c7bb8c122864b3b03f58c4ac59e8d83af7dc29851df65708ecdc14e2dd427724c60c6879a1aeade21d9708c30c4477f679dde971cb13783b7345bd36fb53c50be544a7c2847b9673984fa587af0c27108d3d464183e94f08ecdc14e2dd427724c60c6879a1aeade21d9708c30c4477f679dde971cb1378acad76a1f273ab3b8e453d630d347668f1cfa9b01605800dab7126a494c04c7c763a6ddd64b5e2f0e0c08a2c6e5143ae47edc563155bd052a26d3f942b806a1f2ce72e098beb0bc8ed6c812099bed8c7c60ae8208c94abf4212d7fdeaf11bab3763a6ddd64b5e2f0e0c08a2c6e5143ae47edc563155bd052a26d3f942b806a1fc82c3780d981812be804345618d27228680f61bb06a22689dcacf32b9be8815a46bd24b721b0252e4c5b933b3c1b53b5179799511594695bf03f06d17b91154ea16c71b78c13cbd73e09cc348be1e8521ec2ce4c2615d4f2cf0e8148ba454a0546bd24b721b0252e4c5b933b3c1b53b5179799511594695bf03f06d17b91154e"
  // let x = api.createType('Vec<(AccountId32,SessionKeys3)>', s);
  // console.log("SessionKeys3", api.createType('Vec<(AccountId32,SessionKeys3)>', s).toJSON())
  // console.log("SessionKeys4", api.createType('Vec<(AccountId32, SessionKeys4)>', s).toJSON())
  //
  // //account: session:next_keys(stash_1)
  // x = api.createType('SessionKeys4', "0x08ecdc14e2dd427724c60c6879a1aeade21d9708c30c4477f679dde971cb13783b7345bd36fb53c50be544a7c2847b9673984fa587af0c27108d3d464183e94f08ecdc14e2dd427724c60c6879a1aeade21d9708c30c4477f679dde971cb1378");
  // console.log("b", x.toHuman())
})().catch(console.error).finally(() => process.exit())

// sessionKeys().catch(console.error).finally(() => process.exit())
// console.log(balance(1000).toString())
