import io from 'socket.io'
import { cliArgs } from '../cli'
import chalk from 'chalk'

type APIFn = (args: any) => void
const fns: Map<string, APIFn> = new Map()

export function register (name: string, fn: APIFn) {
  if (fns.has(name)) throw new Error('Duplicate fn registeration')
  fns.set(name, fn)
}

const logPrefix = chalk.underline.bgYellow.black('API'.padEnd(8), 'IO')

export const instance = io(cliArgs.api)
console.log(logPrefix, 'listening on', chalk.green(cliArgs.api))

instance.on('connection', (socket) => {
  socket.on('rpc', (msg) => {
    const [asyncID, method, args] = msg
    const fn = fns.get(method)
    if (!fn) {
      socket.emit('rpc', [asyncID, null, 'No such method'])
    } else {
      Promise.resolve(fn(args))
        .then(result => {
          return socket.emit('rpc', [asyncID, result, null])
        })
        .catch(err => {
          return socket.emit('rpc', [asyncID, null, err.toString()])
        })
    }
  })
})
