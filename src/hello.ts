import { readFileSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'

const version = JSON.parse(readFileSync(join(__dirname, '..', 'package.json')).toString()).version
console.log('Windowsd™ Client', chalk.green(version))
