import chalk from 'chalk'
import { sync } from '@zhangzisu/in-gfw'

export const outPrefix = chalk.green('STDOUT')
export const errPrefix = chalk.red('STDERR')

export const additionalNPMArgs = process.env.IN_GFW || sync() ? ['--registry=https://registry.npm.taobao.org'] : []

console.log(chalk.bgBlue.black('Plugin'), 'npm args', ...additionalNPMArgs)
