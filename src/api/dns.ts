import { register } from '../plugin/host'
import { cliArgs } from '../cli'

const hosts: Map<string, string> = new Map()

register('dns_udp', async function (args) {
  const { k, v } = args
  if (typeof k !== 'string') throw new Error('Bad Arg: k')
  if (typeof v !== 'string') throw new Error('Bad Arg: v')
  hosts.set(k, v)
  return { k: cliArgs.hostname, v: cliArgs.device }
})

export function setDNS (k: string, v: string) {
  hosts.set(k, v)
}

export function resolveDNS (name: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(name)) {
    return name
  }
  return hosts.get(name)
}

register('dns_resolve', async function (args) {
  const { name } = args
  if (typeof name !== 'string') throw new Error('Bad Arg: name')
  return resolveDNS(name)
})
