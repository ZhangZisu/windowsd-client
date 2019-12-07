import { cpus, freemem, hostname, networkInterfaces } from 'os'
import { register } from '../plugin/host'

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
