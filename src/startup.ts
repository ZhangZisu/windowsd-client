import chalk from 'chalk'

import { updateDeviceLazy } from '@/interface/cm'
import { cliArgs } from '@/shared/cli'
import { invoke, localHost, startupDone } from '@/router'
import { updateDNS } from './interface/dns'

const logPrefix = chalk.green('Startup')

async function startup () {
  await localHost.disableMaintance(true)
  localHost.builtin.register('enable_maintance', localHost.enableMaintance)
  localHost.builtin.register('disable_maintance', async function (args) {
    const { loadAll } = args
    if (typeof loadAll !== 'boolean') throw new Error('Bad Arg: loadAll')
    return localHost.disableMaintance(loadAll)
  })
  localHost.builtin.register('is_maintance', localHost.isMaintance)

  localHost.builtin.register('list_plugins', localHost.listPlugins)
  localHost.builtin.register('active_plugin', async function (args) {
    const { id } = args
    if (typeof id !== 'string') throw new Error('Bad Arg: id')
    return localHost.activePlugin(id)
  })
  localHost.builtin.register('deactive_plugin', async function (args) {
    const { id } = args
    if (typeof id !== 'string') throw new Error('Bad Arg: id')
    return localHost.deactivePlugin(id)
  })

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
