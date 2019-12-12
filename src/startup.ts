import chalk from 'chalk'

import { invokeRemote } from '@/rpc'
import { updateDNS } from '@/api/dns'
import { updateDeviceLazy } from '@/interface/cm'
import { cliArgs } from '@/cli'

const logPrefix = chalk.green('Startup')

async function startup () {
  try {
    const devices = <{ id: string, allowRPC: boolean }[]> await invokeRemote('list_devices', {}, {})
    console.table(devices)
    for (const { id } of devices) {
      if (id === cliArgs.device) continue
      try {
        await updateDNS(id)
        updateDeviceLazy(id)
      } catch (e) {
        console.log(logPrefix, id, chalk.red('DO NOT support DNS'))
      }
    }
  } catch (e) {
    console.log(logPrefix, 'RPC disabled')
  }
}

startup().then(() => {
  console.log(logPrefix, 'done')
}).catch(err => {
  console.error(err)
  process.exit(1)
})
