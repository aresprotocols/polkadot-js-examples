import  { apiProvider, balance }  from './src/module/commons'
import  { propose } from './council'
import { blake2AsHex } from '@polkadot/util-crypto'
import { KeyringPair } from '@polkadot/keyring/types'

const councilMembers = 6

/**
 * 1/2的通过率
 * */
export async function externalPropose (account: KeyringPair) {
    const api = await apiProvider()

    const encodedProposal = api.tx.balances.forceTransfer(account.address, '5Gy3nhvpnuzzNBVcXk2PRaxvXr6JYXCdkfkYLn3X1XdRu1MR', balance(1)).method.toHex()
    const preimageHash = blake2AsHex(encodedProposal)
    await api.tx.democracy.noteImminentPreimage(preimageHash).signAndSend(account)
    console.log(`submit preimageHash: ${preimageHash}`)

    const exPropose = api.tx.democracy.externalPropose(preimageHash)
    const proposeHash = await propose(account, exPropose.data, 3)
    console.log(`submit propose`)
}

/**
 * 100%的通过率
 * */
export async function externalProposeDefault (account: KeyringPair) {
    const api = await apiProvider()

    const encodedProposal = api.tx.balances.forceTransfer(account.address, '5Gy3nhvpnuzzNBVcXk2PRaxvXr6JYXCdkfkYLn3X1XdRu1MR', balance(2)).method.toHex()
    const preimageHash = blake2AsHex(encodedProposal)
    await api.tx.democracy.noteImminentPreimage(preimageHash).signAndSend(account)
    console.log(`submit preimageHash: ${preimageHash}`)

    const exPropose = api.tx.democracy.externalProposeDefault(preimageHash)
    await propose(account, exPropose.data, 6)
    console.log(`submit propose`)
}

/**
 * 3/4的通过率
 * */
export async function externalProposeMajority (account: KeyringPair) {
    const api = await apiProvider()

    const encodedProposal = api.tx.balances.forceTransfer(account.address, '5Gy3nhvpnuzzNBVcXk2PRaxvXr6JYXCdkfkYLn3X1XdRu1MR', balance(3)).method.toHex()
    const preimageHash = blake2AsHex(encodedProposal)
    await api.tx.democracy.noteImminentPreimage(preimageHash).signAndSend(account)
    console.log(`submit preimageHash: ${preimageHash}`)

    const exPropose = api.tx.democracy.externalProposeMajority(preimageHash)
    await propose(account, exPropose.data, 5)
    console.log(`submit propose`)
}

