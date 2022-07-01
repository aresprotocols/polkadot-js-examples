import { apiProvider, sleep, balance } from './src/module/commons'
import { KeyringPair } from '@polkadot/keyring/types'
import { Proposal } from '@polkadot/types/interfaces/democracy'
import { AccountInfo } from '@polkadot/types/interfaces/system/types'
import { Vec } from '@polkadot/types'
import { H256 } from '@polkadot/types/interfaces/runtime'

export async function submitCandidacy (accounts: KeyringPair[]) {
    const api = await apiProvider()
    const candidates = await api.query.elections.candidates
    let candidatesLength = candidates.length
    for (let key in accounts) {
        // if (key === 'root') continue
        const txHash = await api.tx.elections.submitCandidacy(candidatesLength).signAndSend(accounts[key])
        console.log(`account: ${key}, candidates length: ${candidatesLength}, hash: ${txHash}`)
        candidatesLength += 1
    }
}

export async function voteCandidate (accounts: KeyringPair[]) {
    const api = await apiProvider()
    for (let key in accounts) {
        // if (key === 'root') continue
        const account = accounts[key]
        const txHash = await api.tx.elections.vote([account.address], balance(500)).signAndSend(account)
        console.log(`account: ${key} vote, hash: ${txHash}`)
    }
}

export async function renounceCandidacy (account: KeyringPair) {
    const api = await apiProvider()
    const info = (await api.query.system.account(account.address) as AccountInfo)
    let nonce = info.nonce.toNumber()

    let txHash = await api.tx.elections.renounceCandidacy('RunnerUp').signAndSend(account, { nonce })
    console.log(`account: ${account.meta.name} renounce Candidacy. tx: ${txHash}`)

    txHash = await api.tx.elections.removeVoter().signAndSend(account, { nonce: nonce + 1 })
    console.log(`account: ${account.meta.name} remove voter. tx: ${txHash}`)
}

export async function propose (account: KeyringPair, call: Uint8Array, threshold: number = 3) {
    const api = await apiProvider()
    // const call = api.tx.system.remark(remark)
    // console.log(`call length: ${call.length}. call hash: ${call.hash.toHex()}`)

    const tx = await api.tx.council.propose(threshold, call, call.length).signAndSend(account)
    console.log(`tx hash: ${tx}`)
    // await sleep(3500)
    // const proposals = await api.query.council.proposals()
    // if (proposals.length > 0) {
    //     console.log(`proposal hash: ${proposals[proposals.length - 1]}`)
    //     return proposals[proposals.length - 1]
    // }
    // return ''
}

/**
 * @see  node_modules/@polkadot/api-augment/substrate/query.d.ts
 * */
export async function voteAll (accounts: KeyringPair[]) {
    const api = await apiProvider()

    const proposals = (await api.query.council.proposals() as Vec<H256>)
    for (let i = 0; i < proposals.length; i++) {
        const hash = proposals[i]
        const voting = await api.query.council.voting(hash)
        const temp = JSON.parse(voting.toString())
        const threshold = temp.threshold
        // console.log(`hash: ${hash}, index:${voting}`)
        // console.log(`hash: ${hash.toHex()}, index:${temp.index}`)
        let count = 0
        for (const key in accounts) {
            if (count < threshold) {
                await api.tx.council.vote(hash, temp.index, true).signAndSend(accounts[key])
                count++
            }
        }
        await sleep(3000)
    }
}
