import pluginLoader from '../../plugins'
import { Worker } from 'worker_threads'
import uuid from 'uuid/v4'
import { cliArgs } from '../cli'
import { invokeRemote } from '../rpc/host'

const activePlugins: Map<string, Plugin> = new Map()
const loadedPlugins: Map<string, Plugin> = new Map()

type PluginCb = (result: any, error?: Error) => void
const cbs : Map<string, PluginCb> = new Map()

export class Plugin {
  id: string

  private mainPath: string
  private worker?: Worker

  constructor (id: string) {
    const info = pluginLoader(id)
    this.mainPath = info.mainPath
    this.id = info.id
    loadedPlugins.set(this.id, this)
  }

  active () {
    if (this.worker) throw new Error('Plugin is actived')
    this.worker = new Worker(this.mainPath)
    this.worker.on('message', this.handler.bind(this))
    activePlugins.set(this.id, this)
  }

  deactive () {
    if (!this.worker) throw new Error('Plugin is not actived')
    this.worker.terminate()
    this.worker = undefined
    activePlugins.delete(this.id)
  }

  invoke (method: string, args: any, cfg: any) {
    return new Promise((resolve, reject) => {
      if (!this.worker) return reject(new Error('Not actived'))
      const asyncID = uuid()
      cbs.set(asyncID, (result, error) => {
        cbs.delete(asyncID)
        if (error) return reject(error)
        return resolve(result)
      })
      this.worker.postMessage({ type: 'RPCRequest', asyncID, method, args, cfg })
    })
  }

  private handler (msg: any) {
    switch (msg.type) {
      case 'RPCRequest':return this.handleRPCRequest(msg.asyncID, msg.method, msg.args, msg.cfg)
      case 'RPCResponse':return this.handleRPCResponse(msg.asyncID, msg.result, msg.error)
    }
  }

  private handleRPCRequest (asyncID: string, method: string, args: any, cfg: any) {
    let p: Promise<any>
    if (typeof cfg.target === 'string' && cfg.target === cliArgs.device) {
      p = invokeLocal(method, args, cfg)
    } else {
      p = invokeRemote(method, args, cfg)
    }
    p.then(result => {
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
    const cb = cbs.get(asyncID)
    if (!cb) {
      console.log(`Missed response: ${asyncID}`)
      return
    }
    if (typeof errstr === 'string') cb(result, new Error(errstr))
    return cb(result)
  }
}

/**
 *  invoke a local function \
 *  if method is like 'plugin:method', it'll
 *  create a Plugin RPC Call into the target plugin \
 *  otherwise it'll directly handle the request (TODO)
 * @param method
 * @param args
 * @param cfg
 */
export async function invokeLocal (method: string, args: any, cfg: any) {
  const fp = method.indexOf(':')
  if (fp === -1) {
    // TODO
  } else {
    const pluginID = method.substring(0, fp)
    const realMethod = method.substring(fp + 1)
    const plugin = activePlugins.get(pluginID)
    if (!plugin) throw new Error('Plugin is not actived')
    return plugin.invoke(realMethod, args, cfg)
  }
}
