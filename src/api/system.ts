import { cpus, freemem, hostname, networkInterfaces } from 'os'

import { register } from '@/plugin/host'
import { cliArgs } from '@/cli'

register('process_info', function () {
  return {
    env: process.env,
    cwd: process.cwd(),
    versions: process.versions,
    uptime: process.uptime(),
    arch: process.arch,
    platform: process.platform,
    argv: process.argv
  }
})

register('system_info', function () {
  return {
    cpus: cpus(),
    mem: freemem(),
    hostname: hostname(),
    network: networkInterfaces()
  }
})

register('endpoints', function () {
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
})
