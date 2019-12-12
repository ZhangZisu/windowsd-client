import chalk from 'chalk'

import { updateDNS } from '@/api/dns'
import { updateDeviceLazy } from '@/interface/cm'
import { logTransportSystem } from '@/misc/logger'

export async function handleSystem (msg: any) {
  if (msg.event === 'online') {
    const deviceID = <string>msg.deviceID
    logTransportSystem(deviceID, chalk.green('online'))
    try {
      await updateDNS(deviceID)
      updateDeviceLazy(deviceID)
    } catch (e) {
      logTransportSystem(deviceID, chalk.red('DO NOT support DNS'))
    }
    return
  }
  if (msg.event === 'offline') {
    const deviceID = <string>msg.deviceID
    logTransportSystem(deviceID, chalk.red('offline'))
    updateDeviceLazy(deviceID)
    return
  }
  logTransportSystem(msg)
}
