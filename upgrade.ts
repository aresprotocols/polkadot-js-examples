import { apiProvider } from './commons'
import { ISubmittableResult } from '@polkadot/types/types'
import { KeyringPair } from '@polkadot/keyring/types'

async function upgrade (admin: KeyringPair, code: string) {
  const api = await apiProvider()
  // const adminId = await api.query.sudo.key()

  // Find the actual keypair in the keyring (if this is a changed value, the key
  // needs to be added to the keyring before - this assumes we have defaults, i.e.
  // Alice as the key - and this already exists on the test keyring)
  // const keyring = testKeyring.default()
  // const adminPair = keyring.getPair(adminId.toString())

  // Retrieve the runtime to upgrade
  // const code = fs.readFileSync('./test.wasm').toString('hex')
  const header = await api.rpc.chain.getHeader()
  const blockNumber = header.number.toNumber()

  const proposal = api.tx.system && api.tx.system.setCode
    ? api.tx.system.setCode(`0x${code}`) // For newer versions of Substrate
    : api.tx.consensus.setCode(`0x${code}`) // For previous versions

  const scheduler = api.tx.scheduler.schedule(blockNumber + 3, null, 0, proposal)

  console.log(`Upgrading from ${admin.address}, ${code.length / 2} bytes`)
  // Perform the actual chain upgrade via the sudo module
  await api.tx.sudo
    .sudo(scheduler)
    .signAndSend(admin, ({ events, status }: ISubmittableResult) => {
      console.log('Proposal status:', status.type)

      if (status.isInBlock) {
        console.error('You have just upgraded your chain')

        console.log('Included at block hash', status.asInBlock.toHex())
        console.log('Events:')

        // @ts-ignore
        console.log(JSON.stringify(events.toHuman(), null, 2))
      } else if (status.isFinalized) {
        console.log('Finalized block hash', status.asFinalized.toHex())
      }
    })
}

module.exports = {
  upgrade
}
