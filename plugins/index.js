// @ts-check

const path = require('path')
const fs = require('fs')

const base = path.join(__dirname, 'node_modules')

/**
 * @param {string} id
 * @returns {{mainPath: string, id: string}}
 */
module.exports = function (id) {
  const pluginPath = path.join(base, id)
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
