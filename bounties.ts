import { apiProvider, balance } from './src/module/commons'
import { Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { Vec } from '@polkadot/types-codec'
import { AccountId32 } from '@polkadot/types/interfaces/runtime'

const bountyIndex = 1

//step-1
export async function addBounty (sender: KeyringPair) {
  const api = await apiProvider()
  const txHash = await api.tx.bounties.proposeBounty(balance(2000), 'test-a').signAndSend(sender)
  console.log(`account: ${sender.meta.name} propose a bounty, hash: ${txHash}`)
}

//step-2
export async function proposeApproveBounty (councilMember: KeyringPair) {
  const api = await apiProvider()
  const proposal = api.tx.bounties.approveBounty(bountyIndex)
  console.log(`proposal length: ${proposal.length}`)
  const members = (await api.query.council.members() as Vec<AccountId32>)
  const threshold = Math.ceil(members.length * 3 / 5)
  /**
   * proposal的 threshold 取值，取决于runtime里面的ApproveOrigin的设置。
   * 当前配置是委员会的3/5才允许提案通过。
   * */
  const txHash = await api.tx.council.propose(threshold, proposal, proposal.length).signAndSend(councilMember)
  console.log(`council member: ${councilMember.meta.name} propose a approve bounty. threshold:${threshold}, hash: ${txHash}`)
}

//step-3
export async function proposeCurator (councilMember: KeyringPair, curator: KeyringPair, curatorFee: number = 50) {
  const api = await apiProvider()
  const proposal = api.tx.bounties.proposeCurator(bountyIndex, curator.address, balance(curatorFee))
  console.log(`proposal length: ${proposal.length}`)

  const members = (await api.query.council.members() as Vec<AccountId32>)
  const threshold = Math.ceil(members.length * 3 / 5)
  /**
   * threshold 取值同上
   * */
  const txHash = await api.tx.council.propose(threshold, proposal, proposal.length).signAndSend(councilMember)
  console.log(`
    council member: ${councilMember.meta.name} propose a curator:${curator.meta.name}. 
    curator fee:${curatorFee} threshold:${threshold}, hash: ${txHash}
    `)
}

/**
 * curator接受后，委员会成员可以随时发起提议惩罚curator
 * */
//step-4
export async function curatorAccept (curator: KeyringPair) {
  const api = await apiProvider()
  const txHash = await api.tx.bounties.acceptCurator(bountyIndex).signAndSend(curator)
  console.log(`curator:${curator.meta.name} accept. hash: ${txHash}`)
}

/**
 * 确定了任务的实际 执行人beneficiary 之后，过了一个周期内(配置多少个块)后，beneficiary才能claim。
 * **/
//step-5
export async function rewardImplementer (curator: KeyringPair, beneficiary: KeyringPair) {
  const api = await apiProvider()
  const txHash = await api.tx.bounties.awardBounty(bountyIndex, beneficiary.address).signAndSend(curator)
  console.log(`curator:${curator.meta.name} select beneficiary:${beneficiary.meta.name}. hash: ${txHash}`)
}

//step-6
export async function claim (beneficiary: KeyringPair) {
  const api = await apiProvider()
  const txHash = await api.tx.bounties.claimBounty(bountyIndex).signAndSend(beneficiary)
  console.log(`beneficiary:${beneficiary.meta.name} claim. hash: ${txHash}`)
}
