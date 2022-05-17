import { apiProvider } from './commons'
import { propose } from './council'
import { blake2AsHex, base64Decode } from '@polkadot/util-crypto'
import { decodePair } from '@polkadot/keyring/pair/decode'
import { KeyringPair } from '@polkadot/keyring/types'
import { BN } from '@polkadot/util'
import { ValidatorPrefsWithBlocked } from '@polkadot/types/interfaces/staking/types'
import type { ValidatorPrefs } from '@polkadot/types/interfaces/staking/types'
import { Compact } from '@polkadot/types'
import { Perbill } from '@polkadot/types/interfaces'
const councilMembers = 6

/**
 * 1/2的通过率
 * */
export async function bond (controller: KeyringPair, stash: KeyringPair, value: BN) {
  const api = await apiProvider()

  const txHash = await api.tx.staking.bond(controller.address, value, 'Staked').signAndSend(stash)
  // const txHash = api.tx.staking.bond(controller.address, value, 'Staked').sign(stash)
  console.log(`submit staking.bond: ${txHash}`)
}

export async function bondMore (stash: KeyringPair, value: BN) {
  const api = await apiProvider()
  const txHash = await api.tx.staking.bondExtra(value).signAndSend(stash)
  console.log(`submit staking.bondExtra: ${txHash}`)
}

export async function setSessionKeys (controller: KeyringPair, keys: Uint8Array) {
  const api = await apiProvider()
  const EMPTY_PROOF = new Uint8Array()
  const txHash = await api.tx.session.setKeys(keys, '').signAndSend(controller)
  console.log(`submit session.setKeys: ${txHash}`)
}

export async function setValidatorPreferences (controller: KeyringPair, commission: any) {
  const api = await apiProvider()
  // const b: Compact<Perbill> =
  // const a: ValidatorPrefs = {
  //   blocked: false,
  //   commission: Compact<Perbill>
  //
  // };
  const txHash = await api.tx.staking.validate({ commission: commission, blocked: false }).signAndSend(controller)
  console.log(`submit staking.validate: ${txHash}`)
}

export async function vote (controller: KeyringPair, destStashAccounts: string[]) {
  const api = await apiProvider()
  const txHash = await api.tx.staking.nominate(destStashAccounts).signAndSend(controller)
  console.log(`submit staking.nominate: ${txHash}`)
}

export async function setValidatorCount (sudoAccount: KeyringPair, count: number) {
  const api = await apiProvider()
  const unsub = await api.tx.sudo.sudo(
    api.tx.staking.setValidatorCount(count)
  ).signAndSend(sudoAccount)

  console.log(`submit sudo/staking.setValidatorCount: ${unsub}`)
}

export async function stop (controller: KeyringPair) {
  const api = await apiProvider()
  const txHash = await api.tx.staking.chill().signAndSend(controller)
  console.log(`submit staking.chill: ${txHash}`)
}

module.exports = {
  bond,
  bondMore,
  vote,
  setSessionKeys,
  setValidatorPreferences,
  setValidatorCount,
  stop,
}
