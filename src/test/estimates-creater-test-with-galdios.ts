import {
  apiProvider,
  balance,
  fetchGenesisAccount,
  sleep,
  getCurrentBlockNumber,
  fetchKamiAccount
} from '../module/commons'
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

}

// async function init_pallet () {
//   const api = await apiProvider()
//   const accountList = await fetchKamiAccount()
//   const kamiAcc = accountList.kami_test1
//   let minimumTicketPrice = balance(9)
//   let minimumInitReward = balance(99)
//   await active(api, root, true)
//   await sleep(6000)
//   await setting(api, root, [root.address], [root.address], 10, minimumTicketPrice, minimumInitReward)
// }

async function new_estimate_btc_DEVIATION () {
  const api = await apiProvider()
  const accountList = await fetchKamiAccount()
  const createrAcc = accountList.kami_test1
  const current = await getCurrentBlockNumber(api)
  const start = current + 10
  const end = start + 20
  let distribute = end + 20
  const btc_price = 19468
  const fraction_num = 4
  const fraction = Math.pow(10, fraction_num)
  let symbol = 'btc-usdt'

  console.log(`current_blocK: ${current}, started_at: ${start}, ended_at: ${end}`)
  const init_reward = balance(100)
  const ticket_price = balance(10)
  const deviation = (10 / 100) * 1000000

  const optionParam = {
    symbol,
    start,
    end,
    distribute,
    estimatesType: 'DEVIATION',
    deviation,
    range: undefined,
    rangeFraction: undefined ,
    multiplier: [{ 'Base': 1 }, { 'Base': 3 }, { 'Base': 5 }],
    initReward: init_reward,
    participatePrice: ticket_price
  }
  await newEstimates(api, createrAcc, optionParam)
  const reward_pool = getSubAccount(symbol, 'DEVIATION')
  console.log(`reward_pool_account: ${reward_pool}`)
  await sleep(6000 * 8)
  const accountData = await api.query.system.account(reward_pool)
  console.log(accountData.toHuman())

  let bscAddress = '0x8365EFb25D0822AaF15Ee1D314147B6a7831C403'

  await participateEstimates(api, accountList.kami_test2, {
    symbol,
    estimatesType: 'DEVIATION',
    estimatesPrice: btc_price * fraction,
    fractionLength: fraction_num,
    rangeIndex: undefined,
    multiplier: { 'Base': 1 },
    bscAddress: bscAddress
  })
  await participateEstimates(api, accountList.kami_test3, {
    symbol,
    estimatesType: 'DEVIATION',
    estimatesPrice: btc_price * fraction,
    fractionLength: fraction_num,
    rangeIndex: undefined,
    multiplier: { 'Base': 1 },
    bscAddress: bscAddress
  })
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
  // await transfer()
  // await sleep(6000)
  // await init_pallet()
  // await sleep(6000)
  await new_estimate_btc_DEVIATION()
  // await new_estimate_2()
})().catch(console.error).finally(() => process.exit())
