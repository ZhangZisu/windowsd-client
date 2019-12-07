const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'plugins')
const o = path.join(root, 'package.json')
const d = path.join(root, 'package-tmp.json')

fs.unlinkSync(o)
fs.renameSync(d, o)
