import { join } from 'path'
import { readFileSync } from 'fs'
import { Plugin } from './host'

const pluginDir = join(__dirname, '..', '..', 'plugins')
const pluginPackage = join(pluginDir, 'package.json')
const pkg = JSON.parse(readFileSync(pluginPackage).toString())

for (const id in pkg.dependencies) {
  console.log(`Plugin: load ${id} version ${pkg.dependencies[id]}`)
  const plugin = new Plugin(id)
  plugin.active()
}
