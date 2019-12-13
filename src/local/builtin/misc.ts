import { cpus, freemem, hostname, networkInterfaces } from 'os'

import { cliArgs } from '@/shared/cli'
import { setDNS, resolveDNS } from '@/shared/dns'

export function _getCliArgs () {
  return cliArgs
}

export function _getProcessInfo () {
  return {
    env: process.env,
    cwd: process.cwd(),
    versions: process.versions,
    uptime: process.uptime(),
    arch: process.arch,
    platform: process.platform,
    argv: process.argv
  }
}

export function _getSystemInfo () {
  return {
    cpus: cpus(),
    mem: freemem(),
    hostname: hostname(),
    network: networkInterfaces()
  }
}

export function _endpoints () {
  const interfaces = networkInterfaces()
  const endpoints = []
  for (const name in interfaces) {
    const infos = interfaces[name]
    for (const info of infos) {
      if (info.family === 'IPv6') {
        endpoints.push(`[${info.address}]:${cliArgs.api}`)
      } else {
        endpoints.push(`${info.address}:${cliArgs.api}`)
      }
    }
  }
  return endpoints
}

export async function _updateDNS (args: any) {
  const { k, v } = args
  if (typeof k !== 'string') throw new Error('Bad Arg: k')
  if (typeof v !== 'string') throw new Error('Bad Arg: v')
  setDNS(k, v)
  return { k: cliArgs.hostname, v: cliArgs.device }
}

export function _resolveDNS (args: any) {
  const { name } = args
  if (typeof name !== 'string') throw new Error('Bad Arg: name')
  return resolveDNS(name)
}
