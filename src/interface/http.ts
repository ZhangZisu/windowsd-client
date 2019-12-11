import { createServer } from 'http'
import { app } from './express'
import { cliArgs } from '../cli'
import chalk from 'chalk'

const logPrefix = chalk.bgYellow.black('Interface HTTP')

export const server = createServer(app)

server.listen(cliArgs.api, () => {
  console.log(logPrefix, server.address())
})
