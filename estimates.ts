import { IKeyringPair, ISubmittableResult } from '@polkadot/types/types'
import { KeyringPair } from '@polkadot/keyring/types'
import { ExtrinsicStatus } from '@polkadot/types/interfaces/author/types'

const { apiProvider, sleep, balance } = require('./commons')
const { propose } = require('./council')

/**
 * 创建价格竞猜
 * @param sender 创建人
 * @param symbol 交易对的名称如： btc-usdt
 * @param start 开始的区块高度
 * @param end 结束的区块高度. end > start
 * @param distribute 发放奖励的高度。distribute > end
 * @param estimatesType 价格竞猜的类型："DEVIATION" 或者 "RANGE"
 * @param deviation 如果 estimatesType 是 DEVIATION，该参数不能为空。价格偏差范围。最大值是：1000000；如：设置50%的价格浮动(竞猜结束时中奖价格的浮动范围是上下50%)，可以填500000，如果是1‰(千分之一)的价格浮动，那么可以填1000(100万的千分一)，其它以此类推。
 * @param range 如果 estimatesType 是 RANGE，该参数不能为空。价格竞猜的选项。例如：range=[1000,2000,3000,4000]. 那么前端展示的可选项：[price<=2000, 2000<price<=3000, 3000<price<=4000, price>4000]
 * @param participatePrice 参与竞猜需要的金额
 * */
async function newEstimates (sender: KeyringPair, symbol: string, start: number, end: number, distribute: number, estimatesType: string, deviation: number, range: Array<number> | undefined, participatePrice: number) {
  const api = await apiProvider()

  const unsub = await api.tx.estimates.newEstimates(symbol, start, end, distribute, estimatesType, deviation, range, participatePrice)
    .signAndSend(sender, ({ status, events, dispatchError }: ISubmittableResult) => {
      if (dispatchError) {
        if (dispatchError.isModule) {
          // for module errors, we have the section indexed, lookup
          const decoded = api.registry.findMetaError(dispatchError.asModule)
          const { docs, name, section } = decoded

          console.log(`${section}.${name}: ${docs.join(' ')}`)
        }
        console.log(`${dispatchError}`)
      }

      console.log(`newEstimates Current status is ${status}`)
      if (status.isInBlock) {
        console.log(`newEstimates Transaction included at blockHash ${status.asInBlock}`)
      } else if (status.isFinalized) {
        console.log(`newEstimates Transaction finalized at blockHash ${status.asFinalized}`)
        unsub()
      }
    })
  //console.log(`new_estimates hash: ${txH}`);
}

/**
 * 参与价格竞猜。
 * @param sender 参与人
 * @param symbol 交易对名称如： btc-usdt
 * @param estimatesPrice 如果 estimatesType 是 DEVIATION，该参数不能为空. 预测价格在结束区块高度时候的价格。
 * @param rangeIndex 如果 estimatesType 是 RANGE，该参数不能为空. 需要参与的价格范围序号。参考 newEstimates中的参数range说明。
 * @param multiplier 倍数。只有3个值可填: ["Base1","Base2", "Base5"]
 * @param bsc_address 接收发放奖励的BSC地址。
 * */
async function participateEstimates (sender: KeyringPair, symbol: string, estimatesPrice: number, rangeIndex: number, multiplier: 'Base1' | 'Base2' | 'Base5', bsc_address: string) {
  const api = await apiProvider()
  const unsub = await api.tx.estimates.participateEstimates(symbol, estimatesPrice, rangeIndex, multiplier, bsc_address)
    .signAndSend(sender, ({ status, dispatchError }: ISubmittableResult) => {
      if (dispatchError) {
        if (dispatchError.isModule) {
          // for module errors, we have the section indexed, lookup
          const decoded = api.registry.findMetaError(dispatchError.asModule)
          const { docs, name, section } = decoded

          console.log(`${section}.${name}: ${docs.join(' ')}`)
        }
        console.log(`${dispatchError}`)
      }
      console.log(`participateEstimates Current status is ${status}`)
      if (status.isInBlock) {
        console.log(`participateEstimates Transaction included at blockHash ${status.asInBlock}`)
      } else if (status.isFinalized) {
        console.log(`participateEstimates Transaction finalized at blockHash ${status.asFinalized}`)
        unsub()
      }
    })
}

async function queryActiveEstimates (symbol: string) {
  const api = await apiProvider()
  let configs = await api.query.estimates.activeEstimates(symbol)
  console.log(`======价格竞猜${symbol} 进行中======`)
  console.log(JSON.stringify(configs.toHuman()))
  console.log(`========================`)
}

async function queryPreparedEstimates (symbol: string) {
  const api = await apiProvider()
  let configs = await api.query.estimates.preparedEstimates(symbol)
  console.log(`======价格竞猜${symbol} 预告区======`)
  console.log(JSON.stringify(configs.toHuman()))
  console.log(`========================`)
}

async function queryCompletedEstimates (symbol: string) {
  const api = await apiProvider()
  let configs = await api.query.estimates.completedEstimates(symbol)
  console.log(`======价格竞猜${symbol} 已完成======`)
  console.log(JSON.stringify(configs.toHuman()))
  console.log(`========================`)
  return JSON.stringify(configs.toHuman())
}

async function queryParticipants (symbol: string, roundId: number) {
  const api = await apiProvider()
  let keys = await api.query.estimates.participants.keys(symbol)
  console.log(`======价格竞猜${symbol} 参与者======`)
  for (let i = 0; i < keys.length; i++) {
    let args = keys[i].args
    console.log(`${args[0].toHuman()}  ${args[1].toHuman()}`)
    let a = await api.query.estimates.participants(args[0], args[1])
    console.log(JSON.stringify(a.toHuman()))
  }
  // keys.map(async (key, index) => {
  //     let args = key.args;
  //     console.log(`${args[0].toHuman()}  ${args[1].toHuman()}`)
  //     let a = await api.query.estimates.participants(args[0], args[1])
  //     console.log(JSON.stringify(a.toHuman()))
  // })
  console.log(`========================`)
}

async function queryWinners (symbol: string, roundId: number) {
  const api = await apiProvider()
  console.log(`======价格竞猜${symbol} 中奖人======`)
  let keys = await api.query.estimates.winners.keys(symbol)
  for (let i = 0; i < keys.length; i++) {
    let args = keys[i].args
    console.log(`${args[0].toHuman()}  ${args[1].toHuman()}`)

    let a = await api.query.estimates.winners(args[0], args[1])
    console.log(JSON.stringify(a.toHuman()))
  }
  console.log(`========================`)
}

module.exports = {
  newEstimates,
  participateEstimates,
  queryActiveEstimates,
  queryPreparedEstimates,
  queryCompletedEstimates,
  queryParticipants,
  queryWinners,
}
