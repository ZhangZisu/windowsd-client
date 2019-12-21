import chalk from 'chalk'
import { sync } from '@zhangzisu/in-gfw'
import { promisify } from 'util'
import { exec } from 'child_process'

import { logMisc } from '@/shared/logger'

export const outPrefix = chalk.green('STDOUT')
export const errPrefix = chalk.red('STDERR')

export const additionalNPMArgs = process.env.IN_GFW || sync() ? ['--registry=https://registry.npm.taobao.org'] : []

logMisc('npm args', ...additionalNPMArgs)

const _execAsync = promisify(exec)

function execWrap (command: string, options: any) {
  console.log('$ ' + command)
  return _execAsync(command, options)
}

type fnExec = typeof _execAsync

export const execAsync: fnExec = <any>execWrap
