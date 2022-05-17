import { apiProvider } from './commons'
import { extractAuthor } from '@polkadot/api-derive/type/util'
import type {
  AccountId,
  BlockNumber,
  H160,
  H256,
  H64,
  Hash,
  Header,
  Index,
  Justification,
  KeyValue,
  SignedBlock,
  StorageData,
} from '@polkadot/types/interfaces/runtime'
import { u8aToHex } from '@polkadot/util'
import { Keyring } from '@polkadot/api'

const keyring = new Keyring({ type: 'sr25519' })

class Block {
  block: number
  hash: string

  constructor (block: number, hash: string) {
    this.block = block
    this.hash = hash
  }
}

class ElectionPhase {
  era: number
  // signedPhase create snapshot
  signed: Block
  // UnsignedPhaseStarted+1 store queueSolution
  // voter read from storage snapshot
  unSigned: Block

  constructor (era: number, signed: Block, unSigned: Block) {
    this.era = era
    this.signed = signed
    this.unSigned = unSigned
  }

}

async function main () {
  const api = await apiProvider()
  const phase = new ElectionPhase(1803,
    new Block(1080050, '0x7b5c0e5b9e9bc5df394fdd141393c46983003f3fe249c4f92db9c6d12e546ab0'),
    new Block(1080077, '0x74da9773ffb841e648757abaab2ff9dae5f9958d0ca33153cf83aed76b908aeb')
  )
  //4UHtW2qVT6A993ViBE7hwe4oXG4UX19bmEedw41rvatJjeWC   0x70214e02fb2ec155a4c7bb8c122864b3b03f58c4ac59e8d83af7dc29851df657
  const validator = '4Rma6tk2UtaGxPh5dozPz4DVFM2R4wK4iZtXP4kXzKqMv27F'
  // const validator = '4UHtW2qVT6A993ViBE7hwe4oXG4UX19bmEedw41rvatJjeWC'
  const nominator = '4SaqfpkVNvdEstHNWW1C2BmCDJETaKmEAd26KSXDADvLfrjn'
  // retrieve all exposures for the active era
  /**
   * SequentialPhragmen::solve(to_elect, targets, voters)
   * to_elect:  from electionProviderMultiPhase::desired_targets()
   * targets: snapshot.targets()
   * voters: snapshot.voters()
   * **/
    // const exposures = await api.query.staking.erasStakers.at(blocks[1170100].hash, blocks[1170100].era, validator)
    // const nominations = await api.query.staking.nominators.at(blocks[1170100].hash, nominator)

  let snapshot = await api.query.electionProviderMultiPhase.snapshot.at('0x55494bed37dad11d0ecd5bcedfc740cf9b5cea1d12c3b835e6d136ba83c5537f')
  console.log('===========  snapshot  731250 ===========')
  console.log(snapshot.toJSON())
  console.log('===========')

  snapshot = await api.query.electionProviderMultiPhase.snapshot.at('0xaff7206a4498613ccc146bdd2b2054d187b48bfb9433012bfba3174a43a3d70b')
  console.log('===========  snapshot  731850 ===========')
  console.log(snapshot.toJSON())
  console.log('===========')

  let bagsList = await api.rpc.state.getKeys('0xdf66cf37cde77d2a63889732a23c685e62556a85fcb7c61b2c6c750924846b15', '0xaff7206a4498613ccc146bdd2b2054d187b48bfb9433012bfba3174a43a3d70b')
  console.log('===========  state.getKeys(bagsList::listNodes) 731850 ===========')
  for (let i = 0; i < bagsList.length; i++) {
    const pk = bagsList[i].slice(bagsList[i].length - 32, bagsList[i].length)
    console.log(keyring.encodeAddress(pk, 34))
  }
  console.log('===========')

  // const bagsList = await api.rpc.state.getKeys('0xdf66cf37cde77d2a63889732a23c685e62556a85fcb7c61b2c6c750924846b15', '0x55494bed37dad11d0ecd5bcedfc740cf9b5cea1d12c3b835e6d136ba83c5537f')
  // console.log('===========  state.getKeys(bagsList::listNodes) 731250 ===========')
  // for (let i = 0; i < bagsList.length; i++) {
  //   const pk = bagsList[i].slice(bagsList[i].length - 32, bagsList[i].length)
  //   console.log(keyring.encodeAddress(pk, 34))
  // }
  // console.log('===========')

  // bagsList = await api.rpc.state.getKeys('0xdf66cf37cde77d2a63889732a23c685e62556a85fcb7c61b2c6c750924846b15', '0x0e63fd914691c7296a54a81aa76fd96a91fae9bd688baa045b8d7a2498bb0d98')
  // console.log('===========  state.getKeys(bagsList::listNodes) 1141904 ===========')
  // for (let i = 0; i < bagsList.length; i++) {
  //   const pk = bagsList[i].slice(bagsList[i].length - 32, bagsList[i].length)
  //   console.log(keyring.encodeAddress(pk, 34))
  // }
  // console.log('===========')

  // const nominatorKeys = await api.rpc.state.getKeys('0x5f3e4907f716ac89b6347d15ececedca9c6a637f62ae2af1c7e31eed7e96be04', phase.signed.hash)
  // console.log('===========  state.getKeys(nominators) ===========')
  // // 4VSVRmYPz89qECmyFUPY3E7NQFSpZvk6ehewCEV4zYJDYw1X
  // // 4PumqeGJSN3xgzDrnNLZ27hgstgiaeW2odJWytbxbv3uV22E
  // // 4QnL7uHjgcfrjQXKcZ1A6ovxzwzrPRHHLZeMFTojSR3wsTaf
  // // 4TXDJVZtuwCZhaX5shaennRgRyGx7CJ9H2zgow2FKaFsMQSp
  // for (let i = 0; i < nominatorKeys.length; i++) {
  //   const pk = nominatorKeys[i].slice(nominatorKeys[i].length - 32, nominatorKeys[i].length)
  //   console.log(keyring.encodeAddress(pk, 34))
  // }
  // console.log('===========')

  // const nominations = await api.query.staking.nominators.at(phase.signed.hash, nominator)
  // console.log(`===========  nominators ${nominator} ===========`)
  // console.log(nominations.toJSON())
  // console.log('===========')
  // const solution = await api.query.electionProviderMultiPhase.queuedSolution.at(phase.unSigned.hash)
  // console.log('===========  solution  ===========')
  // console.log(JSON.stringify(solution.toJSON()))
  // console.log('===========')

  // const keys = await api.rpc.state.getKeys('0x5f3e4907f716ac89b6347d15ececedcaab6a212bc08a5603828f33f90ec4a139', phase.unSigned.hash)
  // console.log('===========  state.getKeys(slashingSpans) ===========')
  // for (let i = 0; i < keys.length; i++) {
  //   const pk = keys[i].slice(keys[i].length - 32, keys[i].length)
  //   console.log(keyring.encodeAddress(pk, 34))
  // }
  // console.log('===========')

  // const a = exposures.toJSON()
  // // @ts-ignore
  // // console.log(`validator voter(others): ${JSON.stringify(a['others'])}`)
  // console.log(nominations.toJSON())
  await api.disconnect()
}

main().catch(console.error).finally(() => process.exit())
