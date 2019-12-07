import { exec } from 'child_process'
import { pluginDir } from './vars'
import { register, enableMaintance, disableMaintance } from './host'
import chalk = require('chalk')

const outPrefix = chalk.green('STDOUT')
const errPrefix = chalk.red('STDERR')

export function installPlugins (args: any) {
  return new Promise<void>((resolve, reject) => {
    const plugins: string[] = args.plugins
    if (!(plugins instanceof Array)) return reject(new Error('Bad Arg: plugins'))
    enableMaintance()
    const cmd = ['npm', 'i', '--save', '--registry=https://registry.npm.taobao.org', plugins].join(' ')
    exec(cmd, { cwd: pluginDir }, (err, stdout, stderr) => {
      disableMaintance()
      if (err) return reject(err)
      const logPrefix = chalk.bgBlue.black('Plugin', 'Install')
      stdout.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, outPrefix, v))
      stderr.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, errPrefix, v))
      return resolve()
    })
  })
}

export function uninstallPlugins (args: any) {
  return new Promise<void>((resolve, reject) => {
    const plugins: string[] = args.plugins
    if (!(plugins instanceof Array)) return reject(new Error('Bad Arg: plugins'))
    enableMaintance()
    const cmd = ['npm', 'r', '--save', '--registry=https://registry.npm.taobao.org', plugins].join(' ')
    exec(cmd, { cwd: pluginDir }, (err, stdout, stderr) => {
      disableMaintance()
      if (err) return reject(err)
      const logPrefix = chalk.bgBlue.black('Plugin', 'Uninstall')
      stdout.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, outPrefix, v))
      stderr.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, errPrefix, v))
      return resolve()
    })
  })
}

register('install_plugin', installPlugins)
register('uninstall_plugin', uninstallPlugins)
