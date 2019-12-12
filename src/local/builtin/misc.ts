import { cpus, freemem, hostname, networkInterfaces } from 'os'
import { cliArgs } from '@/cli'

export function getCliArgs () {
  return {
    device: cliArgs.device
  }
}

export function getProcessInfo () {
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

export function getSystemInfo () {
  return {
    cpus: cpus(),
    mem: freemem(),
    hostname: hostname(),
    network: networkInterfaces()
  }
}

export function endpoints () {
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
