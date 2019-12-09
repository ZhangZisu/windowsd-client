import { load, dependencies, pluginDir } from '../../plugins'
import { Worker } from 'worker_threads'
import uuid from 'uuid/v4'
import { cliArgs } from '../cli'
import { invokeRemote } from '../rpc/host'
import chalk from 'chalk'
import { promisify } from 'util'
import { exec } from 'child_process'
import { outPrefix, errPrefix, additionalNPMArgs } from './misc'

const execAsync = promisify(exec)
const logPrefix = chalk.bgBlue.black('Plugin', 'Host')

const activePlugins: Map<string, Plugin> = new Map()
const loadedPlugins: Map<string, Plugin> = new Map()

interface IContext {
  //
}

type PluginCb = (result: any, error?: Error) => void
type LocalFn = (args: any, context: IContext) => any
const cbs: Map<string, PluginCb> = new Map()
const fns: Map<string, LocalFn> = new Map()

export class Plugin {
  id: string

  private mainPath: string
  private worker?: Worker
  private logPrefix: string

  constructor (id: string) {
    const info = load(id)
    this.mainPath = info.mainPath
    this.id = info.id
    loadedPlugins.set(this.id, this)
    this.logPrefix = chalk.bgBlueBright.black('Plugin', id)
  }

  active () {
    if (this.worker) throw new Error('Plugin is actived')
    this.worker = new Worker(this.mainPath, { stdin: false, stdout: true })
    this.worker.on('message', this.handler.bind(this))
    activePlugins.set(this.id, this)
    console.log(this.logPrefix, 'Actived')
  }

  deactive () {
    if (!this.worker) throw new Error('Plugin is not actived')
    this.worker.terminate()
    this.worker = undefined
    activePlugins.delete(this.id)
    console.log(this.logPrefix, 'Deactived')
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
      case 'RPCRequest': return this.handleRPCRequest(msg.asyncID, msg.method, msg.args, msg.cfg)
      case 'RPCResponse': return this.handleRPCResponse(msg.asyncID, msg.result, msg.error)
      case 'log': return this.handleLog(msg.data)
    }
  }

  private handleLog (data: any) {
    console.log(this.logPrefix, ...data)
  }

  private handleRPCRequest (asyncID: string, method: string, args: any, cfg: any) {
    let p: Promise<any>
    if (cfg.local || (typeof cfg.target === 'string' && cfg.target === cliArgs.device)) {
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
    if (typeof errstr === 'string') return cb(result, new Error(errstr))
    return cb(result)
  }
}

/**
 *  invoke a local function \
 *  if method is like 'plugin:method', it'll
 *  create a Plugin RPC Call into the target plugin \
 *  otherwise it'll directly handle the request
 * @param method
 * @param args
 * @param cfg
 */
export async function invokeLocal (method: string, args: any, cfg: any) {
  const fp = method.indexOf(':')
  if (fp === -1) {
    const fn = fns.get(method)
    if (!fn) throw new Error('No such method')
    return Promise.resolve(fn(args, {}))
  } else {
    const pluginID = method.substring(0, fp)
    const realMethod = method.substring(fp + 1)
    const plugin = activePlugins.get(pluginID)
    if (!plugin) throw new Error('Plugin is not actived')
    return plugin.invoke(realMethod, args, cfg)
  }
}

export function register (name: string, fn: LocalFn) {
  if (fns.has(name)) throw new Error('Duplicate method registeration')
  fns.set(name, fn)
  console.log(logPrefix, 'fn:', name)
}

let maintance = true
const activeBackup: Set<string> = new Set()

export async function enableMaintance () {
  if (maintance) throw new Error('Already in maintance mode')
  maintance = true
  for (const [v, k] of activePlugins) {
    activeBackup.add(v)
    k.deactive()
  }
  activePlugins.clear()
  loadedPlugins.clear()
  console.log(logPrefix, 'Enter maintance mode')
}

export async function disableMaintance () {
  if (!maintance) throw new Error('Not in maintance mode')
  maintance = false
  const cmd = ['npm', 'i', ...additionalNPMArgs].join(' ')
  const { stderr, stdout } = await execAsync(cmd, { cwd: pluginDir })
  stdout.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, outPrefix, v))
  stderr.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, errPrefix, v))
  const dep = dependencies()
  for (const id in dep) {
    console.log(logPrefix, `+${id}@${dep[id]}`)
    const plugin = new Plugin(id)
    if (activeBackup.has(id)) {
      plugin.active()
    }
  }
  activeBackup.clear()
  console.log(logPrefix, 'Exit maintance mode')
}

export function isMaintance () {
  return maintance
}

export function listPlugins () {
  return [...loadedPlugins.keys()]
}

export function activePlugin (id: string) {
  const plugin = loadedPlugins.get(id)
  if (!plugin) throw new Error('Target is not loaded')
  plugin.active()
}

export function deactivePlugin (id: string) {
  const plugin = loadedPlugins.get(id)
  if (!plugin) throw new Error('Target is not loaded')
  plugin.deactive()
}

disableMaintance()

register('enable_maintance', enableMaintance)
register('disable_maintance', disableMaintance)
register('is_maintance', isMaintance)
register('list_plugins', listPlugins)
register('active_plugin', async function (args) {
  const { id } = args
  if (typeof id !== 'string') throw new Error('Bad Arg: id')
  return activePlugin(id)
})
register('deactive_plugin', async function (args) {
  const { id } = args
  if (typeof id !== 'string') throw new Error('Bad Arg: id')
  return deactivePlugin(id)
})
