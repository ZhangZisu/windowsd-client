import { join } from 'path'
import { homedir } from 'os'
import { readFileSync, existsSync, readdirSync } from 'fs'

export const pluginDir = join(homedir(), '.windowsd', 'client', 'plugins')
const nodeModules = join(pluginDir, 'node_modules')
const extraDir = join(pluginDir, 'extra')

interface IPluginList {
  [name: string]: string
}

export const pluginList = (): IPluginList => {
  const pkg = JSON.parse(readFileSync(join(pluginDir, 'package.json')).toString()).dependencies
  if (existsSync(extraDir)) {
    const extras = readdirSync(extraDir)
    for (const extra of extras) {
      pkg[extra] = 'EXTRA'
    }
  }
  return pkg
}

export function load (id: string) {
  let pluginPath = join(nodeModules, id)
  if (!existsSync(pluginPath)) {
    pluginPath = join(extraDir, id)
    if (!existsSync(pluginPath)) {
      throw new Error(`Plugin ${id} is not installed`)
    }
  }
  const pluginPackage = join(pluginPath, 'package.json')
  if (!existsSync(pluginPackage)) throw new Error(`Plugin ${id} is not valid`)
  const pkg = JSON.parse(readFileSync(pluginPackage).toString())
  const mainPath = join(pluginPath, pkg.main || 'index.js')
  return {
    mainPath,
    id
  }
}
