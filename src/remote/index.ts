import io from 'socket.io-client'
import chalk from 'chalk'
import uuid from 'uuid/v4'
import { machineIdSync } from 'node-machine-id'

import { RPCHost, Invoker, IRPCConfig } from '@/shared/rpcbase'
import { cliArgs } from '@/shared/cli'
import { logRemoteIO } from '@/shared/logger'
import { bus } from '@/shared/bus'
import { createError } from '@/shared/error'

const machineID = machineIdSync()

export class RemoteHost extends RPCHost {
  private conn: SocketIOClient.Socket
  private cbs: Map<string, (error?: Error, result?: any) => void> = new Map()

  constructor (invoker: Invoker) {
    super(invoker)
    this.conn = io(cliArgs.server, { query: { deviceID: cliArgs.device, token: machineID } })
    this.conn.on('connect', () => {
      logRemoteIO(chalk.green('Connected'))
    })

    this.conn.on('error', (e: any) => {
      logRemoteIO(chalk.red('Error'))
      logRemoteIO(e)
      if (e === 'Bad Device') {
        process.exit(1)
      }
    })

    this.conn.on('disconnect', () => {
      logRemoteIO(chalk.yellow('Disconnected'))
    })

    this.conn.on('rpc', this.handle.bind(this))

    this.conn.on('system', (...msg: any) => bus.emit('system', ...msg))
  }

  invoke (method: string, args: any, cfg: IRPCConfig) {
    return new Promise((resolve, reject) => {
      const asyncID = uuid()
      this.cbs.set(asyncID, (error, result) => {
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
        return this.handleRequest(asyncID, method, args, { local: true, ...cfg })
      } else if (msg.length === 3) {
        // Response
        const [asyncID, result, errstr] = msg
        return this.handleResponse(asyncID, result, errstr)
      }
    }
  }

  private handleRequest (asyncID: string, method: string, args: any, cfg: IRPCConfig) {
    this.invoker(method, args, cfg).then(result => {
      this.send([asyncID, result, null])
    }).catch(error => {
      this.send([asyncID, null, error.toString()])
    })
  }

  private handleResponse (asyncID: string, result: any, errstr: any) {
    const cb = this.cbs.get(asyncID)
    if (!cb) {
      logRemoteIO(`Missed response: ${asyncID}`)
      return
    }
    if (typeof errstr === 'string') return cb(createError(errstr), result)
    return cb(undefined, result)
  }

  private send (msg: any) {
    this.conn.emit('rpc', msg)
  }
}
