// @ts-check

const path = require('path')
const fs = require('fs')
const os = require('os')
const chalk = require('chalk')

let base = __dirname
// @ts-ignore
if (global.installMode === 'npm') {
  console.log(chalk.bgYellowBright.black('Installed by: NPM'))
  base = path.join(os.homedir(), '.windowsd', 'client', 'plugins')
}

console.log(chalk.blue('Plugin Loader'), base)

const nodeModules = path.join(base, 'node_modules')

exports.pluginDir = base
exports.dependencies = JSON.parse(fs.readFileSync(path.join(base, 'package.json')).toString()).dependencies

/**
 * @param {string} id
 * @returns {{mainPath: string, id: string}}
 */
exports.load = function (id) {
  const pluginPath = path.join(nodeModules, id)
  if (!fs.existsSync(pluginPath)) throw new Error(`Plugin ${id} is not installed`)
  const pluginPackage = path.join(pluginPath, 'package.json')
  if (!fs.existsSync(pluginPackage)) throw new Error(`Plugin ${id} is not valid`)
  const package = JSON.parse(fs.readFileSync(pluginPackage).toString())
  const mainPath = path.join(pluginPath, package.main || 'index.js')
  return {
    mainPath,
    id
  }
}
