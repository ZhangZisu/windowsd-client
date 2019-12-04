import pluginLoader from '../../plugins'
import { Worker } from 'worker_threads'
import uuid from 'uuid/v4'

const activePlugins: Map<string, Plugin> = new Map()
const loadedPlugins: Map<string, Plugin> = new Map()

type IPluginCb = (result: any, error?: Error) => void

class Plugin {
  id: string

  private mainPath: string
  private worker?: Worker
  private cbs: Map<string, IPluginCb>

  constructor (id: string) {
    const info = pluginLoader(id)
    this.mainPath = info.mainPath
    this.id = info.id
    loadedPlugins.set(this.id, this)
    this.cbs = new Map()
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
      const asyncId = uuid()
      this.cbs.set(asyncId, (result, error) => {
        this.cbs.delete(asyncId)
        if (error) return reject(error)
        return resolve(result)
      })
      this.worker.postMessage({ type: 'RPCRequest', asyncId, method, args, cfg })
    })
  }

  private handler (msg: any) {
    switch (msg.type) {
      case 'RPCRequest':return this.handleRPCRequest()
      case 'RPCResponse':return this.handleRPCResponse()
    }
  }

  private handleRPCRequest () {
    //
  }

  private handleRPCResponse (asyncId, result, errstr) {
  }
}
