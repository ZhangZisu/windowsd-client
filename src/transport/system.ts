import chalk from 'chalk'
import { invokeRemote } from '../rpc/host'
import { cliArgs } from '../cli'
import { setDNS } from '../api/dns'

const logPrefix = chalk.bgGreen.black.underline('System Notification')

export async function handleSystem (msg: any) {
  if (msg.event === 'online') {
    const deviceID = <string>msg.deviceID
    console.log(logPrefix, deviceID, 'online')
    try {
      const { k, v } = <any> await invokeRemote('dns_upd', { k: cliArgs.hostname, v: cliArgs.device }, { target: deviceID })
      setDNS(k, v)
      console.log('Remote', deviceID, chalk.green('DNS updated'), `${k}->${v}`)
    } catch (e) {
      console.log('Remote', deviceID, chalk.red('DO NOT support DNS'))
    }
    return
  }
  console.log(logPrefix, msg)
}
