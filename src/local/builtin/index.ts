import { RPCHost, Invoker } from '@/shared/rpcbase'
import { getCliArgs, getProcessInfo, getSystemInfo, endpoints } from './misc'

export class BuiltinHost extends RPCHost {
  private fns: Map<string, (args: any, cfg: any) => any>

  constructor (invoker: Invoker) {
    super(invoker)
    this.fns = new Map()

    this.register('cli_args', getCliArgs)
    this.register('process', getProcessInfo)
    this.register('system', getSystemInfo)
    this.register('endpoints', endpoints)
    this.register('list_builtins', () => [...this.fns.keys()])
  }

  async invoke (method: string, args: any, cfg: any) {
    const fn = this.fns.get(method)
    if (!fn) throw new Error('Method not found')
    return fn(args, cfg)
  }

  register (name: string, fn: (args: any, cfg: any) => any) {
    if (this.fns.has(name)) throw new Error('Duplicate registeration')
    this.fns.set(name, fn.bind(this))
  }
}
