import chalk from 'chalk'
import { sync } from '@zhangzisu/in-gfw'
import { promisify } from 'util'
import { exec } from 'child_process'

import { logMisc } from '@/shared/logger'

export const outPrefix = chalk.green('STDOUT')
export const errPrefix = chalk.red('STDERR')

export const additionalNPMArgs = process.env.IN_GFW || sync() ? ['--registry=https://registry.npm.taobao.org'] : []

logMisc('npm args', ...additionalNPMArgs)

export const execAsync = promisify(exec)
