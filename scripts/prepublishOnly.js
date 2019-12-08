const cp = require('child_process')

console.log(cp.execSync('tsc').toString())

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'plugins')
const o = path.join(root, 'package.json')
const t = path.join(root, 'package-example.json')
const d = path.join(root, 'package-tmp.json')

fs.renameSync(o, d)
fs.copyFileSync(t, o)
