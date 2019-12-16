import yargs from 'yargs'
import { hostname } from 'os'

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
  .option('pluginExtra', {
    default: [],
    type: 'array'
  })
  .argv
