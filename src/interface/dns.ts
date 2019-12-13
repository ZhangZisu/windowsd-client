import { invoke } from '@/router'
import { cliArgs } from '@/shared/cli'
import { setDNS } from '@/shared/dns'
import { bus } from '@/shared/bus'
import { logDNS, beautifyUUID } from '@/shared/logger'

export async function updateDNS (id: string) {
  const { k, v } = <any> await invoke('dns_upd', { k: cliArgs.hostname, v: cliArgs.device }, { target: id })
  setDNS(k, v)
}

bus.on('system', (msg) => {
  if (msg.event === 'online') {
    const deviceID = <string>msg.deviceID
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateDNS(deviceID).catch(() => {
      logDNS(beautifyUUID(deviceID), 'DNS Update failed')
    })
  }
})
