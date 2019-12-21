import yargs from 'yargs'
import { hostname, homedir } from 'os'
import { join } from 'path'

export const cliArgs = yargs
  .option('api', {
    default: 5000,
    demandOption: true,
    type: 'number'
  })
  .option('device', {
    demandOption: true,
    type: 'string'
  })
  .option('server', {
    default: 'https://windowsd.herokuapp.com/',
    demandOption: true,
    type: 'string'
  })
  .option('hostname', {
    default: hostname(),
    type: 'string'
  })
  .option('pluginDir', {
    default: join(homedir(), '.windowsd', 'client', 'plugins'),
    type: 'string'
  })
  .argv
