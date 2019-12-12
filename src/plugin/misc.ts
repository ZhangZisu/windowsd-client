import chalk from 'chalk'
import { sync } from '@zhangzisu/in-gfw'
import { logPluginMisc } from '@/misc/logger'

export const outPrefix = chalk.green('STDOUT')
export const errPrefix = chalk.red('STDERR')

export const additionalNPMArgs = process.env.IN_GFW || sync() ? ['--registry=https://registry.npm.taobao.org'] : []

logPluginMisc('npm args', ...additionalNPMArgs)
