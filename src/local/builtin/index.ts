import { RPCHost, Invoker, IRPCConfig } from '@/shared/rpcbase'
import { _getCliArgs, _getProcessInfo, _getSystemInfo, _endpoints, _updateDNS, _resolveDNS } from './misc'

export class BuiltinHost extends RPCHost {
  private fns: Map<string, (args: any, cfg: IRPCConfig) => any>

  constructor (invoker: Invoker) {
    super(invoker)
    this.fns = new Map()

    this.register('cli_args', _getCliArgs.bind(this))
    this.register('process', _getProcessInfo.bind(this))
    this.register('system', _getSystemInfo.bind(this))
    this.register('endpoints', _endpoints.bind(this))
    this.register('dns_upd', _updateDNS.bind(this))
    this.register('dns_res', _resolveDNS.bind(this))
    this.register('list_builtins', () => [...this.fns.keys()])
  }

  async invoke (method: string, args: any, cfg: IRPCConfig) {
    const fn = this.fns.get(method)
    if (!fn) throw new Error('Method not found')
    return fn(args, cfg)
  }

  register (name: string, fn: (args: any, cfg: IRPCConfig) => any) {
    if (this.fns.has(name)) throw new Error('Duplicate registeration')
    this.fns.set(name, fn)
  }
}
