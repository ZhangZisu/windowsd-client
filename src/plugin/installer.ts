import { exec } from 'child_process'
import { promisify } from 'util'

import { register, enableMaintance, disableMaintance } from '@/plugin/host'
import { outPrefix, errPrefix, additionalNPMArgs } from '@/plugin/misc'
import { logPluginInstaller } from '@/misc/logger'

import { pluginDir } from '@/../plugins'

const execAsync = promisify(exec)

export async function installPlugins (args: any) {
  const plugins: string[] = args.plugins
  if (!(plugins instanceof Array)) throw new Error('Bad Arg: plugins')
  await enableMaintance()
  const cmd = ['npm', 'i', '--save', ...additionalNPMArgs, ...plugins].join(' ')
  const { stdout, stderr } = await execAsync(cmd, { cwd: pluginDir })
  await disableMaintance()
  stdout.split('\n').filter(v => v.length).forEach(v => logPluginInstaller('i', outPrefix, v))
  stderr.split('\n').filter(v => v.length).forEach(v => logPluginInstaller('i', errPrefix, v))
}

export async function uninstallPlugins (args: any) {
  const plugins: string[] = args.plugins
  if (!(plugins instanceof Array)) throw new Error('Bad Arg: plugins')
  await enableMaintance()
  const cmd = ['npm', 'r', '--save', ...additionalNPMArgs, ...plugins].join(' ')
  const { stdout, stderr } = await execAsync(cmd, { cwd: pluginDir })
  await disableMaintance()
  stdout.split('\n').filter(v => v.length).forEach(v => logPluginInstaller('u', outPrefix, v))
  stderr.split('\n').filter(v => v.length).forEach(v => logPluginInstaller('u', errPrefix, v))
}

register('install_plugin', installPlugins)
register('uninstall_plugin', uninstallPlugins)
