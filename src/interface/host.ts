import io from 'socket.io'
import chalk from 'chalk'
import { invokeLocal } from '../plugin/host'
import { invokeRemote } from '../rpc/host'
import { resolveDNS } from '../api/dns'
import { server } from './http'
import { cliArgs } from '../cli'

const logPrefix = chalk.bgYellow.black('Interface Host')

export const instance = io(server)

instance.use((socket, cb) => {
  const deviceID = socket.handshake.query.deviceID
  if (deviceID !== cliArgs.device) return cb(new Error('Bad invoker'))
  cb()
})

instance.on('connection', (socket) => {
  console.log(logPrefix, socket.id, socket.request.headers['user-agent'])
  socket.on('rpc', (msg) => {
    const [asyncID, method, args, cfg] = msg
    let p: Promise<any>
    if (cfg.local) {
      p = invokeLocal(method, args, { interface: true })
    } else {
      if (cfg.target) {
        const target = resolveDNS(cfg.target)
        if (!target) return <unknown>socket.emit('rpc', [asyncID, null, 'DNS resolve failed'])
        p = invokeRemote(method, args, { target, interface: true })
      } else {
        p = invokeRemote(method, args, { interface: true })
      }
    }
    p.then(result => {
      return socket.emit('rpc', [asyncID, result, null])
    }).catch(err => {
      return socket.emit('rpc', [asyncID, null, err.toString()])
    })
  })
  socket.on('disconnect', () => {
    console.log(logPrefix, socket.id, 'offline')
  })
})
