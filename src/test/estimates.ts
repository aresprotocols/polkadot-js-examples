import { apiProvider, balance, fetchGenesisAccount, sleep, getCurrentBlockNumber } from '../module/commons'
import { Index } from '@polkadot/types/interfaces/runtime'
import { BN } from '@polkadot/util'

const {
  getSubAccount,
  active,
  setting,
  newEstimates,
  participateEstimates,
  queryPreparedEstimates,
  queryActiveEstimates,
  queryCompletedEstimates,
  queryParticipants,
  queryWinners
} = require('../module/estimates')

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

  // const _nonce:BN = await api.rpc.system.accountNextIndex(sender.address)
  // let nonce = _nonce.toNumber()
  // await api.tx.balances.transfer(genesis.alice.address, _balance).signAndSend(sender, { nonce: nonce })
  // await api.tx.balances.transfer(genesis.charlie.address, _balance).signAndSend(sender, { nonce: nonce + 1 })
  // await api.tx.balances.transfer(genesis.dave.address, _balance).signAndSend(sender, { nonce: nonce + 2 })
  // await api.tx.balances.transfer(genesis.ferdie.address, _balance).signAndSend(sender, { nonce: nonce + 3 })
}

async function init_pallet () {
  const api = await apiProvider()
  const genesis = await fetchGenesisAccount()
  const root = genesis.alice
  let minimumTicketPrice = balance(99)
  let minimumInitReward = balance(999)
  await active(api, root, true)
  await sleep(6000)
  await setting(api, root, [root.address], [root.address], 10, minimumTicketPrice, minimumInitReward)

}

async function new_estimate_1 () {
  const api = await apiProvider()
  const genesis = await fetchGenesisAccount()
  const root = genesis.alice
  const current = await getCurrentBlockNumber(api)
  const start = current + 10
  const end = start + 20
  let distribute = end + 20
  const fraction = Math.pow(10, 4)
  let symbol = 'btc-usdt'

  console.log(`current_blocK: ${current}, started_at: ${start}, ended_at: ${end}`)
  const init_reward = balance(1000)
  const ticket_price = balance(100)
  const deviation = (10 / 100) * 1000000

  await newEstimates(api, root, symbol, start, end, distribute, 'DEVIATION', deviation, undefined, [{ 'Base': 1 }, { 'Base': 3 }, { 'Base': 5 }], init_reward, ticket_price)
  const reward_pool = getSubAccount(symbol)
  console.log(`reward_pool_account: ${reward_pool}`)
  await sleep(6000 * 8)
  const accountData = await api.query.system.account(reward_pool)
  console.log(accountData.toHuman())

  let bscAddress = '0x8365EFb25D0822AaF15Ee1D314147B6a7831C403'
  await participateEstimates(api, genesis.bob, symbol, 21000 * fraction, undefined, { 'Base': 3 }, bscAddress)
  await participateEstimates(api, genesis.alice, symbol, 20000 * fraction, undefined, { 'Base': 1 }, bscAddress)
  await participateEstimates(api, genesis.charlie, symbol, 24000 * fraction, undefined, { 'Base': 1 }, bscAddress)
  await participateEstimates(api, genesis.ferdie, symbol, 23000 * fraction, undefined, { 'Base': 1 }, bscAddress)
  await sleep(12000)
}

async function new_estimate_2 () {
  const api = await apiProvider()
  const genesis = await fetchGenesisAccount()
  const root = genesis.alice
  const current = await getCurrentBlockNumber(api)
  const start = current + 10
  const end = start + 20
  let distribute = end + 20
  const fraction = Math.pow(10, 4)
  let symbol = 'btc-usdt'

  console.log(`current_blocK: ${current}, started_at: ${start}, ended_at: ${end}`)
  const init_reward = balance(1000)
  const ticket_price = balance(100)
  const deviation = (10 / 100) * 1000000
  const options = [10000 * fraction, 20000 * fraction, 30000 * fraction, 40000 * fraction]
  await newEstimates(api, root, symbol, start, end, distribute, 'RANGE', undefined, options, [{ 'Base': 1 }, { 'Base': 3 }, { 'Base': 5 }], init_reward, ticket_price)
  await sleep(6000 * 8)

  let bscAddress = '0x8365EFb25D0822AaF15Ee1D314147B6a7831C403'
  await participateEstimates(api, genesis.bob, symbol, undefined, 1, { 'Base': 3 }, bscAddress)
  await participateEstimates(api, genesis.alice, symbol, undefined, 2, { 'Base': 1 }, bscAddress)
  await participateEstimates(api, genesis.charlie, symbol, undefined, 3, { 'Base': 1 }, bscAddress)
  await participateEstimates(api, genesis.ferdie, symbol, undefined, 3, { 'Base': 1 }, bscAddress)
  await sleep(12000)
}

(async () => {
  await transfer()
  await sleep(6000)
  await init_pallet()
  await sleep(6000)
  await new_estimate_1()
  // await new_estimate_2()
})().catch(console.error).finally(() => process.exit())
