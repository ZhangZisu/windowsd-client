import chalk from 'chalk'
import { invokeRemote } from './rpc'
import { updateDNS } from './api/dns'

const logPrefix = chalk.green('Startup')

async function startup () {
  const devices = <{ id: string, allowRPC: boolean }[]> await invokeRemote('list_devices', {}, {})
  console.table(devices)
  for (const { id } of devices) {
    try {
      await updateDNS(id)
    } catch (e) {
      console.log(logPrefix, id, chalk.red('DO NOT support DNS'))
    }
  }
}

startup().then(() => {
  console.log(logPrefix, 'done')
}).catch(err => {
  console.error(err)
  process.exit(1)
})
