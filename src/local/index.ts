import { pluginList } from '@/shared/plugin'
import { RPCHost, Invoker } from '@/shared/rpcbase'
import { logPluginHost } from '@/shared/logger'
import { additionalNPMArgs, execAsync } from '@/shared/misc'
import { Plugin } from '@/local/plugin'
import { BuiltinHost } from '@/local/builtin'
import { cliArgs } from '@/shared/cli'

export class LocalHost extends RPCHost {
  builtin: BuiltinHost

  private activePlugins: Map<string, Plugin>
  private loadedPlugins: Map<string, Plugin>
  private maintance:boolean
  private activeBackup: Set<string>

  constructor (invoker: Invoker) {
    super(invoker)
    this.builtin = new BuiltinHost(invoker)
    this.activePlugins = new Map()
    this.loadedPlugins = new Map()
    this.maintance = true
    this.activeBackup = new Set()

    this.builtin.register('enable_maintance', this.enableMaintance.bind(this))
    this.builtin.register('disable_maintance', async (args) => {
      const { loadAll } = args
      if (typeof loadAll !== 'boolean') throw new Error('Bad Arg: loadAll')
      return this.disableMaintance(loadAll)
    })
    this.builtin.register('is_maintance', this.isMaintance.bind(this))
    this.builtin.register('list_loaded', this.listLoadedPlugins.bind(this))
    this.builtin.register('list_active', this.listActivePlugins.bind(this))
    this.builtin.register('active_plugin', async (args) => {
      const { id } = args
      if (typeof id !== 'string') throw new Error('Bad Arg: id')
      return this.activePlugin(id)
    })
    this.builtin.register('deactive_plugin', async (args) => {
      const { id } = args
      if (typeof id !== 'string') throw new Error('Bad Arg: id')
      return this.deactivePlugin(id)
    })
    this.builtin.register('install_plugin', this.installPlugins.bind(this))
    this.builtin.register('uninstall_plugin', this.uninstallPlugins.bind(this))
  }

  invoke (method:string, args:any, cfg:any) {
    const fp = method.indexOf(':')
    if (fp === -1) {
      return this.builtin.invoke(method, args, cfg)
    } else {
      const pluginID = method.substring(0, fp)
      const realMethod = method.substring(fp + 1)
      const plugin = this.activePlugins.get(pluginID)
      if (!plugin) throw new Error('Plugin is not actived')
      return plugin.invoke(realMethod, args, cfg)
    }
  }

  async enableMaintance () {
    if (this.maintance) throw new Error('Already in maintance mode')
    this.maintance = true
    for (const [v, k] of this.activePlugins) {
      this.activeBackup.add(v)
      await k.deactive()
    }
    this.activePlugins.clear()
    this.loadedPlugins.clear()
    logPluginHost('Enter maintance mode')
  }

  async disableMaintance (loadAll: boolean) {
    if (!this.maintance) throw new Error('Not in maintance mode')
    this.maintance = false
    const cmd = ['npm', 'i', ...additionalNPMArgs].join(' ')
    await execAsync(cmd, { cwd: cliArgs.pluginDir })
    const dep = pluginList()
    for (const id in dep) {
      logPluginHost(`+${id}@${dep[id]}`)
      const plugin = new Plugin(id, this.activePlugins, this.loadedPlugins, this.invoker)
      if (loadAll || this.activeBackup.has(id)) {
        plugin.active()
      }
    }
    this.activeBackup.clear()
    logPluginHost('Exit maintance mode')
  }

  async isMaintance () {
    return this.maintance
  }

  listLoadedPlugins () {
    return [...this.loadedPlugins.keys()]
  }

  listActivePlugins () {
    return [...this.activePlugins.keys()]
  }

  activePlugin (id: string) {
    const plugin = this.loadedPlugins.get(id)
    if (!plugin) throw new Error('Target is not loaded')
    plugin.active()
  }

  async deactivePlugin (id: string) {
    const plugin = this.loadedPlugins.get(id)
    if (!plugin) throw new Error('Target is not loaded')
    await plugin.deactive()
  }

  async installPlugins (args: any) {
    const plugins: string[] = args.plugins
    if (!(plugins instanceof Array)) throw new Error('Bad Arg: plugins')
    await this.enableMaintance()
    const cmd = ['npm', 'i', '--save', ...additionalNPMArgs, ...plugins].join(' ')
    await execAsync(cmd, { cwd: cliArgs.pluginDir })
    await this.disableMaintance(false)
  }

  async uninstallPlugins (args: any) {
    const plugins: string[] = args.plugins
    if (!(plugins instanceof Array)) throw new Error('Bad Arg: plugins')
    await this.enableMaintance()
    const cmd = ['npm', 'r', '--save', ...additionalNPMArgs, ...plugins].join(' ')
    await execAsync(cmd, { cwd: cliArgs.pluginDir })
    await this.disableMaintance(false)
  }
}
