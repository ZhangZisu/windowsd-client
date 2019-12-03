import io from 'socket.io'
import { cliArgs } from '../cli'
import chalk from 'chalk'

const logPrefix = chalk.underline.bgYellow.black('API'.padEnd(8), 'IO')

export const instance = io(cliArgs.api)
console.log(logPrefix, 'listening on', chalk.green(cliArgs.api))
