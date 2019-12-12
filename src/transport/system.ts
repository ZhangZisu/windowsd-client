import chalk from 'chalk'
import { updateDNS } from '../api/dns'
import { updateDeviceLazy } from '../interface/cm'

const logPrefix = chalk.bgGreen.black.underline('System Notification')

export async function handleSystem (msg: any) {
  if (msg.event === 'online') {
    const deviceID = <string>msg.deviceID
    console.log(logPrefix, deviceID, chalk.green('online'))
    try {
      await updateDNS(deviceID)
      updateDeviceLazy(deviceID)
    } catch (e) {
      console.log(logPrefix, deviceID, chalk.red('DO NOT support DNS'))
    }
    return
  }
  if (msg.event === 'offline') {
    const deviceID = <string>msg.deviceID
    console.log(logPrefix, deviceID, chalk.red('offline'))
    updateDeviceLazy(deviceID)
  }
  console.log(logPrefix, msg)
}
