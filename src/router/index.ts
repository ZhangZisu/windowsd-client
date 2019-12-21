import { RemoteHost } from '@/remote'
import { LocalHost } from '@/local'
import { cliArgs } from '@/shared/cli'
import { IRPCConfig } from '@/shared/rpcbase'

export const remoteHost = new RemoteHost(<any>invoke)
export const localHost = new LocalHost(<any>invoke)

export let startupDone: () => void

const pendingStartup = new Promise(resolve => {
  startupDone = resolve
})

export async function invoke (method: string, args: any, cfg: IRPCConfig) {
  await pendingStartup
  if (cfg.l || (typeof cfg.t === 'string' && cfg.t === cliArgs.device)) {
    return localHost.invoke(method, args, cfg)
  } else {
    return remoteHost.invoke(method, args, cfg)
  }
}
