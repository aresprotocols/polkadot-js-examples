import {
  apiProvider,
  balance,
  fetchGenesisAccount,
  sleep,
  getCurrentBlockNumber,
  extractCmdOrder
} from '../module/commons'

import { getSubAccount } from '../module/estimates'
import { hexToBigInt, u8aToHex } from '@polkadot/util'

(async () => {
  // let a_symbol = 'ksm-usdt'
  // const a_acc = getSubAccount(a_symbol, )
  // console.log(`${a_symbol} = ${a_acc}`)
  //
  // let b_symbol = 'btc-usdt'
  // const b_acc = getSubAccount(b_symbol)
  // console.log(`${b_symbol} = ${b_acc}`)
  //
  // let c_symbol = 'aave-usdt'
  // const c_acc = getSubAccount(c_symbol)
  // console.log(`${c_symbol} = ${c_acc}`)

  const cmdOrder = extractCmdOrder()
  if(cmdOrder['-s'] &&  cmdOrder['-t']){
    const api = await apiProvider()
    let acc = getSubAccount(cmdOrder['-s'], cmdOrder['-t'])
    const accountData = await api.query.system.account(acc[0])
    // const acc2:any = accountData.toRawType();
    // console.log("accountData.toJSON()", acc2.data )
    // // @ts-ignore
    // hexToBigInt(accountData.toRawType().data.free)
    // console.log("accountData.toJSON()", accountData.toHuman() )
    // // @ts-ignore
    // console.log(`balance free = ${accountData.toHuman().data.free}`)
    // @ts-ignore
    console.log(`Sub account ${cmdOrder['-s']}, ${cmdOrder['-t']} | ss58= ${acc[0]} ,hex= ${acc[1]} free=${accountData.toHuman().data.free}`)
  }else{
    console.log('Error need params need `-s=Symbol`, `-t=range` or `-t=deviation`')
  }

})().catch(console.error).finally(() => process.exit())
