import { apiProvider } from './src/module/commons'
import { extractAuthor } from '@polkadot/api-derive/type/util'
import type { AccountId, BlockNumber, H160, H256, H64, Hash, Header, Index, Justification, KeyValue, SignedBlock, StorageData } from '@polkadot/types/interfaces/runtime';
async  function  main(){
    const api = await apiProvider()
    const allValidators: Record<any, string>= {
        '4SJT3cozQ7Uv31M8A1q5ysarUEtv58xcoA5GgWBnoZ3b7G5w': 'STASH_1',
        '4UHtW2qVT6A993ViBE7hwe4oXG4UX19bmEedw41rvatJjeWC': 'STASH_2',
        '4TfqZ8mc4FpbNF66Qh73dyisEPYYxoY5mn7NE18LqX2AqgLT': 'STASH_3',
        '4RTJuWG29fQKBU8rr3kAc27rTHyzNts6gsqVkJKrrkp18cfb': 'STASH_4',
    }
    // const hash = await api.rpc.chain.getBlockHash(276)
    // const header = await api.rpc.chain.getHeader(hash)
    // header.stateRoot = undefined
    // console.log(header)

    // for (let i = 1; i <= 100; i++) {
    //     const block_number = 600 * i - 101
    //     const hash = await api.rpc.chain.getBlockHash(block_number)
    //     const a = await api.query.electionProviderMultiPhase.queuedSolution.at(hash)
    //     if (a.toHuman()) {
    //         console.log(`block_number: ${block_number}, hash: ${hash}, solution: ${JSON.stringify(a.toHuman())}`)
    //     }
    // }

    for (let i = 0; i < 90000; i++) {
        // @ts-ignore
        // const b = await api.rpc.system.children(hash)
        // const s = b.toHuman()
        // if (s.length > 1) {
        //     let r: Record<string, any> = {}
        //     for (let j = 0; j < s.length; j++) {
        //         const hash = s[j]
        //         r[hash] = {}
        //         const validators = await api.query.session.validators.at(hash)
        //         const block = await api.rpc.chain.getBlock(hash)
        //         const header = block.block.header
        //         const extrinsics = block.block.extrinsics
        //         for (let k = 0; k < extrinsics.length; k++) {
        //             const extrinsic = extrinsics[k]
        //             if (extrinsics[k].method.section === 'timestamp') {
        //                 // @ts-ignore
        //                 const timestamp = extrinsic.method.args[0].toNumber()
        //                 r[hash]['timestamp'] = new Date(timestamp)
        //                 break
        //             }
        //         }
        //         const digest = header.digest
        //         const a = extractAuthor(digest, validators)?.toHuman()
        //         if (!a) {
        //             const alias = allValidators[a!]
        //             r[hash]['author'] = alias
        //         }
        //
        //     }
        //     console.log(`block: ${i} hash: ${hash}, children: ${JSON.stringify(r)}`)
        // }
    }
}

main().catch(console.error).finally(() => process.exit())
