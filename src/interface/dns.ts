import { invoke } from '@/router'
import { cliArgs } from '@/shared/cli'
import { setDNS } from '@/shared/dns'

export async function updateDNS (id: string) {
  const { k, v } = <any> await invoke('dns_upd', { k: cliArgs.hostname, v: cliArgs.device }, { target: id })
  setDNS(k, v)
}
