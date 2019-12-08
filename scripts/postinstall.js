const os = require('os')
const path = require('path')
const fs = require('fs')

const home = os.homedir()
const dataDir = path.join(home, '.windowsd')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
const clientDir = path.join(dataDir, 'client')
if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir)
const pluginDir = path.join(clientDir, 'plugins')
if (!fs.existsSync(pluginDir)) {
  fs.mkdirSync(pluginDir)
  fs.copyFileSync(path.join(__dirname, '..', 'plugins', 'package-example.json'), path.join(pluginDir, 'package.json'))
  console.log('Create plugin dir', pluginDir)
} else {
  console.log('Plugin dir found', pluginDir)
}
