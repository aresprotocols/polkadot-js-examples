import  { apiProvider, balance }  from './src/module/commons'
import { Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { AccountInfo, AccountInfoWithTripleRefCount } from '@polkadot/types/interfaces/system'
// import { FrameSystemAccountInfo } from '@polkadot/api-augment/substrate'

export async function transfer (sender: KeyringPair, accounts: KeyringPair[], amount: number) {
    // Create the API and wait until ready
    const api = await apiProvider()

    // const info = await api.query.system.account(sender.address) as AccountInfoWithTripleRefCount
    // let nonce = info.nonce
    // for (let key in accounts) {
    //     const txHash = await api.tx.balances.transfer(accounts[key].address, balance(amount)).signAndSend(sender, { nonce })
    //     nonce += 1
    //     console.log(`transfer from ${sender.address} to ${key}, balance: ${amount}, hash: ${txHash}`)
    // }

    /*
    const txHash = await api.tx.balances.transfer(spider, balance(200)).signAndSend(alice);
    // Show the hash
    console.log(`Submitted with hash ${txHash}`);

    let proposal = api.tx.balances.transfer(spider, balance(1));
    console.log(`proppsal length: ${proposal.length}`);

    const submittable = await api.tx.council.propose(3, proposal, proposal.length).signAndSend(alice);
    console.log(`Submitted with hash ${submittable}`);


    // let account = await api.query.system.account("EGVQCe73TpFyAZx5uKfE1222XfkT3BSKozjgcqzLBnc5eYo");
    // account.data.free.toHuman()

    // Retrieve the chain & node information information via rpc calls
    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);

    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
    */
}

// module.exports = {
//     transfer
// }
