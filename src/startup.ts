import chalk from 'chalk'

import { updateDeviceLazy } from '@/interface/cm'
import { cliArgs } from '@/shared/cli'
import { invoke, localHost, startupDone } from '@/router'
import { updateDNS } from './interface/dns'
import { logStartup } from './shared/logger'

async function startup () {
  await localHost.disableMaintance(true)

  startupDone()

  try {
    const devices = <{ id: string, allowRPC: boolean }[]> await invoke('list_devices', {}, {})
    console.table(devices)
    for (const { id } of devices) {
      if (id === cliArgs.device) continue
      try {
        updateDeviceLazy(id)
        await updateDNS(id)
      } catch (e) {
        logStartup(id, chalk.red('DO NOT support DNS'))
      }
    }
  } catch (e) {
    console.log(e)
    logStartup('RPC disabled')
  }
}

startup().then(() => {
  logStartup('done')
}).catch(err => {
  logStartup(err)
  process.exit(1)
})
