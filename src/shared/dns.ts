import { isUUID } from '@/shared/regexp'
import { logDNS } from './logger'

const hosts: Map<string, string> = new Map()

export function setDNS (k: string, v: string) {
  hosts.set(k, v)
  logDNS(k, '=>', v)
}

export function resolveDNS (name: string) {
  if (isUUID.test(name)) {
    return name
  }
  return hosts.get(name)
}
