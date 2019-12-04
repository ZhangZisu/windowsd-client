import io from 'socket.io-client'
import chalk from 'chalk'
import { cliArgs } from '../cli'
import { handleRemote } from '../rpc/host'

const logPrefix = chalk.underline.bgRed.black('Server'.padEnd(8), 'IO')

export const serverConn = io(cliArgs.server, { query: { deviceID: cliArgs.device } })

serverConn.on('connect', () => {
  console.log(logPrefix, chalk.green('Connected'))
})

serverConn.on('error', (e: any) => {
  console.log(logPrefix, chalk.red('Error'))
  console.error(e)
  process.exit(1)
})

serverConn.on('disconnect', () => {
  console.log(logPrefix, chalk.yellow('Disconnected'))
})

serverConn.on('rpc', (msg: any) => {
  handleRemote(msg)
})

export function sendRPC (msg: any) {
  serverConn.emit('rpc', msg)
}
