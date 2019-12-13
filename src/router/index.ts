import { RemoteHost } from '@/remote'
import { LocalHost } from '@/local'
import { cliArgs } from '@/shared/cli'

export const remoteHost = new RemoteHost(<any>invoke)
export const localHost = new LocalHost(<any>invoke)

export let startupDone: () => void

const pendingStartup = new Promise(resolve => {
  startupDone = resolve
})

export async function invoke (method: string, args: any, cfg: any) {
  await pendingStartup
  if (cfg.local || (typeof cfg.target === 'string' && cfg.target === cliArgs.device)) {
    return localHost.invoke(method, args, cfg)
  } else {
    return remoteHost.invoke(method, args, cfg)
  }
}
