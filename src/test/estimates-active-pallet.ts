import {
  apiProvider,
  balance,
  fetchGenesisAccount,
  sleep,
  getCurrentBlockNumber,
  getTestAccount
} from '../module/commons'
import { EstimatesType, ParamsOfNewEstimates, ParamsOfParticipateEstimates } from '../module/estimates'
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


async function init_pallet () {
  const api = await apiProvider()
  const genesis = await fetchGenesisAccount()
  const root = genesis.alice
  const estimates_admin = await getTestAccount('//Es//Admin', 10000)
  console.log(`estimates_admin = ${estimates_admin.address}`)
  let minimumTicketPrice = balance(10)
  let minimumInitReward = balance(10)
  await active(api, root, true)
  await sleep(6000)
  const settingParams = {
    admins: [estimates_admin.address],
      lock: 10,
    minimumTicketPrice: minimumTicketPrice,
    minimumInitReward: minimumInitReward
  }
  console.log(`settingParams = ${settingParams}`)
  await setting(api, root, settingParams)
}

(async () => {
  await init_pallet()
})().catch(console.error).finally(() => process.exit())
