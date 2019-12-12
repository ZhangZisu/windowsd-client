import { RemoteHost } from '@/remote'
import { LocalHost } from '@/local'
import { cliArgs } from '@/cli'

export const remoteHost = new RemoteHost(<any>invoke)
export const localHost = new LocalHost(<any>invoke)

export async function invoke (method: string, args: any, cfg: any) {
  if (cfg.local || (typeof cfg.target === 'string' && cfg.target === cliArgs.device)) {
    return localHost.invoke(method, args, cfg)
  } else {
    return remoteHost.invoke(method, args, cfg)
  }
}
