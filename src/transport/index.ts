import io from 'socket.io-client'
import chalk from 'chalk'

import { cliArgs } from '@/cli'
import { handleRemote } from '@/rpc'
import { logTransportIO } from '@/misc/logger'
import { handleSystem } from '@/transport/system'

export const serverConn = io(cliArgs.server, { query: { deviceID: cliArgs.device } })

serverConn.on('connect', () => {
  logTransportIO(chalk.green('Connected'))
})

serverConn.on('error', (e: any) => {
  logTransportIO(chalk.red('Error'))
  console.error(e)
  process.exit(1)
})

serverConn.on('disconnect', () => {
  logTransportIO(chalk.yellow('Disconnected'))
})

serverConn.on('rpc', (msg: any) => {
  handleRemote(msg)
})

export function sendRPC (msg: any) {
  serverConn.emit('rpc', msg)
}

serverConn.on('system', handleSystem)
