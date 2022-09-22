import {
  apiProvider,
  balance,
  fetchGenesisAccount,
  sleep,
  getCurrentBlockNumber,
  getTestAccount, extractCmdOrder
} from '../module/commons'
import { EstimatesType, ParamsOfNewEstimates, ParamsOfParticipateEstimates } from '../module/estimates'
import { Index } from '@polkadot/types/interfaces/runtime'
import { BN } from '@polkadot/util'
import { KeyringPair } from '@polkadot/keyring/types'

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

// async function init_pallet () {
//   const api = await apiProvider()
//   const genesis = await fetchGenesisAccount()
//   const root = genesis.alice
//   let minimumTicketPrice = balance(99)
//   let minimumInitReward = balance(999)
//   await active(api, root, true)
//   await sleep(6000)
//   await setting(api, root, {
//     admins: [root.address],
//     lock: 10,
//     minimumTicketPrice: minimumTicketPrice,
//     minimumInitReward: minimumInitReward
//   })
// }

async function new_estimate_for_DEVIATION () {
  const api = await apiProvider()
  // const genesis = await fetchGenesisAccount()
  // const esAdmin = genesis.alice
  const esAdmin = await getTestAccount('//Es//Admin', 1000)
  const current = await getCurrentBlockNumber(api)
  const start = current + 10
  const end = start + 20
  let distribute = end + 20
  const fraction_length = 4
  const fraction = Math.pow(10, fraction_length)
  let symbol = 'btc-usdt'

  console.log(`current_blocK: ${current}, started_at: ${start}, ended_at: ${end}`)
  const init_reward = 10
  const ticket_price = 10
  const deviation = (90 / 100) * 1000000
  const estimatesType: EstimatesType = 'DEVIATION'

  const estimateOption: ParamsOfNewEstimates = {
    symbol,
    start,
    end,
    distribute,
    estimatesType,
    deviation,
    range: undefined,
    rangeFraction: undefined,
    multiplier: [{ 'Base': 1 }, { 'Base': 3 }, { 'Base': 5 }],
    initReward: balance(init_reward),
    participatePrice: balance(ticket_price)
  }
  await newEstimates(api, esAdmin, estimateOption)
  const reward_pool = getSubAccount(symbol)
  console.log(`reward_pool_account: ${reward_pool}`)
  console.log('Wait for start ..............')
  await sleep(6000 * 10)
  const accountData = await api.query.system.account(reward_pool)
  console.log(accountData.toHuman())

  let participateConfig: ParamsOfParticipateEstimates = {
    symbol,
    estimatesPrice: 21000 * fraction,
    estimatesType,
    fractionLength: fraction_length,
    rangeIndex: undefined,
    multiplier: { 'Base': 3 },
    bscAddress: undefined
  }

  // let bscAddress = '0x8365EFb25D0822AaF15Ee1D314147B6a7831C403'
  participateConfig.estimatesPrice = 20000 * fraction
  await participateEstimates(api, await getTestAccount('//ES//Alice', ticket_price ), participateConfig)
  participateConfig.estimatesPrice = 21000 * fraction
  await participateEstimates(api, await getTestAccount('//ES//Bob', ticket_price ), participateConfig)
  participateConfig.estimatesPrice = 24000 * fraction
  await participateEstimates(api, await getTestAccount('//ES//Jack', ticket_price ), participateConfig)
  participateConfig.estimatesPrice = 23000 * fraction
  await participateEstimates(api, await getTestAccount('//ES//Sunny', ticket_price ), participateConfig)
  await sleep(12000)
}

// function getAllTestAccount(initBalance: number): Promise<KeyringPair[]> {
//     return new Promise(async (resolve, rejects) => {
//       const resultList = []
//       resultList.push(await getTestAccount('//Es//Admin', initBalance))
//       resultList.push(await getTestAccount('//Es//Bob', initBalance))
//       resultList.push(await getTestAccount('//Es//Jack', initBalance))
//       resultList.push(await getTestAccount('//Es//Charlie', initBalance))
//       resultList.push(await getTestAccount('//Es//Alice', initBalance))
//       resolve(resultList)
//     })
// }

async function new_estimate_for_RANGE () {
  const api = await apiProvider()
  // const genesis = await fetchGenesisAccount()
  const esAdmin = await getTestAccount('//Es//Admin', 1000)
  const current = await getCurrentBlockNumber(api)
  const start = current + 10
  const end = start + 20
  let distribute = end + 20
  const fraction_length = 4
  const fraction = Math.pow(10, fraction_length)
  let symbol = 'btc-usdt'

  console.log(`current_block: ${current}, started_at: ${start}, ended_at: ${end}`)
  const init_reward = 10
  const ticket_price = 10
  // const deviation = (10 / 100) * 1000000
  const options = [10000 * fraction, 20000 * fraction, 30000 * fraction, 40000 * fraction]
  // await newEstimates(api, root, symbol, start, end, distribute, 'RANGE', undefined, options, [{ 'Base': 1 }, { 'Base': 3 }, { 'Base': 5 }], init_reward, ticket_price)
  const estimatesType: EstimatesType = 'RANGE'
  const estimateOption: ParamsOfNewEstimates = {
    symbol,
    start,
    end,
    distribute,
    estimatesType,
    deviation: undefined,
    range: options,
    rangeFraction: fraction_length,
    multiplier: [{ 'Base': 1 }, { 'Base': 3 }, { 'Base': 5 }],
    initReward: balance(init_reward),
    participatePrice: balance(ticket_price)
  }

  await newEstimates(api, esAdmin, estimateOption)
  console.log('Wait for start ..............')
  await sleep(6000 * 10)

  let bscAddress = '0x8365EFb25D0822AaF15Ee1D314147B6a7831C403'

  let participateConfig: ParamsOfParticipateEstimates = {
    symbol,
    estimatesPrice: undefined,
    estimatesType,
    fractionLength: undefined,
    rangeIndex: 0,
    multiplier: { 'Base': 1 },
    bscAddress: bscAddress
  }
  participateConfig.rangeIndex = 0
  await participateEstimates(api, await getTestAccount('//ES//Bob', ticket_price ), participateConfig)
  participateConfig.rangeIndex = 1
  await participateEstimates(api, await getTestAccount('//ES//Charlie', ticket_price ), participateConfig)
  participateConfig.rangeIndex = 2
  await participateEstimates(api, await getTestAccount('//ES//Alice', ticket_price ), participateConfig)
  participateConfig.rangeIndex = 3
  await participateEstimates(api, await getTestAccount('//ES//Jack', ticket_price ), participateConfig)

  await sleep(6000)
}

(async () => {
  const cmdOrder = extractCmdOrder()
  if(cmdOrder['-t'] == 'range'){
    console.log('Will initial range estimates')
    await new_estimate_for_RANGE()
  }else if(cmdOrder['-t'] == 'deviation') {
    console.log('Will initial deviation estimates')
    await new_estimate_for_DEVIATION()
  }else{
    console.log('Error need params in command line `-t=range` or `-t=deviation`')
  }
})().catch(console.error).finally(() => process.exit())
