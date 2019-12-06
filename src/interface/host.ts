import io from 'socket.io'
import { cliArgs } from '../cli'
import chalk from 'chalk'
import { invokeLocal } from '../plugin/host'

const logPrefix = chalk.underline.bgYellow.black('API'.padEnd(8), 'IO')

export const instance = io(cliArgs.api)
console.log(logPrefix, 'listening on', chalk.green(cliArgs.api))

instance.on('connection', (socket) => {
  socket.on('rpc', (msg) => {
    const [asyncID, method, args] = msg
    invokeLocal(method, args, { interface: true })
      .then(result => {
        return socket.emit('rpc', [asyncID, result, null])
      })
      .catch(err => {
        return socket.emit('rpc', [asyncID, null, err.toString()])
      })
  })
})
