import { exec } from 'child_process'
import { register, enableMaintance, disableMaintance } from './host'
import { pluginDir } from '../../plugins'
import { promisify } from 'util'
import { outPrefix, errPrefix } from './misc'
import chalk = require('chalk')

const execAsync = promisify(exec)

export async function installPlugins (args: any) {
  const plugins: string[] = args.plugins
  if (!(plugins instanceof Array)) throw new Error('Bad Arg: plugins')
  await enableMaintance()
  const cmd = ['npm', 'i', '--save', '--registry=https://registry.npm.taobao.org', plugins].join(' ')
  const { stdout, stderr } = await execAsync(cmd, { cwd: pluginDir })
  await disableMaintance()
  const logPrefix = chalk.bgBlue.black('Plugin', 'Install')
  stdout.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, outPrefix, v))
  stderr.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, errPrefix, v))
}

export async function uninstallPlugins (args: any) {
  const plugins: string[] = args.plugins
  if (!(plugins instanceof Array)) throw new Error('Bad Arg: plugins')
  await enableMaintance()
  const cmd = ['npm', 'r', '--save', '--registry=https://registry.npm.taobao.org', plugins].join(' ')
  const { stdout, stderr } = await execAsync(cmd, { cwd: pluginDir })
  await disableMaintance()
  const logPrefix = chalk.bgBlue.black('Plugin', 'Uninstall')
  stdout.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, outPrefix, v))
  stderr.split('\n').filter(v => v.length).forEach(v => console.log(logPrefix, errPrefix, v))
}

register('install_plugin', installPlugins)
register('uninstall_plugin', uninstallPlugins)
