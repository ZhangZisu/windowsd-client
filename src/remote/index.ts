import io from 'socket.io-client'
import chalk from 'chalk'
import uuid from 'uuid/v4'

import { RPCHost, Invoker } from '@/shared/rpcbase'
import { cliArgs } from '@/cli'
import { logRemoteIO } from '@/shared/logger'
import { bus } from '@/shared/bus'

export class RemoteHost extends RPCHost {
  private conn: SocketIOClient.Socket
  private cbs: Map<string, (result: any, error?: Error) => void> = new Map()

  constructor (invoker: Invoker) {
    super(invoker)
    this.conn = io(cliArgs.server, { query: { deviceID: cliArgs.device } })
    this.conn.on('connect', () => {
      logRemoteIO(chalk.green('Connected'))
    })

    this.conn.on('error', (e: any) => {
      logRemoteIO(chalk.red('Error'))
      console.error(e)
      process.exit(1)
    })

    this.conn.on('disconnect', () => {
      logRemoteIO(chalk.yellow('Disconnected'))
    })

    this.conn.on('rpc', this.handle.bind(this))

    this.conn.on('system', (...msg:any) => bus.emit('system', ...msg))
  }

  invoke (method: string, args: any, cfg: any) {
    return new Promise((resolve, reject) => {
      const asyncID = uuid()
      this.cbs.set(asyncID, (result, error) => {
        this.cbs.delete(asyncID)
        if (error) return reject(error)
        return resolve(result)
      })
      this.send([asyncID, method, args, cfg])
    })
  }

  private handle (msg: any) {
    if (msg instanceof Array) {
      if (msg.length === 4) {
        // Request
        const [asyncID, method, args, cfg] = msg
        return this.handleRequest(asyncID, method, args, cfg)
      } else if (msg.length === 3) {
        // Response
        const [asyncID, result, errstr] = msg
        return this.handleResponse(asyncID, result, errstr)
      }
    }
  }

  private handleRequest (asyncID: string, method: string, args: any, cfg: any) {
    this.invoker(method, args, cfg).then(result => {
      this.send([asyncID, result, null])
    }).catch(error => {
      this.send([asyncID, null, error.toString()])
    })
  }

  private handleResponse (asyncID: string, result: any, errstr: any) {
    const cb = this.cbs.get(asyncID)
    if (!cb) {
      console.log(`Missed response: ${asyncID}`)
      return
    }
    if (typeof errstr === 'string') return cb(result, new Error(errstr))
    return cb(result)
  }

  private send (msg: any) {
    this.conn.emit('rpc', msg)
  }
}
