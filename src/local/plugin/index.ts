import { RPCHost, Invoker } from '@/shared/rpcbase'
import { load } from 'plugins'
import { Worker } from 'worker_threads'
import uuid from 'uuid/v4'
import { logPluginInstance } from '@/shared/logger'

export class Plugin extends RPCHost {
  public id: string
  private mainPath: string
  private worker?: Worker
  private cbs: Map<string, (result: any, error?: Error) => void>
  private activePlugins: Map<string, Plugin>
  private loadedPlugins: Map<string, Plugin>

  constructor (id: string, activePlugins:Map<string, Plugin>, loadedPlugins:Map<string, Plugin>, invoker: Invoker) {
    super(invoker)
    const info = load(id)
    this.mainPath = info.mainPath
    this.id = info.id
    this.cbs = new Map()
    this.activePlugins = activePlugins
    this.loadedPlugins = loadedPlugins
    this.loadedPlugins.set(this.id, this)
  }

  active () {
    if (this.worker) throw new Error('Plugin is actived')
    this.worker = new Worker(this.mainPath, { stdin: false, stdout: true })
    this.worker.on('message', this.handler.bind(this))
    this.activePlugins.set(this.id, this)
    logPluginInstance(this.id, 'Actived')
  }

  deactive () {
    if (!this.worker) throw new Error('Plugin is not actived')
    this.worker.terminate()
    this.worker = undefined
    this.activePlugins.delete(this.id)
    logPluginInstance(this.id, 'Deactived')
  }

  invoke (method: string, args: any, cfg: any) {
    return new Promise((resolve, reject) => {
      if (!this.worker) return reject(new Error('Not actived'))
      const asyncID = uuid()
      this.cbs.set(asyncID, (result, error) => {
        this.cbs.delete(asyncID)
        if (error) return reject(error)
        return resolve(result)
      })
      this.worker.postMessage({ type: 'RPCRequest', asyncID, method, args, cfg })
    })
  }

  private handler (msg: any) {
    switch (msg.type) {
      case 'RPCRequest': return this.handleRPCRequest(msg.asyncID, msg.method, msg.args, msg.cfg)
      case 'RPCResponse': return this.handleRPCResponse(msg.asyncID, msg.result, msg.error)
      case 'log': return this.handleLog(msg.data)
    }
  }

  private handleLog (data: any) {
    logPluginInstance(this.id, ...data)
  }

  private handleRPCRequest (asyncID: string, method: string, args: any, cfg: any) {
    this.invoker(method, args, cfg).then(result => {
      this.worker && this.worker.postMessage({
        asyncID,
        type: 'RPCResponse',
        result
      })
    }).catch(error => {
      this.worker && this.worker.postMessage({
        asyncID,
        type: 'RPCResponse',
        error: error.toString()
      })
    })
  }

  private handleRPCResponse (asyncID: string, result: any, errstr: any) {
    const cb = this.cbs.get(asyncID)
    if (!cb) {
      logPluginInstance(this.id, `Missed response: ${asyncID}`)
      return
    }
    if (typeof errstr === 'string') return cb(result, new Error(errstr))
    return cb(result)
  }
}
