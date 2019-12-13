import { join } from 'path'
import { homedir } from 'os'
import { readFileSync, existsSync } from 'fs'

export const pluginDir = join(homedir(), '.windowsd', 'client', 'plugins')
const nodeModules = join(pluginDir, 'node_modules')

export const dependencies = () =>
  JSON.parse(readFileSync(join(pluginDir, 'package.json')).toString()).dependencies

export function load (id:string) {
  const pluginPath = join(nodeModules, id)
  if (!existsSync(pluginPath)) throw new Error(`Plugin ${id} is not installed`)
  const pluginPackage = join(pluginPath, 'package.json')
  if (!existsSync(pluginPackage)) throw new Error(`Plugin ${id} is not valid`)
  const pkg = JSON.parse(readFileSync(pluginPackage).toString())
  const mainPath = join(pluginPath, pkg.main || 'index.js')
  return {
    mainPath,
    id
  }
}
