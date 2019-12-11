import chalk from 'chalk'
import { updateDNS } from '../api/dns'

const logPrefix = chalk.bgGreen.black.underline('System Notification')

export async function handleSystem (msg: any) {
  if (msg.event === 'online') {
    const deviceID = <string>msg.deviceID
    console.log(logPrefix, deviceID, chalk.green('online'))
    try {
      await updateDNS(deviceID)
    } catch (e) {
      console.log(logPrefix, deviceID, chalk.red('DO NOT support DNS'))
    }
    return
  }
  if (msg.event === 'offline') {
    console.log(logPrefix, msg.deviceID, chalk.red('offline'))
  }
  console.log(logPrefix, msg)
}
